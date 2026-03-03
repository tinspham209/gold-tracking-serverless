# Vietnamese Gold Tracking Alerts — Implementation Proposal

_Last updated: 2026-03-03_

## 1) Objective

Build a **serverless, stateless** crawler that runs every 2 hours, extracts gold prices from selected Vietnamese suppliers using Playwright, computes in-memory metrics, and sends webhook alerts to **Google Chat** and/or **Telegram**.

## 2) Scope and non-scope

### In scope

- GitHub Actions scheduler (`0 */2 * * *`)
- Node.js + TypeScript + Playwright crawler CLI
- Per-supplier parser modules
- In-memory normalization + metrics (`spread`)
- Webhook notifications (Google Chat, Telegram)
- Fixture-based tests for parsers and formatting

### Out of scope

- Web UI/dashboard
- Backend API service
- Database or persistent storage

## 3) Confirmed source targets

- `https://www.24h.com.vn/gia-vang-hom-nay-c425.html`
  - Target rows: `SJC`, `PNJ Hà Nội`
- `https://kimkhanhviethung.vn/tra-cuu-gia-vang.html`
  - Target row: `Vàng 999.9`
- `https://hoakimnguyen.com/tra-cuu-gia-vang/`
  - Target row: `9999 vĩ`
- `https://ngocthinh-jewelry.vn/pages/bang-gia-vang?srsltid=AfmBOoq5tMd-2wmZ7g_RKBRlinDJavXPxMxCZG-7OXWP1FTtn5VgNFHo`
  - Target row: `Vàng 9999 (nhẫn tròn)`

## 4) Runtime architecture

GitHub Actions runs one CLI process:

1. load supplier config
2. crawl each supplier with Playwright
3. parse buy/sell + source updated time
4. normalize numeric/time values
5. compute metrics (`spread = sell - buy`)
6. create run summary (`ok | partial | failed`)
7. send notification payload to enabled channels

No state is persisted between runs.

## 5) Project structure (target)

```text
gold-tracking/
  .github/workflows/
    crawl.yml
  src/
    main.ts
    config/
      env.ts
      suppliers.ts
    crawler/
      browser.ts
      runSupplier.ts
    parsers/
      types.ts
      parser24h.ts
      parserKimKhanhVietHung.ts
      parserHoaKimNguyen.ts
      parserNgocThinh.ts
    domain/
      normalize.ts
      metrics.ts
      format.ts
    notify/
      googleChat.ts
      telegram.ts
    shared/
      retry.ts
      logger.ts
      time.ts
  test/
    fixtures/
    parsers/
    domain/
    notify/
  README.md
  ARCHITECTURE.md
  DEVELOPMENT.md
  PROPOSAL.md
  PROGRESS.md
```

## 6) Canonical in-memory contract

### Item shape

- `supplier`
- `product`
- `buy` (number, VND)
- `sell` (number, VND)
- `spread` (`sell - buy`)
- `sourceUpdatedAt` (ISO when parseable)
- `crawledAt`
- `sourceUrl`

### Run summary shape

- `runId`
- `status` (`ok | partial | failed`)
- `suppliersConfigured`
- `suppliersSucceeded`
- `suppliersFailed`
- `errors[]`

## 7) Notification design

### Google Chat

Send plain text payload first (high compatibility):

- crawl timestamp header (`Crawl at: ...`)
- section title: `Gold Price now:`
- per-item lines: `supplier | product | buy | sell | spread | sourceUpdatedAt`
- failure section when status is `partial` or `failed`

### Telegram

Use Bot API `sendMessage` with escaped text.
Message semantics should stay aligned with Google Chat output.

## 8) Resilience policy

- Isolate failures by supplier
- Isolate failures by notification channel (one channel failure must not block another)
- Bounded retries for navigation/parsing
- Bounded retries for webhook HTTP `429/5xx`
- Final status:
  - `ok`: all suppliers succeed
  - `partial`: at least one success and one failure
  - `failed`: all suppliers fail
- Always attempt notification with whatever successful data exists

## 9) Security and observability

### Secrets (GitHub Actions)

- `GOOGLE_CHAT_WEBHOOK_URL` (optional)
- `TELEGRAM_BOT_TOKEN` (optional)
- `TELEGRAM_CHAT_ID` (optional)

### Rules

- Never log secrets/tokenized URLs
- Keep logs structured and minimal (`supplier`, `duration`, `parsedCount`, `status`, `errorCode`)
- Local runs load environment variables from `.env` before resolving config values

## 10) GitHub Actions workflow plan

Triggers:

- `schedule: "0 */2 * * *"`
- `workflow_dispatch`

Core job steps:

1. checkout
2. setup Node.js
3. install dependencies
4. install Playwright browser deps
5. run crawler CLI

Optional: upload log artifact when run fails.

## 11) Testing strategy

- Parser unit tests with local HTML fixtures
- Deterministic tests for normalization + metrics
- Payload mapping tests for both channels
- Optional live smoke run only via manual dispatch

## 12) Delivery phases

### Phase 1 — MVP

- scaffold project
- implement 4 parser modules
- implement orchestrator + canonical payload
- implement Google Chat + Telegram adapters
- add scheduled workflow

### Phase 2 — Hardening

- parser fallback improvements
- better diagnostics and error codes
- stronger formatting/localization
- maintain regression fixture suite

## 13) Acceptance criteria

- workflow runs every 2 hours
- at least one successful supplier parse sends notification
- notification includes buy/sell/spread/source updated time
- partial failures still produce useful output
- no database, API backend, or historical storage added

## 14) Current decision defaults

If not explicitly changed during implementation:

- send to both channels when both are configured
- message language: English
- value display: full VND formatting (e.g., `17,700,000`)
- source updated time display: keep supplier-provided string (no extra timezone conversion)
- failed suppliers retried in same run with bounded attempts, then defer to next schedule
- Node runtime: Node.js 20 with pnpm scripts (`crawl`, `typecheck`, `test`)
- unit test runner: Vitest with local HTML fixtures (no live website assertions in CI)
- when no notifier is configured, run remains successful in **log-only mode**

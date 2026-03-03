# Gold Tracking Serverless

Serverless, stateless crawler for Vietnamese gold price monitoring.

It runs on a schedule (every 3 hours at 08:00, 11:00, 14:00, 17:00 UTC+7 via GitHub Actions), crawls configured suppliers with Playwright, normalizes in-memory data, computes spread metrics, and sends notifications to Google Chat and/or Telegram.

## Features

- Serverless and stateless runtime
- Supplier-isolated crawling/parsing
- Retry support for navigation, parsing, and notify requests
- Canonical in-memory payload + run summary (`ok | partial | failed`)
- Notification channel isolation (`Promise.allSettled`)
- Local fixture-based parser tests (no live-site dependency in unit tests)

## Tech stack

- Node.js 20
- TypeScript
- Playwright
- Vitest
- pnpm

## Suppliers Supported
- 24h
  - URL: https://www.24h.com.vn/gia-vang-hom-nay-c425.html
  - Target rows: `SJC`, `PNJ Hà Nội`
- Kim Khanh Viet Hung
  - URL: https://kimkhanhviethung.vn/tra-cuu-gia-vang.html
  - Target row: `Vàng 999.9`
- Hoa Kim Nguyen
  - URL: https://hoakimnguyen.com/tra-cuu-gia-vang/
  - Target row: `9999 vĩ`
- Ngoc Thinh Jewelry
  - URL: https://ngocthinh-jewelry.vn/pages/bang-gia-vang?srsltid=AfmBOoq5tMd-2wmZ7g_RKBRlinDJavXPxMxCZG-7OXWP1FTtn5VgNFHo
  - Target row: `Vàng 9999 (nhẫn tròn)`
- GoldPrice.org
  - URL: https://goldprice.org/
  - Target row: `Gold spot (USD/oz)` from `Gold Price per Ounce`

## Quick start

### 1) Install dependencies

- `pnpm install --frozen-lockfile`

### 2) Install Playwright browser

- `npx playwright install chromium`

### 3) Configure environment

Create/update `.env` in project root:

- `GOOGLE_CHAT_WEBHOOK_URL` (optional)
- `TELEGRAM_BOT_TOKEN` (optional)
- `TELEGRAM_CHAT_ID` (optional)
- `CRAWL_TIMEOUT_MS` (default `30000`)
- `NAVIGATION_RETRIES` (default `2`)
- `PARSE_RETRIES` (default `1`)
- `NOTIFY_RETRIES` (default `2`)

If no notifier is configured, the run still succeeds in **log-only mode**.

## Run locally

- Crawl once: `pnpm run crawl`
- Type check: `pnpm run typecheck`
- Run tests: `pnpm test`
- Build: `pnpm run build`

## Output semantics

### Run status

- `ok`: all suppliers succeeded
- `partial`: at least one succeeded and one failed
- `failed`: all suppliers failed

### Message format

- Language: English
- Number format: grouped VND-style formatting
- Header includes crawl timestamp: `Crawl at: ...` (Vietnam timezone)
- Main section title: `Gold Price now:`
- Source updated time display: kept as provided by suppliers (no extra timezone conversion)

## CI workflow

Workflow file: `.github/workflows/crawl.yml`

Triggers:

- Schedule: every 3 hours at 08:00, 11:00, 14:00, 17:00 (UTC+7), cron UTC: `0 1,4,7,10 * * *`
- Manual: `workflow_dispatch`

Main steps:

1. Checkout
2. Setup pnpm
3. Setup Node.js 20
4. Install dependencies
5. Install Playwright Chromium
6. Run crawler

## Project docs

- [ARCHITECTURE.md](ARCHITECTURE.md): architecture and runtime flow
- [DEVELOPMENT.md](DEVELOPMENT.md): developer workflow and contribution notes
- [PROPOSAL.md](PROPOSAL.md): implementation proposal and defaults
- [PROGRESS.md](PROGRESS.md): execution tracker

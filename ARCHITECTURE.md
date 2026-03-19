# Architecture

## Goal

Run a scheduled, serverless crawler that extracts selected gold prices from configured suppliers and sends notifications without any persistent storage.

## Architecture style

- Stateless batch job
- Single process per run
- In-memory transformation pipeline
- Failure isolation at supplier and notifier-channel levels

## Runtime flow

1. Load environment config (`src/config/env.ts`)
2. Build supplier list (`src/config/suppliers.ts`)
3. Launch Playwright browser (`src/crawler/browser.ts`)
4. For each supplier:
   - Open page
   - Navigate with retry
   - Parse with supplier-specific parser and retry
   - Always close page in `finally`
5. Normalize values and compute spread (`src/domain/normalize.ts`, `src/domain/metrics.ts`)
6. Build run summary (`ok | partial | failed`)
7. Format message (`src/domain/format.ts`)
8. Send to notifiers (`src/notify/*`) with channel isolation
9. Emit structured logs (`src/shared/logger.ts`)

## Module map

### Configuration

- `src/config/env.ts`: env loading/parsing (`dotenv` + defaults)
- `src/config/suppliers.ts`: source URLs and target product labels

### Crawler

- `src/crawler/browser.ts`: browser lifecycle
- `src/crawler/runSupplier.ts`: per-supplier execution with retries and error handling

### Parsers

- `src/parsers/parser24h.ts`
- `src/parsers/parserGoldPrice.ts`
- `src/parsers/parserKimKhanhVietHung.ts`
- `src/parsers/parserHoaKimNguyen.ts`
- `src/parsers/parserNgocThinh.ts`
- `src/parsers/types.ts`: canonical types and run contracts

### Domain

- `src/domain/normalize.ts`: numeric/time normalization
- `src/domain/metrics.ts`: spread calculation
- `src/domain/format.ts`: final user-facing message formatting
- `src/domain/presentation.ts`: item categorization and presentation formatting helpers (international vs domestic pricing, number formatting by category)

### Notify

- `src/notify/googleChat.ts`: Google Chat notifier with cardsV2 format, supports international/domestic categorization
- `src/notify/telegram.ts`
- `src/notify/types.ts`

### Shared

- `src/shared/retry.ts`: retry utility
- `src/shared/logger.ts`: minimal structured logging + sanitization
- `src/shared/time.ts`: run ID / timestamps

## Data contracts

### Gold item

- `supplier`
- `product`
- `buy`
- `sell`
- `spread`
- `sourceUpdatedAt`
- `crawledAt`
- `sourceUrl`

### Run summary

- `runId`
- `status`
- `suppliersConfigured`
- `suppliersSucceeded`
- `suppliersFailed`
- `errors[]`


## Item categorization and presentation

Gold items are automatically categorized during notification based on supplier:

- **International**: GoldPrice items (USD/oz format, no thousand separators)
- **Domestic-luong**: Vietnam 24h supplier items (gold lượng unit, formatted with thousand separators)
- **Domestic-chi**: Other domestic suppliers (gold chỉ unit, formatted with thousand separators)

Each category receives appropriate formatting for prices and spread values. Google Chat notifier uses cardsV2 format with color-coded price display (green for buy, orange for sell).

## Reliability policies

- Supplier failure does not stop other suppliers
- Notifier channel failure does not block other channels
- Navigation/parsing/notify retries are bounded
- No notifier configured => log-only successful run

## Security/observability

- Never log secrets or tokenized URLs
- Structured logs with key context fields
- Environment secrets provided by `.env` locally and GitHub Secrets in CI

## CI deployment model

- Scheduled run via GitHub Actions every 3 hours at 08:00, 11:00, 14:00, 17:00 (UTC+7)
- Manual dispatch supported
- No long-running services, no DB, no backend API

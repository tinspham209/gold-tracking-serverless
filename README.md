# Gold Tracking Serverless

Serverless, stateless crawler for Vietnamese gold price monitoring.

It runs on a schedule (every 2 hours via GitHub Actions), crawls configured suppliers with Playwright, normalizes in-memory data, computes spread metrics, and sends notifications to Google Chat and/or Telegram.

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
- Source updated time display: `DD/MM/YYYY HH:mm` in Vietnam local timezone (`Asia/Ho_Chi_Minh`)

## CI workflow

Workflow file: `.github/workflows/crawl.yml`

Triggers:

- Schedule: every 2 hours (`0 */2 * * *`)
- Manual: `workflow_dispatch`

Main steps:

1. Checkout
2. Setup Node.js 20
3. Setup pnpm
4. Install dependencies
5. Install Playwright Chromium
6. Run crawler

## Project docs

- [ARCHITECTURE.md](ARCHITECTURE.md): architecture and runtime flow
- [DEVELOPMENT.md](DEVELOPMENT.md): developer workflow and contribution notes
- [PROPOSAL.md](PROPOSAL.md): implementation proposal and defaults
- [PROGRESS.md](PROGRESS.md): execution tracker

# Development Guide

## Prerequisites

- Node.js 20+
- pnpm 10+

## Setup

1. Install dependencies:
   - `pnpm install --frozen-lockfile`
2. Install Playwright browser:
   - `npx playwright install chromium`
3. Configure `.env` values.

## Daily workflow

1. Implement small, isolated changes.
2. Run local checks:
   - `pnpm run typecheck`
   - `pnpm test`
   - `pnpm run crawl` (dry-run/live based on notifier env)
3. Keep `PROGRESS.md` and `PROPOSAL.md` aligned when behavior/defaults change.

## Coding conventions

- TypeScript strict mode
- Small single-purpose modules
- Prefer pure functions in domain transforms
- Keep supplier-specific logic in dedicated parser files
- Preserve canonical run/data contracts from `src/parsers/types.ts`

## Testing strategy

### Unit tests (default)

- Parser tests with local HTML fixtures
- Domain tests for normalize/metrics/format
- Notifier tests with mocked `fetch`

### Live run checks (manual)

Use `pnpm run crawl` for smoke checks against real sites. Expect occasional source instability and `partial` runs.

## Adding a new supplier

1. Add supplier target in `src/config/suppliers.ts`
2. Create parser file in `src/parsers/`
3. Register parser in `src/main.ts` parser map
4. Add fixture HTML under `test/fixtures/`
5. Add parser tests in `test/parsers/parsers.test.ts`
6. Verify full suite + live crawl

## Updating message/output behavior

1. Update formatting logic in `src/domain/format.ts`
2. Adjust/add tests in `test/domain/domain.test.ts`
3. If output/default behavior changes, update `PROPOSAL.md`

## Environment notes

- `.env` is loaded by `dotenv` from `src/config/env.ts`
- If both channels are unset, run is log-only
- Prefer GitHub Secrets for CI runtime values

## Troubleshooting

### `googleChatWebhookUrl` is undefined

- Ensure `.env` exists in project root
- Confirm key is exactly `GOOGLE_CHAT_WEBHOOK_URL`
- Verify app starts from repo root

### Playwright browser not found

- Run: `npx playwright install chromium`

### Supplier parse failures

- Check logs for `ROW_NOT_FOUND` or navigation errors
- Refresh parser regex/selectors
- Add fixture test coverage for new source shape

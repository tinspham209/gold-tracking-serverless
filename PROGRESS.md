# Vietnamese Gold Tracking Alerts — Progress Tracker

_Last updated: 2026-03-19_

## Overall status

- Phase: **Phase 1 implementation in progress**
- Health: **On track**
- Blockers: **None**

## Milestones

| Milestone                                    | Status | Notes                                                   |
| -------------------------------------------- | ------ | ------------------------------------------------------- |
| Proposal aligned to serverless/no-DB scope   | ✅ Done | `PROPOSAL.md` updated                                   |
| Project scaffolding (`src`, tests, workflow) | ✅ Done | Base files, source tree, tests, and workflow completed  |
| Supplier parser modules (5 sources)          | ✅ Done | GoldPrice, 24h, KKVH, HKN, Ngọc Thịnh implemented       |
| Notification adapters (Chat + Telegram)      | ✅ Done | Google Chat + Telegram senders implemented              |
| CI schedule + manual dispatch                | ✅ Done | `.github/workflows/crawl.yml` added                     |
| Fixture-based tests                          | ✅ Done | Parser/domain/notify tests added and passing            |
| Dry-run verification                         | ✅ Done | Local run succeeded in log-only mode with 5/5 suppliers |
| Presentation helpers and item categorization | ✅ Done | International/domestic-luong/domestic-chi classification added |
| Google Chat cardsV2 format                   | ✅ Done | Enhanced Google Chat notifier with formatted cards       |

## Detailed checklist

### Current task — Update schedule to every 3 hours (completed)

- [x] Update workflow cron expression to run every 3 hours (08:00, 11:00, 14:00, 17:00 UTC+7)
- [x] Update proposal and project docs to match new schedule
- [x] Keep manual `workflow_dispatch` trigger unchanged

### Current task — Generate core project docs (completed)

- [x] Create `README.md` with setup/run/verification guide
- [x] Create `ARCHITECTURE.md` with runtime and module flow
- [x] Create `DEVELOPMENT.md` with coding/testing workflow
- [x] Update proposal structure section for new docs

### Current task — Focused hardening patch (completed)

- [x] Ensure `runSupplier` always closes page in `finally`
- [x] Isolate notifier failures with `Promise.allSettled`
- [x] Format display time in Vietnam timezone (`Asia/Ho_Chi_Minh`)
- [x] Update tests and proposal defaults for hardening behavior

### Current task — Translate run message output to English (completed)

- [x] Convert all `formatRunMessage` labels/content from Vietnamese to English
- [x] Keep numeric/date formatting behavior unchanged
- [x] Add/adjust tests to assert English output labels
- [x] Update `PROPOSAL.md` language default to English

### Current task — Format output datetime display (completed)

- [x] Keep displayed `sourceUpdatedAt` as supplier-provided string
- [x] Remove extra timezone conversion in formatter
- [x] Add/adjust tests for formatter output
- [x] Update `PROPOSAL.md` for display format decision

### Current task — Fix local `.env` loading (completed)

- [x] Ensure runtime loads `.env` before `getEnvConfig()` reads `process.env`
- [x] Remove temporary env debug log that can leak secrets
- [x] Verify local resolution of `googleChatWebhookUrl` from `.env`
- [x] Sync `PROPOSAL.md` if implementation behavior changes

### Current task — Package manager migration to pnpm (completed)

- [x] Update package manager metadata to pnpm
- [x] Update CI workflow from npm to pnpm
- [x] Update `PROPOSAL.md` references from npm to pnpm
- [x] Run local validation using pnpm (`typecheck`, `test`, `crawl`)

### Current task — Final verification + doc sync (completed)

- [x] Run full test verification (`pnpm test`, `pnpm run typecheck`)
- [x] Run manual dry-run (`pnpm run crawl`) and capture output summary
- [x] Update `PROPOSAL.md` for implemented defaults/details
- [x] Update Phase 1 checklist completion status

### Completed task — GitHub Actions workflow

- [x] Add `.github/workflows/crawl.yml`
- [x] Configure `schedule` trigger every 3 hours (08:00, 11:00, 14:00, 17:00 UTC+7)
- [x] Configure `workflow_dispatch` trigger
- [x] Add Node 20 + pnpm install + Playwright browser install + crawl run steps

### Completed task — Fixture-based tests

- [x] Add parser fixture HTML samples for 5 suppliers
- [x] Add parser unit tests for target product rows
- [x] Add deterministic domain tests (`normalize`, `spread`)
- [x] Add notifier payload mapping tests

### Completed task — Parser + orchestration baseline

- [x] Add Playwright browser lifecycle helpers
- [x] Implement supplier parser modules for 5 configured sources
- [x] Implement supplier run isolation with bounded retry
- [x] Implement Google Chat + Telegram notifier senders
- [x] Implement main orchestration flow (`ok | partial | failed`)

### Completed task — Contracts and domain baseline

- [x] Add canonical contracts in `src/parsers/types.ts`
- [x] Add normalization helper in `src/domain/normalize.ts`
- [x] Add metric helper in `src/domain/metrics.ts`
- [x] Add message formatter in `src/domain/format.ts`
- [x] Add notifier interfaces in `src/notify/`

### Completed task — Core modules baseline

- [x] Add `src/config/env.ts` for environment parsing
- [x] Add `src/config/suppliers.ts` with source targets and product labels
- [x] Add `src/shared/retry.ts` for bounded retries
- [x] Add `src/shared/logger.ts` with structured minimal logs
- [x] Add `src/shared/time.ts` for run/crawl timestamps

### Completed task — Scaffolding baseline

- [x] Create `package.json` with scripts (`build`, `test`, `crawl`, `typecheck`)
- [x] Create `tsconfig.json` for Node 20 TypeScript runtime
- [x] Create initial source tree under `src/`
- [x] Create initial test tree under `test/`
- [x] Add `.gitignore` and lockfile baseline

### Phase 1 — MVP

- [x] Create base TypeScript project files
- [x] Add supplier config (`src/config/suppliers.ts`)
- [x] Add canonical types (`src/parsers/types.ts`)
- [x] Implement parser: 24h (`SJC`, `PNJ Hà Nội`)
- [x] Implement parser: Kim Khánh Việt Hùng (`Vàng 999.9`)
- [x] Implement parser: Hoa Kim Nguyên (`9999 vĩ`)
- [x] Implement parser: Ngọc Thịnh (`Vàng 9999 (nhẫn tròn)`)
- [x] Implement normalization + metrics (`spread`)
- [x] Implement Google Chat notifier
- [x] Implement Telegram notifier
- [x] Implement run orchestration (`ok | partial | failed`)
- [x] Add workflow `.github/workflows/crawl.yml`
- [x] Add parser fixture tests
- [x] Run manual dry-run and capture output

### Phase 2 — Hardening

- [ ] Add robust fallback selectors per supplier
- [ ] Add richer error taxonomy (`NAVIGATION_TIMEOUT`, `ROW_NOT_FOUND`, etc.)
- [ ] Improve message formatting and readability
- [ ] Expand fixture coverage for edge cases
- [ ] Add failure triage notes/runbook

## Change log

### 2026-03-03

- Updated `PROPOSAL.md` to reflect latest architecture and default decisions.
- Added `PROGRESS.md` for milestone + checklist tracking.
- Started implementation with TypeScript scaffold, base scripts, and lockfile.
- Added core shared/config modules and `.env` placeholder for runtime variables.
- Added canonical contracts, normalization, metrics, formatting, and notifier interfaces.
- Implemented Playwright crawler flow, supplier parsers, and notification senders.
- Added fixture-based parser/domain/notify tests and verified passing test suite.
- Added scheduled/manual GitHub Actions workflow for crawl execution.
- Completed full local verification (`typecheck`, `test`, dry-run crawl with log-only notify path).
- Migrated project/package/workflow defaults from npm to pnpm and re-verified local runs.
- Fixed local `.env` loading via `dotenv`, and removed sensitive env debug logging.
- Updated notification datetime display to keep supplier-provided `sourceUpdatedAt` text.
- Translated `formatRunMessage` output labels and sections to English.
- Applied focused hardening patch: safe page cleanup, notifier channel isolation, and crawl-header Vietnam-local datetime display.
- Added `README.md`, `ARCHITECTURE.md`, and `DEVELOPMENT.md` with setup, architecture, and workflow guidance.
- Updated GitHub Actions schedule from every 30 minutes to every 3 hours at 08:00, 11:00, 14:00, 17:00 (UTC+7).

## Next suggested action

Start Phase 2 hardening (fallback selectors + richer error taxonomy + expanded edge-case fixtures).

### Current task — Item categorization and presentation formatting (completed)

- [x] Create `src/domain/presentation.ts` module with categorization helpers
- [x] Implement `categorizeItem()` function for international/domestic classification
- [x] Implement `formatPriceValue()` and `formatSpreadValue()` for category-aware formatting
- [x] Add presentation tests in `test/domain/presentation.test.ts`
- [x] Refactor notifiers to use presentation helpers
- [x] Move skills to `.github/skills/` directory for better organization

### Current task — Google Chat cardsV2 enhancement (completed)

- [x] Implement Google Chat notifier with cardsV2 format
- [x] Add item categorization support (international/domestic-luong/domestic-chi)
- [x] Implement color-coded price display (green for buy, orange for sell)
- [x] Add comprehensive tests for domestic and international formatting
- [x] Update documentation with categorization strategy
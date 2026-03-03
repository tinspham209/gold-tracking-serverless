# Vietnamese Gold Tracking Alerts — Progress Tracker

_Last updated: 2026-03-03_

## Overall status

- Phase: **Planning complete, implementation not started**
- Health: **On track**
- Blockers: **None**

## Milestones

| Milestone | Status | Notes |
|---|---|---|
| Proposal aligned to serverless/no-DB scope | ✅ Done | `PROPOSAL.md` updated |
| Project scaffolding (`src`, tests, workflow) | ⏳ Pending | Next implementation step |
| Supplier parser modules (4 sources) | ⏳ Pending | 24h, KKVH, HKN, Ngọc Thịnh |
| Notification adapters (Chat + Telegram) | ⏳ Pending | Plain text first |
| CI schedule + manual dispatch | ⏳ Pending | GitHub Actions cron every 30 mins |
| Fixture-based tests | ⏳ Pending | Parser + metrics + notify mapping |
| Dry-run verification | ⏳ Pending | Validate payload without sending |

## Detailed checklist

### Phase 1 — MVP

- [ ] Create base TypeScript project files
- [ ] Add supplier config (`src/config/suppliers.ts`)
- [ ] Add canonical types (`src/parsers/types.ts`)
- [ ] Implement parser: 24h (`SJC`, `PNJ Hà Nội`)
- [ ] Implement parser: Kim Khánh Việt Hùng (`Vàng 999.9`)
- [ ] Implement parser: Hoa Kim Nguyên (`9999 vĩ`)
- [ ] Implement parser: Ngọc Thịnh (`Vàng 9999 (nhẫn tròn)`)
- [ ] Implement normalization + metrics (`spread`)
- [ ] Implement Google Chat notifier
- [ ] Implement Telegram notifier
- [ ] Implement run orchestration (`ok | partial | failed`)
- [ ] Add workflow `.github/workflows/crawl.yml`
- [ ] Add parser fixture tests
- [ ] Run manual dry-run and capture output

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

## Next suggested action

Start Phase 1 scaffolding (project files + workflow + parser interfaces), then mark completed items in this document after each merged step.

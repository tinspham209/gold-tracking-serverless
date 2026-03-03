# Skill: implement-gold-crawler

## Purpose

Implement or extend the stateless gold crawler flow for this repository.

## Use when

- Adding a new supplier parser
- Refactoring crawl orchestration
- Updating canonical payload fields
- Improving in-memory metrics logic

## Inputs expected

- Supplier URL(s)
- Product targets (exact labels and aliases)
- Required output fields (`buy`, `sell`, `sourceUpdatedAt`)

## Implementation checklist

1. Add/modify supplier config entry in `src/config/suppliers.ts`.
2. Create/adjust parser in `src/parsers/`.
3. Ensure parser returns canonical data shape from `src/parsers/types.ts`.
4. Normalize number/time formats via `src/domain/normalize.ts`.
5. Compute derived metrics in `src/domain/metrics.ts`.
6. Keep failure isolation at supplier level in orchestration.
7. Add fixture-based parser tests under `test/parsers/`.

## Done criteria

- New/updated supplier parser passes fixture tests.
- No secrets introduced in logs.
- Output remains compatible with notification formatters.

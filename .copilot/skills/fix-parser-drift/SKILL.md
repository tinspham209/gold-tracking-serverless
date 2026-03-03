# Skill: fix-parser-drift

## Purpose

Repair crawler breakage when supplier HTML structure or labels change.

## Use when

- A supplier returns `MISSING_SELECTOR`, empty rows, or malformed values
- Timestamp extraction fails due to format changes
- Product aliases drift (e.g. capitalization/diacritics/spacing)

## Repair workflow

1. Reproduce failure locally (dry run for one supplier only).
2. Capture minimal HTML fixture representing new structure.
3. Update parser selectors with fallback strategy:
   - preferred: structure-aware selectors,
   - fallback: robust text-based extraction near headers.
4. Expand alias matching to include diacritic-insensitive compare.
5. Update timestamp parser with explicit source-specific regex.
6. Add regression test fixture before finalizing.

## Guardrails

- Do not change canonical schema unless explicitly requested.
- Keep parser-specific logic inside parser file, not shared domain layers.
- Keep retries bounded; avoid infinite loops.

## Done criteria

- Broken supplier recovers in fixture test.
- Existing suppliers remain unaffected.
- Run status remains `partial` on isolated failures.

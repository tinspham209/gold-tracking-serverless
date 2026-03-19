# Skill: mcp-crawl-debug

## Purpose

Use MCP-enabled tooling patterns to debug crawler and parser issues faster.

## Use when

- Selector extraction fails unexpectedly
- You need quick source verification from URLs
- You want structured failure triage before code edits

## MCP-first workflow

1. Fetch target webpage content and inspect extracted text blocks.
2. Identify candidate selectors/anchors from headings, row labels, and update-time strings.
3. Compare current parser assumptions against fetched structure.
4. Update parser with minimal changes and keep a fixture for regression.

## Recommended MCP capabilities

- Webpage fetch for source inspection and timestamp pattern checks.
- Search/read tools for locating parser contracts and call sites.
- Error collection tools for fast compile/lint validation.

## Guardrails

- Never rely on one brittle selector when table labels are available.
- Keep parser changes supplier-local unless normalization truly needs updates.
- Keep retries bounded; preserve supplier isolation semantics.

## Done criteria

- Reproduced issue is fixed.
- Fixture test added/updated.
- No regression in other suppliers.

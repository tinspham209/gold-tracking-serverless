# Copilot Instructions — Vietnamese Gold Tracking Alerts

## Project intent

Build and maintain a **serverless, stateless** crawler that:

1. runs every 3 hours at 08:00, 11:00, 14:00, 17:00 (UTC+7) via GitHub Actions,
2. crawls configured gold suppliers with Playwright,
3. parses selected product rows and source update times,
4. computes in-memory metrics (e.g., spread),
5. sends notifications to Google Chat and/or Telegram.

## Hard constraints

- No webapp UI.
- No backend API service.
- No database or persistent storage.
- Do not introduce heavy infrastructure beyond GitHub Actions unless explicitly requested.

## Code architecture preferences

- TypeScript + Node.js + Playwright.
- Keep modules small and single-purpose.
- Put supplier-specific logic in dedicated parser files.
- Keep a canonical in-memory payload and map it to channel-specific payloads.
- Prefer pure functions for normalization and metrics.

## Resilience and behavior

- Isolate failures by supplier (one bad supplier must not abort all).
- Use bounded retries for navigation/parsing/webhook requests.
- Emit run status as `ok | partial | failed`.
- Always try to notify with whatever successful data exists.

## Security and observability

- Never log secrets or full tokenized URLs.
- Use GitHub Secrets for all credentials/tokens.
- Keep logs structured and minimal: supplier, duration, parsed count, status, error code.

## Testing guidance

- Prefer parser tests using local HTML fixtures.
- Avoid live website assertions in CI by default.
- Test normalization and notification mappers with deterministic unit tests.

## Preferred delivery pattern

When implementing tasks, follow this sequence:

1. update/add parser and tests,
2. update domain normalization/metrics if needed,
3. update notification formatter,
4. update workflow/env docs,
5. verify with tests and a dry-run output.

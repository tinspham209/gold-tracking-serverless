# Skill: notify-webhooks

## Purpose

Implement or adjust notification delivery to Google Chat and Telegram.

## Use when

- Adding new fields to alert message
- Changing formatting language/verbosity
- Improving retry/backoff for outbound notification calls

## Channel contract

- Canonical payload is channel-agnostic.
- Mappers convert canonical payload into:
  - Google Chat message body (`text`-first, reliable baseline)
  - Telegram `sendMessage` request body

## Checklist

1. Keep one canonical formatter in `src/domain/format.ts`.
2. Keep transport adapters separate in `src/notify/googleChat.ts` and `src/notify/telegram.ts`.
3. Ensure both channels can be independently enabled/disabled by env vars.
4. Implement retry for HTTP 429/5xx.
5. Always include run summary + per-item lines + error section for `partial/failed`.

## Guardrails

- Never log webhook URLs or bot tokens.
- Do not fail entire run if one channel fails while the other succeeds.

## Done criteria

- Payload mapping tests cover both channels.
- Message still renders meaningfully in plain text.

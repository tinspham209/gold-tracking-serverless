# Skill: operate-github-actions

## Purpose

Maintain reliable scheduled execution for the crawler in GitHub Actions.

## Use when

- Creating/updating `.github/workflows/crawl.yml`
- Debugging failed scheduled runs
- Improving runtime stability or speed

## Workflow baseline

- Triggers:
  - `schedule: "*/30 * * * *"`
  - `workflow_dispatch`
- Steps:
  1. checkout
  2. setup node
  3. install dependencies
  4. install Playwright browser deps
  5. run crawler CLI

## Reliability checklist

1. Use Node LTS version consistently.
2. Keep step-level timeout bounds to avoid hanging runs.
3. Use retry logic inside app code, not repeated workflow loops.
4. Preserve concise logs and upload failure artifacts only when needed.
5. Ensure run exits non-zero only on true failed-state policy.

## Security checklist

- Read secrets from GitHub Actions secrets only.
- Never echo secret values.
- Avoid printing full URLs with query secrets.

## Done criteria

- Scheduled runs execute and notify as expected.
- Manual dispatch works for smoke testing.

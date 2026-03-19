# Playwright MCP Setup

This repository is configured to use a Playwright MCP server for tooling-assisted browser tasks.

## What was added

- `.vscode/mcp.json`: registers a `playwright` MCP server using `@playwright/mcp`
- `package.json` scripts:
  - `npm run mcp:playwright`
  - `npm run playwright:install`

## One-time local setup

1. Install Node.js 20+.
2. Run `npm run playwright:install` to install browser dependencies.

## Start Playwright MCP manually (optional)

- Run `npm run mcp:playwright`

## VS Code MCP behavior

If your VS Code MCP integration is enabled, it can discover `.vscode/mcp.json` and start the `playwright` server as configured.

## Notes

- Server is configured with `PLAYWRIGHT_HEADLESS=true` for CI-friendly behavior.
- If you need visual debug locally, change to `false` in `.vscode/mcp.json`.
- Keep this server setup separate from your crawler runtime code (`src/`) to avoid coupling tooling and app logic.

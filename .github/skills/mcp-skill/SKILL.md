# MCP Skills Playbook for Gold Tracking

This project uses a stateless crawler architecture. MCP-assisted workflows should prioritize **fast diagnosis**, **minimal edits**, and **high parser resilience**.

## 1) Best MCP usage patterns

- **Source verification first**: fetch supplier URL content before editing parser logic.
- **Context search second**: locate parser/types/contracts across repository.
- **Code change last**: update only the affected supplier parser when possible.

## 2) Standard triage flow

1. Confirm failing supplier and error code from logs.
2. Fetch page content and locate:
   - target product row labels,
   - buy/sell columns,
   - source update-time text.
3. Validate current parser assumptions.
4. Apply minimal parser fix with fallback selector path.
5. Add/update fixture test.
6. Re-run tests and dry-run notification output.

## 3) MCP-assisted tasks map

- **Investigate selector drift** → use webpage/content fetch + parser search.
- **Schema mismatch** → inspect `types` and formatter usage before changing parser return type.
- **Notification issue** → inspect canonical payload formatter before transport adapters.

## 4) Guardrails for AI agents

- Do not introduce persistence layers (DB/files) unless requested.
- Do not add UI/backend service.
- Keep run-level status model: `ok | partial | failed`.
- Never log secrets or full tokenized webhook URLs.

## 5) Definition of done for MCP-driven fixes

- Root cause identified with source evidence.
- Minimal code delta applied.
- Fixture-based test added/updated.
- Dry-run output remains readable and complete.

## 6) Skill routing (recommended)

- Use `.copilot/skills/playwright-skill/SKILL.md` for browser-level supplier probing and extraction validation.
- Use `.copilot/skills/fix-parser-drift/SKILL.md` for parser breakage and selector updates.
- Use `.copilot/skills/notify-webhooks/SKILL.md` for Google Chat/Telegram formatting and transport issues.
- Use `.copilot/skills/operate-github-actions/SKILL.md` for scheduled workflow reliability.

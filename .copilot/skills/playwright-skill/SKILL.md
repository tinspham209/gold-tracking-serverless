---
name: playwright-skill
description: Project-specific Playwright automation skill for Vietnamese gold supplier crawling, parser validation, timestamp extraction, and webhook-ready dry runs. Use when validating supplier pages, fixing selector drift, or verifying extraction logic before CI runs.
---

# Playwright Skill (Gold Tracking Project Edition)

This skill is customized for a **serverless, stateless crawler** workflow (no webapp/backend/DB), aligned with `PROPOSAL.md` and `.github/copilot-instructions.md`.

## Primary objective

Use Playwright to reliably:

1. load supplier pages,
2. locate target product rows,
3. extract buy/sell and source-updated timestamp,
4. verify parsing assumptions quickly,
5. feed parser fixes with minimal code changes.

## Project guardrails

- No UI automation for app pages (there is no webapp scope).
- Do not add storage or persistence.
- Keep parser logic supplier-specific.
- Keep output schema canonical: `supplier, product, buy, sell, spread, sourceUpdatedAt, crawledAt, sourceUrl`.
- Never print secrets or full tokenized webhook URLs.

## Recommended runtime mode

- **Default for this project:** `headless: true` (CI parity).
- Use `headless: false` only for local visual debugging.

## Skill workflow (mandatory order)

1. **Source confirm first**
   - Fetch/inspect the supplier URL and verify current labels/timestamp text.
2. **Write temporary Playwright probe script**
   - Save to `/tmp/playwright-gold-<supplier>-probe.js`.
3. **Run probe and collect evidence**
   - Confirm selectors, row matching, and timestamp regex.
4. **Patch parser minimally**
   - Change only the affected parser unless normalization contract truly changed.
5. **Add/update fixture test**
   - Prevent regression for the changed source.

## Supplier targets (current scope)

- `24h`: `SJC`, `PNJ Hà Nội`
- `kimkhanhviethung`: `Vàng 999.9`
- `hoakimnguyen`: `9999 vĩ`
- `ngocthinh`: `Vàng 9999 (nhẫn tròn)`

## Probe script template

```javascript
// /tmp/playwright-gold-probe.js
const { chromium } = require('playwright');

const TARGET_URL = process.env.TARGET_URL || 'https://www.24h.com.vn/gia-vang-hom-nay-c425.html';
const PRODUCT_KEYWORDS = (process.env.PRODUCT_KEYWORDS || 'SJC,PNJ HÀ NỘI')
  .split(',')
  .map((s) => s.trim().toUpperCase());

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const text = await page.locator('body').innerText();

  const normalized = text.toUpperCase();
  for (const keyword of PRODUCT_KEYWORDS) {
    console.log(`HAS_${keyword.replace(/\s+/g, '_')}:`, normalized.includes(keyword));
  }

  const updatedMatch = text.match(/(Cập nhật|CẬP NHẬT|Ngày cập nhật|Cập nhật vào lúc)[^\n]*/i);
  console.log('UPDATED_TEXT:', updatedMatch?.[0] || 'NOT_FOUND');

  await browser.close();
})();
```

## Execution pattern

- Use `TARGET_URL` and `PRODUCT_KEYWORDS` env vars for quick per-supplier checks.
- Prefer short-lived probe scripts in `/tmp` to avoid repository clutter.
- Save evidence in logs and fixture files, not ad-hoc local notes.

## Local debugging checklist

1. Confirm page loads within timeout.
2. Confirm product label exists (diacritic-insensitive if needed).
3. Confirm buy/sell are extractable as numeric values.
4. Confirm source update text format.
5. Confirm parser output maps into canonical payload.

## CI parity checklist

- Keep timeout bounds realistic for GitHub Actions.
- Avoid fragile nth-child selectors without fallback.
- Use robust text anchors near table headers.

## Error classification suggestions

- `NAVIGATION_TIMEOUT`
- `MISSING_SELECTOR`
- `ROW_NOT_FOUND`
- `PRICE_PARSE_ERROR`
- `UPDATED_AT_PARSE_ERROR`

## Definition of done

- Probe script confirms target row and update-time pattern.
- Parser updated with minimal diff.
- Fixture test passes.
- Dry-run output still generates valid alert summary.

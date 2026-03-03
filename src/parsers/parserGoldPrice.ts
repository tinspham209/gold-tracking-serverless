import type { Page } from "playwright";

import type { SupplierTarget } from "../config/suppliers.js";
import type { ParsedGoldRow } from "./types.js";

const waitForGoldPriceData = async (page: Page): Promise<void> => {
	if (typeof page.waitForFunction !== "function") {
		return;
	}

	await page.waitForFunction(
		() => {
			const text = document.body?.innerText ?? "";

			const hasPerOunce = /Gold\s+Price\s+per\s+Ounce:\s*\|?\s*[0-9]/i.test(
				text,
			);
			const hasHoldingsPrice =
				/HOLDINGS[\s\S]{0,120}?([1-9][0-9]{0,2}(?:,[0-9]{3})+(?:\.[0-9]+)?|[1-9][0-9]{3,}(?:\.[0-9]+)?)/i.test(
					text,
				);
			const stillLoading = /HOLDINGS\s+Loading\.\.\./i.test(text);

			return hasPerOunce || (hasHoldingsPrice && !stillLoading);
		},
		{ timeout: 10000 },
	);
};

const parseUsdPerOunce = (text: string): number => {
	const fromPerOunce = text.match(
		/Gold\s+Price\s+per\s+Ounce:\s*\|?\s*([0-9,]+(?:\.[0-9]+)?)/i,
	);

	const fromHoldings = text.match(
		/HOLDINGS[\s\S]{0,120}?([1-9][0-9]{0,2}(?:,[0-9]{3})+(?:\.[0-9]+)?|[1-9][0-9]{3,}(?:\.[0-9]+)?)/i,
	);

	const rawValue = fromPerOunce?.[1] ?? fromHoldings?.[1];

	if (!rawValue) {
		throw new Error("ROW_NOT_FOUND: Gold Price per Ounce or HOLDINGS");
	}

	const numeric = Number.parseFloat(rawValue.replace(/,/g, ""));
	if (Number.isNaN(numeric)) {
		throw new Error(`PRICE_PARSE_FAILED: ${rawValue}`);
	}

	return Math.round(numeric);
};

const parseSourceUpdatedAt = (text: string): string | undefined => {
	const nyFooterTimestamp = text.match(
		/([A-Za-z]{3,9}\s+[0-9]{1,2}(?:st|nd|rd|th)?\s+[0-9]{4},\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?\s*(?:am|pm)\s+NY\s+time)/i,
	);

	if (nyFooterTimestamp) {
		return nyFooterTimestamp[1].trim();
	}

	const timeWithZone = text.match(
		/goldprice\.org\s*-\s*([0-9]{1,2}:[0-9]{2}\s*[A-Z]{2}\s*Time)/i,
	);
	if (timeWithZone) {
		return timeWithZone[1].trim();
	}

	const datedStamp = text.match(
		/goldprice\.org\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+\s+[0-9]{1,2},\s+[0-9]{4})/i,
	);

	if (datedStamp) {
		return `${datedStamp[1]}, ${datedStamp[2]}`;
	}

	return undefined;
};

const readTickTimestamp = async (page: Page): Promise<string | undefined> => {
	try {
		const tickText = await page.locator("#gpxTickTab_date").innerText();
		const parsed = parseSourceUpdatedAt(tickText);
		return parsed;
	} catch {
		return undefined;
	}
};

export const parseGoldPrice = async (
	page: Page,
	supplier: SupplierTarget,
): Promise<ParsedGoldRow[]> => {
	await waitForGoldPriceData(page);

	let text = await page.locator("body").innerText();
	let sourceUpdatedAtRaw =
		(await readTickTimestamp(page)) ?? parseSourceUpdatedAt(text);

	if (!sourceUpdatedAtRaw && typeof page.waitForTimeout === "function") {
		await page.waitForTimeout(1500);
		text = await page.locator("body").innerText();
		sourceUpdatedAtRaw =
			(await readTickTimestamp(page)) ?? parseSourceUpdatedAt(text);
	}

	const usdPerOunce = parseUsdPerOunce(text);
	const usdRaw = usdPerOunce.toString();

	return supplier.products.map((product) => ({
		supplierId: supplier.supplierId,
		supplier: supplier.supplierName,
		product,
		buyRaw: usdRaw,
		sellRaw: usdRaw,
		sourceUpdatedAtRaw,
		sourceUrl: supplier.sourceUrl,
	}));
};

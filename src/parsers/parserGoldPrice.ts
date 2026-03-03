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

export const parseGoldPrice = async (
	page: Page,
	supplier: SupplierTarget,
): Promise<ParsedGoldRow[]> => {
	await waitForGoldPriceData(page);

	const text = await page.locator("body").innerText();
	const sourceUpdatedAtRaw = parseSourceUpdatedAt(text);
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

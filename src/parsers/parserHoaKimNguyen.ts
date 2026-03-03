import type { Page } from "playwright";

import type { SupplierTarget } from "../config/suppliers.js";
import type { ParsedGoldRow } from "./types.js";

const escapeRegex = (value: string): string => {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseUpdatedAt = (text: string): string | undefined => {
	const match = text.match(
		/Cập nhật vào lúc:\s*([0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?),\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i,
	);
	return match ? `${match[1]} ${match[2]}` : undefined;
};

export const parseHoaKimNguyen = async (
	page: Page,
	supplier: SupplierTarget,
): Promise<ParsedGoldRow[]> => {
	const text = await page.locator("body").innerText();
	const sourceUpdatedAtRaw = parseUpdatedAt(text);

	return supplier.products.map((product) => {
		const productPattern = new RegExp(
			`${escapeRegex(product)}\\s+([0-9.,]+)\\s+([0-9.,]+)`,
			"i",
		);

		const match = text.match(productPattern);
		if (!match) {
			throw new Error(`ROW_NOT_FOUND: ${product}`);
		}

		return {
			supplierId: supplier.supplierId,
			supplier: supplier.supplierName,
			product,
			buyRaw: match[1],
			sellRaw: match[2],
			sourceUpdatedAtRaw,
			sourceUrl: supplier.sourceUrl,
		};
	});
};

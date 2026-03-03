import type { Page } from "playwright";

import type { SupplierTarget } from "../config/suppliers.js";
import type { ParsedGoldRow } from "./types.js";

const escapeRegex = (value: string): string => {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseUpdatedAt = (text: string): string | undefined => {
	const match = text.match(
		/Ngày cập nhật:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})\s+([0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)/i,
	);
	return match ? `${match[2]} ${match[1]}` : undefined;
};

export const parseKimKhanhVietHung = async (
	page: Page,
	supplier: SupplierTarget,
): Promise<ParsedGoldRow[]> => {
	const text = await page.locator("body").innerText();
	const sourceUpdatedAtRaw = parseUpdatedAt(text);

	return supplier.products.map((product) => {
		const productPattern = new RegExp(
			`${escapeRegex(product)}\\s+([0-9.,]+)đ?\\s+([0-9.,]+)đ?`,
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

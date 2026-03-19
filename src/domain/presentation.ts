import type { GoldItem } from "../parsers/types.js";

export type NotificationCategory =
	| "international"
	| "domestic-luong"
	| "domestic-chi";

export const categorizeItem = (item: GoldItem): NotificationCategory => {
	const supplier = item.supplier.toLowerCase();
	const sourceUrl = item.sourceUrl.toLowerCase();
	const product = item.product.toLowerCase();

	if (supplier.includes("goldprice") || sourceUrl.includes("goldprice.org")) {
		return "international";
	}

	if (supplier.includes("24h")) {
		return "domestic-luong";
	}

	return "domestic-chi";
};

export const formatPriceValue = (
	value: number,
	category: NotificationCategory,
): string => {
	if (category === "international") {
		return value.toString();
	}

	const formatted = new Intl.NumberFormat("vi-VN").format(value);
	return formatted.endsWith(".000") ? formatted.slice(0, -4) : formatted;
};

export const formatSpreadValue = (
	value: number,
	category: NotificationCategory,
): string => {
	return formatPriceValue(value, category);
};

export const getSourceUpdatedLabel = (value?: string): string => {
	if (!value) {
		return "unknown";
	}

	return value.trim();
};

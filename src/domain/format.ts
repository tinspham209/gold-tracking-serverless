import type { GoldItem, RunSummary } from "../parsers/types.js";
import {
	categorizeItem,
	formatPriceValue,
	formatSpreadValue,
	getSourceUpdatedLabel,
} from "./presentation.js";

export const formatCrawledAt = (iso: string): string => {
	return new Date(iso).toLocaleString("vi-VN", {
		timeZone: "Asia/Ho_Chi_Minh",
		hour12: false,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};
const formatHeaderTimestamp = (crawledAt: string): string => {
	const raw = crawledAt.trim();
	const isoLike = raw.match(/^\d{4}-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

	if (!isoLike) {
		return raw;
	}

	const [, month, day, hour, minute] = isoLike;
	return `${day}/${month} · ${hour}:${minute}`;
};

const formatItemLine = (item: GoldItem): string[] => {
	const category = categorizeItem(item);
	const updated = getSourceUpdatedLabel(item.sourceUpdatedAt);
	const buy = formatPriceValue(item.buy, category);
	const sell = formatPriceValue(item.sell, category);
	const spread = formatSpreadValue(item.spread, category);

	return [
		`${item.supplier} · ${item.product} · ${updated}`,
		`Mua: ${buy} | Bán: ${sell} | ±${spread}`,
	];
};

export const formatRunMessage = (
	summary: RunSummary,
	items: GoldItem[],
	crawledAt: string,
): string => {
	const header = [
		`🟡 GOLD TRACKER · ${formatHeaderTimestamp(formatCrawledAt(crawledAt))}`,
	];

	const internationalItems = items.filter(
		(item) => categorizeItem(item) === "international",
	);
	const domesticItems = items.filter(
		(item) => categorizeItem(item) !== "international",
	);

	const sectionSeparator = "━━━━━━━━━━━━━━━━";

	const internationalSection = internationalItems.length
		? [
				"🌐 International",
				...internationalItems.flatMap((item) => formatItemLine(item)),
			]
		: ["🌐 International", "No international data."];

	const domesticSection = domesticItems.length
		? [
				"🇻🇳 Domestic",
				...domesticItems.flatMap((item) => {
					const [title, detail] = formatItemLine(item);
					return [`📌 ${title}`, detail];
				}),
			]
		: ["🇻🇳 Domestic", "No domestic data."];

	const errorSection = summary.errors.length
		? [
				"⚠️ Errors:",
				...summary.errors.map(
					(err) => `- ${err.supplier} [${err.errorCode}] ${err.message}`,
				),
			]
		: [];

	return [
		...header,
		sectionSeparator,
		...internationalSection,
		sectionSeparator,
		...domesticSection,
		...(errorSection.length ? [sectionSeparator, ...errorSection] : []),
	].join("\n");
};

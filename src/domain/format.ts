import type { GoldItem, RunSummary } from "../parsers/types.js";

const formatVnd = (value: number): string => {
	return new Intl.NumberFormat("vi-VN").format(value);
};

const formatSourceUpdatedAt = (value: string | undefined): string => {
	if (!value) {
		return "unknown";
	}

	return value.trim();
};

const formatItemLine = (item: GoldItem): string => {
	const updated = formatSourceUpdatedAt(item.sourceUpdatedAt);

	return `| ${item.supplier} | ${item.product} | ${formatVnd(item.buy)} | ${formatVnd(item.sell)} | ${formatVnd(item.spread)} | ${updated} |`;
};

export const formatRunMessage = (
	summary: RunSummary,
	items: GoldItem[],
	crawledAt: string,
): string => {
	const header = [
		`Crawl at: ${new Date(crawledAt).toLocaleString("en-US", {
			timeZone: "Asia/Ho_Chi_Minh",
		})}`,
		// `RunId: ${summary.runId}`,
		// `Status: ${summary.status}`,
		// `Suppliers: ${summary.suppliersSucceeded}/${summary.suppliersConfigured} succeeded`,
	];

	const hasItems = items.length > 0;

	const body = hasItems
		? items.map(formatItemLine)
		: ["No valid gold price data in this run."];

	const errorSection = summary.errors.length
		? [
				"Errors:",
				...summary.errors.map(
					(err) => `- ${err.supplier} [${err.errorCode}] ${err.message}`,
				),
			]
		: [];

	return [
		...header,
		"",
		"Gold Price now:",
		...(hasItems
			? [
					"| Source | Target | Buy | Sell | Spread | Updated At |",
					"|---|---|---:|---:|---:|---|",
					...body,
				]
			: body),
		...(errorSection.length ? ["", ...errorSection] : []),
	].join("\n");
};

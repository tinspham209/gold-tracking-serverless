import type { GoldItem, RunSummary } from "../parsers/types.js";

const formatVnd = (value: number): string => {
	return new Intl.NumberFormat("vi-VN").format(value);
};

const DATETIME_FORMATTER_VN = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Asia/Ho_Chi_Minh",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});

const getPart = (
	parts: Intl.DateTimeFormatPart[],
	type: Intl.DateTimeFormatPartTypes,
): string | undefined => {
	return parts.find((part) => part.type === type)?.value;
};

const formatSourceUpdatedAt = (value: string | undefined): string => {
	if (!value) {
		return "unknown";
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return value;
	}

	const parts = DATETIME_FORMATTER_VN.formatToParts(parsed);
	const day = getPart(parts, "day");
	const month = getPart(parts, "month");
	const year = getPart(parts, "year");
	const hour = getPart(parts, "hour");
	const minute = getPart(parts, "minute");

	if (!day || !month || !year || !hour || !minute) {
		return value;
	}

	return `${day}/${month}/${year} ${hour}:${minute}`;
};

const formatItemLine = (item: GoldItem): string => {
	const updated = formatSourceUpdatedAt(item.sourceUpdatedAt);

	return [
		item.supplier,
		item.product,
		formatVnd(item.buy),
		formatVnd(item.sell),
		formatVnd(item.spread),
		updated,
	].join(" | ");
};

export const formatRunMessage = (
	summary: RunSummary,
	items: GoldItem[],
): string => {
	const header = [
		`RunId: ${summary.runId}`,
		`Status: ${summary.status}`,
		`Suppliers: ${summary.suppliersSucceeded}/${summary.suppliersConfigured} succeeded`,
	];

	const body = items.length
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
		"Data:",
		...body,
		...(errorSection.length ? ["", ...errorSection] : []),
	].join("\n");
};

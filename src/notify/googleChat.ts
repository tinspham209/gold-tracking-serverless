import type { EnvConfig } from "../config/env.js";
import type { Notifier } from "./types.js";
import { retry } from "../shared/retry.js";

import type { GoldItem, RunSummary } from "../parsers/types.js";

const shouldRetryHttp = (status: number): boolean => {
	return status === 429 || status >= 500;
};

const GOLD_ICON_URL =
	"https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/payments/default/48px.svg";

const formatCrawledAt = (iso: string): string => {
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

const classifyItem = (
	item: GoldItem,
): "international" | "domestic-luong" | "domestic-chi" => {
	const supplier = item.supplier.toLowerCase();
	const sourceUrl = item.sourceUrl.toLowerCase();

	if (supplier.includes("goldprice") || sourceUrl.includes("goldprice.org")) {
		return "international";
	}

	if (supplier.includes("24h")) {
		return "domestic-luong";
	}

	return "domestic-chi";
};

const formatDomesticNumber = (value: number): string => {
	const formatted = new Intl.NumberFormat("vi-VN").format(value);
	return formatted.endsWith(".000") ? formatted.slice(0, -4) : formatted;
};

const formatDecoratedText = (
	item: GoldItem,
	category: "international" | "domestic-luong" | "domestic-chi",
): { text: string; spread: string } => {
	if (category === "international") {
		return {
			text: `<font color="#6ecda3">Buy ${item.buy}</font>  <font color="#e8a07a">Sell ${item.sell}</font>`,
			spread: `${item.spread}`,
		};
	}

	return {
		text: `<font color="#6ecda3">Buy ${formatDomesticNumber(item.buy)}</font>  <font color="#e8a07a">Sell ${formatDomesticNumber(item.sell)}</font>`,
		spread: formatDomesticNumber(item.spread),
	};
};

const mapItemToWidget = (
	item: GoldItem,
	category: "international" | "domestic-luong" | "domestic-chi",
) => {
	const { text, spread } = formatDecoratedText(item, category);
	const updated = item.sourceUpdatedAt?.trim() || "unknown";

	return {
		decoratedText: {
			topLabel: `${item.supplier} · ${item.product}`,
			text,
			bottomLabel: `Spread: ${spread} · ${updated}`,
		},
	};
};

const buildCardsPayload = (summary: RunSummary, items: GoldItem[]) => {
	const international = items.filter(
		(item) => classifyItem(item) === "international",
	);
	const domesticLuong = items.filter(
		(item) => classifyItem(item) === "domestic-luong",
	);
	const domesticChi = items.filter(
		(item) => classifyItem(item) === "domestic-chi",
	);

	const sections: Array<{
		header: string;
		widgets: Array<Record<string, unknown>>;
	}> = [];

	if (international.length > 0) {
		sections.push({
			header: "🌐 International",
			widgets: international.map((item) =>
				mapItemToWidget(item, "international"),
			),
		});
	}

	if (domesticLuong.length > 0) {
		sections.push({
			header: "🇻🇳 Domestic — Lượng",
			widgets: domesticLuong.map((item) =>
				mapItemToWidget(item, "domestic-luong"),
			),
		});
	}

	if (domesticChi.length > 0) {
		sections.push({
			header: "🇻🇳 Domestic — Chỉ",
			widgets: domesticChi.map((item) => mapItemToWidget(item, "domestic-chi")),
		});
	}

	if (items.length === 0) {
		sections.push({
			header: "Run data",
			widgets: [
				{
					textParagraph: {
						text: "No valid gold price data in this run.",
					},
				},
			],
		});
	}

	if (summary.errors.length > 0) {
		sections.push({
			header: "⚠️ Supplier errors",
			widgets: summary.errors.map((error) => ({
				decoratedText: {
					topLabel: `${error.supplier} [${error.errorCode}]`,
					text: error.message,
				},
			})),
		});
	}

	const crawledAt = items[0]?.crawledAt ?? new Date().toISOString();

	return {
		cardsV2: [
			{
				cardId: "gold-price-card",
				card: {
					header: {
						title: "Gold Price Now",
						subtitle: `Crawled ${formatCrawledAt(crawledAt)}`,
					},
					sections,
				},
			},
		],
	};
};

export const createGoogleChatNotifier = (
	env: EnvConfig,
): Notifier | undefined => {
	if (!env.googleChatWebhookUrl) {
		return undefined;
	}

	return {
		channel: "google-chat",
		send: async (payload) => {
			const body = buildCardsPayload(payload.summary, payload.items);

			await retry(
				async () => {
					const response = await fetch(env.googleChatWebhookUrl!, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(body),
					});

					if (!response.ok && shouldRetryHttp(response.status)) {
						throw new Error(`GOOGLE_CHAT_RETRYABLE_${response.status}`);
					}

					if (!response.ok) {
						throw new Error(`GOOGLE_CHAT_SEND_FAILED_${response.status}`);
					}
				},
				{
					attempts: env.notifyRetries,
					delayMs: 1000,
				},
			);
		},
	};
};

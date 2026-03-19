import type { EnvConfig } from "../config/env.js";
import type { Notifier } from "./types.js";
import { retry } from "../shared/retry.js";

import type { GoldItem, RunSummary } from "../parsers/types.js";
import {
	categorizeItem,
	formatPriceValue,
	formatSpreadValue,
	getSourceUpdatedLabel,
} from "../domain/presentation.js";
import { formatCrawledAt } from "../domain/format.js";

const shouldRetryHttp = (status: number): boolean => {
	return status === 429 || status >= 500;
};

const formatDecoratedText = (item: GoldItem) => {
	const category = categorizeItem(item);
	const buy = formatPriceValue(item.buy, category);
	const sell = formatPriceValue(item.sell, category);
	const spread = formatSpreadValue(item.spread, category);

	if (category === "international") {
		return {
			text: `<font color="#6ecda3">Buy ${buy}</font>  <font color="#e8a07a">Sell ${sell}</font>`,
			spread: spread,
		};
	}

	return {
		text: `<font color="#6ecda3">Buy ${buy}</font>  <font color="#e8a07a">Sell ${sell}</font>`,
		spread: spread,
	};
};

const mapItemToWidget = (item: GoldItem) => {
	const { text, spread } = formatDecoratedText(item);
	const updated = getSourceUpdatedLabel(item.sourceUpdatedAt);

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
		(item) => categorizeItem(item) === "international",
	);
	const domesticLuong = items.filter(
		(item) => categorizeItem(item) === "domestic-luong",
	);
	const domesticChi = items.filter(
		(item) => categorizeItem(item) === "domestic-chi",
	);

	const sections: Array<{
		header: string;
		widgets: Array<Record<string, unknown>>;
	}> = [];

	if (international.length > 0) {
		sections.push({
			header: "🌐 International",
			widgets: international.map((item) => mapItemToWidget(item)),
		});
	}

	if (domesticLuong.length > 0) {
		sections.push({
			header: "🇻🇳 Domestic — Lượng",
			widgets: domesticLuong.map((item) => mapItemToWidget(item)),
		});
	}

	if (domesticChi.length > 0) {
		sections.push({
			header: "🇻🇳 Domestic — Chỉ",
			widgets: domesticChi.map((item) => mapItemToWidget(item)),
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

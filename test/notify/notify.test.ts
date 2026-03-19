import { afterEach, describe, expect, it, vi } from "vitest";

import type { GoldItem } from "../../src/parsers/types.js";
import { createGoogleChatNotifier } from "../../src/notify/googleChat.js";
import { createTelegramNotifier } from "../../src/notify/telegram.js";

const payload = {
	summary: {
		runId: "run-20260303-100000",
		status: "ok" as const,
		suppliersConfigured: 4,
		suppliersSucceeded: 4,
		suppliersFailed: 0,
		errors: [],
	},
	items: [],
	message: "A_b test (gold)!",
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe("notifier payload mapping", () => {
	it("maps payload to google chat cardsV2", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("ok", { status: 200 }));

		const notifier = createGoogleChatNotifier({
			googleChatWebhookUrl: "https://chat.googleapis.com/mock",
			telegramBotToken: undefined,
			telegramChatId: undefined,
			crawlTimeoutMs: 30000,
			navigationRetries: 2,
			parseRetries: 1,
			notifyRetries: 1,
		});

		await notifier!.send(payload);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [, init] = fetchMock.mock.calls[0]!;
		const body = JSON.parse(String(init?.body));

		expect(body.text).toBeUndefined();
		expect(body.cardsV2).toBeDefined();
		expect(body.cardsV2[0].cardId).toBe("gold-price-card");
		expect(body.cardsV2[0].card.header.title).toBe("Gold Price Now");
	});

	it("maps message to telegram sendMessage payload as plain text", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("ok", { status: 200 }));

		const notifier = createTelegramNotifier({
			googleChatWebhookUrl: undefined,
			telegramBotToken: "123:abc",
			telegramChatId: "-1000001",
			crawlTimeoutMs: 30000,
			navigationRetries: 2,
			parseRetries: 1,
			notifyRetries: 1,
		});

		await notifier!.send(payload);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [, init] = fetchMock.mock.calls[0]!;
		expect(init?.body).not.toContain('"parse_mode":"MarkdownV2"');
		expect(init?.body).toContain("A_b test (gold)!");
	});
});

describe("google chat formatting (domestic vs international)", () => {
	it("formats domestic luong items with vi-VN locale and strips .000 from buy/sell/spread", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("ok", { status: 200 }));

		const domesticLuong: GoldItem = {
			supplierId: "24H",
			supplier: "GoldVN 24H",
			product: "SJC",
			buy: 175400,
			sell: 178400,
			spread: 3000,
			sourceUpdatedAt: "2026-03-19T10:22:00.000Z",
			sourceUrl: "https://24h.com.vn",
			crawledAt: new Date().toISOString(),
		};

		const notifier = createGoogleChatNotifier({
			googleChatWebhookUrl: "https://chat.googleapis.com/mock",
			telegramBotToken: undefined,
			telegramChatId: undefined,
			crawlTimeoutMs: 30000,
			navigationRetries: 2,
			parseRetries: 1,
			notifyRetries: 1,
		});

		await notifier!.send({
			summary: payload.summary,
			items: [domesticLuong],
			message: payload.message,
		});

		const [, init] = fetchMock.mock.calls[0]!;
		const body = JSON.parse(String(init?.body));
		const widgets = body.cardsV2[0].card.sections[0].widgets;

		expect(widgets[0].decoratedText.text).toContain("Buy 175.400");
		expect(widgets[0].decoratedText.text).toContain("Sell 178.400");
		expect(widgets[0].decoratedText.bottomLabel).toContain("Spread: 3");
	});

	it("formats domestic chi items with vi-VN locale and strips .000 from buy/sell/spread", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("ok", { status: 200 }));

		const domesticChi: GoldItem = {
			supplierId: "KIM_KHANH_VIET_HUNG",
			supplier: "Kim Khánh Việt Hùng",
			product: "Vàng 999.9",
			buy: 16670000,
			sell: 16920000,
			spread: 250000,
			sourceUpdatedAt: "2026-03-19T08:37:48.000Z",
			sourceUrl: "https://kimkhanhviethung.vn",
			crawledAt: new Date().toISOString(),
		};

		const notifier = createGoogleChatNotifier({
			googleChatWebhookUrl: "https://chat.googleapis.com/mock",
			telegramBotToken: undefined,
			telegramChatId: undefined,
			crawlTimeoutMs: 30000,
			navigationRetries: 2,
			parseRetries: 1,
			notifyRetries: 1,
		});

		await notifier!.send({
			summary: payload.summary,
			items: [domesticChi],
			message: payload.message,
		});

		const [, init] = fetchMock.mock.calls[0]!;
		const body = JSON.parse(String(init?.body));
		const widgets = body.cardsV2[0].card.sections[0].widgets;

		expect(widgets[0].decoratedText.text).toContain("Buy 16.670");
		expect(widgets[0].decoratedText.text).toContain("Sell 16.920");
		expect(widgets[0].decoratedText.bottomLabel).toContain("Spread: 250");
	});

	it("does not format international items (keeps raw numbers)", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("ok", { status: 200 }));

		const international: GoldItem = {
			supplierId: "GOLDPRICE",
			supplier: "GoldPrice",
			product: "Gold spot (USD/oz)",
			buy: 4855,
			sell: 4855,
			spread: 0,
			sourceUpdatedAt: "2026-03-18T23:19:05.000Z",
			sourceUrl: "https://goldprice.org",
			crawledAt: new Date().toISOString(),
		};

		const notifier = createGoogleChatNotifier({
			googleChatWebhookUrl: "https://chat.googleapis.com/mock",
			telegramBotToken: undefined,
			telegramChatId: undefined,
			crawlTimeoutMs: 30000,
			navigationRetries: 2,
			parseRetries: 1,
			notifyRetries: 1,
		});

		await notifier!.send({
			summary: payload.summary,
			items: [international],
			message: payload.message,
		});

		const [, init] = fetchMock.mock.calls[0]!;
		const body = JSON.parse(String(init?.body));
		const widgets = body.cardsV2[0].card.sections[0].widgets;

		expect(widgets[0].decoratedText.text).toContain("Buy 4855");
		expect(widgets[0].decoratedText.text).toContain("Sell 4855");
		expect(widgets[0].decoratedText.bottomLabel).toContain("Spread: 0");
	});

	it("handles small spreads without .000 suffix (e.g., 300 stays 300)", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("ok", { status: 200 }));

		const hoaKimNguyen: GoldItem = {
			supplierId: "HOA_KIM_NGUYEN",
			supplier: "Hoa Kim Nguyên",
			product: "9999 vĩ",
			buy: 16520,
			sell: 16820,
			spread: 300,
			sourceUpdatedAt: "2026-03-19T10:17:03.000Z",
			sourceUrl: "https://hoakimnguyen.com",
			crawledAt: new Date().toISOString(),
		};

		const notifier = createGoogleChatNotifier({
			googleChatWebhookUrl: "https://chat.googleapis.com/mock",
			telegramBotToken: undefined,
			telegramChatId: undefined,
			crawlTimeoutMs: 30000,
			navigationRetries: 2,
			parseRetries: 1,
			notifyRetries: 1,
		});

		await notifier!.send({
			summary: payload.summary,
			items: [hoaKimNguyen],
			message: payload.message,
		});

		const [, init] = fetchMock.mock.calls[0]!;
		const body = JSON.parse(String(init?.body));
		const widgets = body.cardsV2[0].card.sections[0].widgets;

		expect(widgets[0].decoratedText.text).toContain("Buy 16.520");
		expect(widgets[0].decoratedText.text).toContain("Sell 16.820");
		expect(widgets[0].decoratedText.bottomLabel).toContain("Spread: 300");
	});
});

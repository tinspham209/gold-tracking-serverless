import { afterEach, describe, expect, it, vi } from "vitest";

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
	it("maps message to google chat text payload", async () => {
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
		expect(init?.body).toContain('"text":"A_b test (gold)!"');
	});

	it("maps message to telegram sendMessage payload with escaping", async () => {
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
		expect(init?.body).toContain('"parse_mode":"MarkdownV2"');
		expect(init?.body).toContain("A\\\\_b test \\\\(gold\\\\)\\\\!");
	});
});

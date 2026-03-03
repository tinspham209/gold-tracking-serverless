import type { EnvConfig } from "../config/env.js";
import type { Notifier } from "./types.js";
import { retry } from "../shared/retry.js";

const escapeTelegramMarkdown = (value: string): string => {
	return value.replace(/([_\*\[\]\(\)~`>#+\-=|{}.!])/g, "\\$1");
};

const shouldRetryHttp = (status: number): boolean => {
	return status === 429 || status >= 500;
};

export const createTelegramNotifier = (
	env: EnvConfig,
): Notifier | undefined => {
	if (!env.telegramBotToken || !env.telegramChatId) {
		return undefined;
	}

	const endpoint = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;

	return {
		channel: "telegram",
		send: async (payload) => {
			await retry(
				async () => {
					const response = await fetch(endpoint, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							chat_id: env.telegramChatId,
							text: escapeTelegramMarkdown(payload.message),
							parse_mode: "MarkdownV2",
						}),
					});

					if (!response.ok && shouldRetryHttp(response.status)) {
						throw new Error(`TELEGRAM_RETRYABLE_${response.status}`);
					}

					if (!response.ok) {
						throw new Error(`TELEGRAM_SEND_FAILED_${response.status}`);
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

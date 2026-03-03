import type { EnvConfig } from "../config/env.js";
import type { Notifier } from "./types.js";
import { retry } from "../shared/retry.js";

const shouldRetryHttp = (status: number): boolean => {
	return status === 429 || status >= 500;
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
			await retry(
				async () => {
					const response = await fetch(env.googleChatWebhookUrl!, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							text: payload.message,
						}),
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

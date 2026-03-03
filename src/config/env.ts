import { config as loadDotenv } from "dotenv";

loadDotenv({ override: false });

export interface EnvConfig {
	googleChatWebhookUrl?: string;
	telegramBotToken?: string;
	telegramChatId?: string;
	crawlTimeoutMs: number;
	navigationRetries: number;
	parseRetries: number;
	notifyRetries: number;
}

const toOptionalString = (value: string | undefined): string | undefined => {
	if (!value) {
		return undefined;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const toPositiveInt = (value: string | undefined, fallback: number): number => {
	if (!value) {
		return fallback;
	}

	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getEnvConfig = (
	env: NodeJS.ProcessEnv = process.env,
): EnvConfig => {
	return {
		googleChatWebhookUrl: toOptionalString(env.GOOGLE_CHAT_WEBHOOK_URL),
		telegramBotToken: toOptionalString(env.TELEGRAM_BOT_TOKEN),
		telegramChatId: toOptionalString(env.TELEGRAM_CHAT_ID),
		crawlTimeoutMs: toPositiveInt(env.CRAWL_TIMEOUT_MS, 30_000),
		navigationRetries: toPositiveInt(env.NAVIGATION_RETRIES, 2),
		parseRetries: toPositiveInt(env.PARSE_RETRIES, 1),
		notifyRetries: toPositiveInt(env.NOTIFY_RETRIES, 2),
	};
};

export const hasAnyNotifierConfigured = (config: EnvConfig): boolean => {
	const hasGoogleChat = Boolean(config.googleChatWebhookUrl);
	const hasTelegram = Boolean(config.telegramBotToken && config.telegramChatId);
	return hasGoogleChat || hasTelegram;
};

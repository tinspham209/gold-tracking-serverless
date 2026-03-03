import type { GoldItem, RunSummary } from "../parsers/types.js";

export interface NotifyPayload {
	summary: RunSummary;
	items: GoldItem[];
	message: string;
}

export interface Notifier {
	channel: "google-chat" | "telegram";
	send: (payload: NotifyPayload) => Promise<void>;
}

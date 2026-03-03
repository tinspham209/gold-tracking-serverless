export type LogLevel = "info" | "warn" | "error";

export interface LogContext {
	supplier?: string;
	durationMs?: number;
	parsedCount?: number;
	status?: string;
	errorCode?: string;
	message?: string;
}

const sanitizeContext = (context: LogContext): LogContext => {
	const sanitized = { ...context };

	if (sanitized.message) {
		sanitized.message = sanitized.message
			.replace(/(bot\d+:[A-Za-z0-9_-]+)/gi, "[REDACTED_TOKEN]")
			.replace(/https?:\/\/[^\s]+/gi, "[REDACTED_URL]");
	}

	return sanitized;
};

export const log = (
	level: LogLevel,
	event: string,
	context: LogContext = {},
): void => {
	const payload = {
		ts: new Date().toISOString(),
		level,
		event,
		...sanitizeContext(context),
	};

	const line = JSON.stringify(payload);

	if (level === "error") {
		console.error(line);
		return;
	}

	if (level === "warn") {
		console.warn(line);
		return;
	}

	console.log(line);
};

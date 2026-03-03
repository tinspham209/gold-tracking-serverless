export interface RetryOptions {
	attempts: number;
	delayMs: number;
	shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const defaultShouldRetry = (): boolean => true;

const sleep = async (delayMs: number): Promise<void> => {
	await new Promise((resolve) => {
		setTimeout(resolve, delayMs);
	});
};

export const retry = async <T>(
	operation: (attempt: number) => Promise<T>,
	options: RetryOptions,
): Promise<T> => {
	const totalAttempts = Math.max(1, options.attempts);
	const shouldRetry = options.shouldRetry ?? defaultShouldRetry;

	let lastError: unknown;

	for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
		try {
			return await operation(attempt);
		} catch (error) {
			lastError = error;

			const canRetry = attempt < totalAttempts && shouldRetry(error, attempt);
			if (!canRetry) {
				throw error;
			}

			if (options.delayMs > 0) {
				await sleep(options.delayMs);
			}
		}
	}

	throw lastError;
};

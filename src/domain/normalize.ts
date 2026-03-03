const ONLY_DIGITS = /[^0-9]/g;

export const normalizeVnd = (value: string): number => {
	const digits = value.replace(ONLY_DIGITS, "");

	if (!digits) {
		throw new Error(`Cannot normalize VND value: ${value}`);
	}

	return Number.parseInt(digits, 10);
};

export const normalizeSourceUpdatedAt = (
	value: string | undefined,
): string | undefined => {
	if (!value) {
		return undefined;
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return undefined;
	}

	const directDate = new Date(trimmed);
	if (!Number.isNaN(directDate.getTime())) {
		return directDate.toISOString();
	}

	const now = new Date();
	const match = trimmed.match(
		/(\d{1,2})[/:hH](\d{1,2})(?:\s*(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?)?/,
	);

	if (!match) {
		return undefined;
	}

	const hour = Number.parseInt(match[1], 10);
	const minute = Number.parseInt(match[2], 10);
	const day = match[3] ? Number.parseInt(match[3], 10) : now.getDate();
	const month = match[4] ? Number.parseInt(match[4], 10) : now.getMonth() + 1;
	const year = match[5]
		? Number.parseInt(match[5].length === 2 ? `20${match[5]}` : match[5], 10)
		: now.getFullYear();

	const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);

	return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

export const nowIso = (): string => new Date().toISOString();

export const createRunId = (): string => {
	const now = new Date();
	const yyyy = now.getUTCFullYear();
	const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
	const dd = String(now.getUTCDate()).padStart(2, "0");
	const hh = String(now.getUTCHours()).padStart(2, "0");
	const min = String(now.getUTCMinutes()).padStart(2, "0");
	const sec = String(now.getUTCSeconds()).padStart(2, "0");

	return `run-${yyyy}${mm}${dd}-${hh}${min}${sec}`;
};

import { getEnvConfig } from "./config/env.js";
import { SUPPLIERS, type SupplierId } from "./config/suppliers.js";
import { createBrowser } from "./crawler/browser.js";
import { runSupplier } from "./crawler/runSupplier.js";
import { formatRunMessage } from "./domain/format.js";
import { calculateSpread } from "./domain/metrics.js";
import { normalizeSourceUpdatedAt, normalizeVnd } from "./domain/normalize.js";
import { createGoogleChatNotifier } from "./notify/googleChat.js";
import { createTelegramNotifier } from "./notify/telegram.js";
import type {
	GoldItem,
	RunResult,
	RunStatus,
	SupplierError,
	SupplierParser,
} from "./parsers/types.js";
import { parse24h } from "./parsers/parser24h.js";
import { parseHoaKimNguyen } from "./parsers/parserHoaKimNguyen.js";
import { parseKimKhanhVietHung } from "./parsers/parserKimKhanhVietHung.js";
import { parseNgocThinh } from "./parsers/parserNgocThinh.js";
import { parseGoldPrice } from "./parsers/parserGoldPrice.js";
import { log } from "./shared/logger.js";
import { createRunId, nowIso } from "./shared/time.js";

const parserMap: Record<SupplierId, SupplierParser> = {
	"24H": parse24h,
	KIM_KHANH_VIET_HUNG: parseKimKhanhVietHung,
	HOA_KIM_NGUYEN: parseHoaKimNguyen,
	NGOC_THINH: parseNgocThinh,
	GOLDPRICE: parseGoldPrice,
};

const deriveRunStatus = (succeeded: number, failed: number): RunStatus => {
	if (succeeded === 0) {
		return "failed";
	}

	if (failed === 0) {
		return "ok";
	}

	return "partial";
};

const buildItems = (
	rows: Awaited<ReturnType<typeof runSupplier>>[],
	crawledAt: string,
): GoldItem[] => {
	const items: GoldItem[] = [];

	for (const result of rows) {
		if (!result.ok) {
			continue;
		}

		for (const row of result.rows) {
			const buy = normalizeVnd(row.buyRaw);
			const sell = normalizeVnd(row.sellRaw);

			items.push({
				supplier: row.supplier,
				product: row.product,
				buy,
				sell,
				spread: calculateSpread(buy, sell),
				sourceUpdatedAt: normalizeSourceUpdatedAt(row.sourceUpdatedAtRaw),
				crawledAt,
				sourceUrl: row.sourceUrl,
			});
		}
	}

	return items;
};

const main = async (): Promise<RunResult> => {
	const env = getEnvConfig();
	const runId = createRunId();
	const crawledAt = nowIso();
	const browser = await createBrowser();

	try {
		const results = await Promise.all(
			SUPPLIERS.map((supplier) => {
				const parser = parserMap[supplier.supplierId];
				return runSupplier(browser, supplier, parser, env);
			}),
		);

		const errors: SupplierError[] = results
			.filter((result) => !result.ok)
			.map((result) => ({
				supplier: result.supplier,
				errorCode: result.errorCode,
				message: result.message,
			}));

		const suppliersSucceeded = results.filter((result) => result.ok).length;
		const suppliersFailed = results.length - suppliersSucceeded;
		const status = deriveRunStatus(suppliersSucceeded, suppliersFailed);

		const items = buildItems(results, crawledAt);

		const summary = {
			runId,
			status,
			suppliersConfigured: SUPPLIERS.length,
			suppliersSucceeded,
			suppliersFailed,
			errors,
		};

		const message = formatRunMessage(summary, items);
		const payload = { summary, items, message };

		const notifiers = [
			createGoogleChatNotifier(env),
			createTelegramNotifier(env),
		].filter((notifier) => notifier !== undefined);

		if (notifiers.length === 0) {
			log("warn", "notify_skipped", {
				status,
				message: "No notifier configured; run completed in log-only mode.",
			});
			console.log(message);
		} else {
			const notifyResults = await Promise.allSettled(
				notifiers.map((notifier) => notifier.send(payload)),
			);

			notifyResults.forEach((result, index) => {
				if (result.status === "fulfilled") {
					return;
				}

				const failedNotifier = notifiers[index];
				const notifyMessage =
					result.reason instanceof Error
						? result.reason.message
						: "Unknown notify error";

				log("error", "notify_channel_failed", {
					status,
					errorCode: `NOTIFY_${failedNotifier.channel.toUpperCase().replace("-", "_")}_FAILED`,
					message: notifyMessage,
				});
			});
		}

		log("info", "run_completed", {
			status,
			parsedCount: items.length,
		});

		return {
			summary,
			items,
		};
	} finally {
		await browser.close();
	}
};

main().catch((error: unknown) => {
	const message =
		error instanceof Error ? error.message : "Unknown fatal error";
	log("error", "run_failed", {
		status: "failed",
		errorCode: "RUN_FATAL",
		message,
	});
	process.exitCode = 1;
});

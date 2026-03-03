import type { Browser } from "playwright";

import type { EnvConfig } from "../config/env.js";
import type { SupplierTarget } from "../config/suppliers.js";
import type {
	ParsedGoldRow,
	SupplierExecutionResult,
	SupplierParser,
} from "../parsers/types.js";
import { log } from "../shared/logger.js";
import { retry } from "../shared/retry.js";

export const runSupplier = async (
	browser: Browser,
	supplier: SupplierTarget,
	parser: SupplierParser,
	env: EnvConfig,
): Promise<SupplierExecutionResult> => {
	const startedAt = Date.now();

	try {
		const page = await browser.newPage();

		try {
			const rows = await retry<ParsedGoldRow[]>(
				async () => {
					await retry(
						async () => {
							await page.goto(supplier.sourceUrl, {
								waitUntil: "domcontentloaded",
								timeout: env.crawlTimeoutMs,
							});
						},
						{
							attempts: env.navigationRetries,
							delayMs: 800,
						},
					);

					return retry(async () => parser(page, supplier), {
						attempts: env.parseRetries,
						delayMs: 400,
					});
				},
				{
					attempts: 1,
					delayMs: 0,
				},
			);

			const durationMs = Date.now() - startedAt;
			log("info", "supplier_completed", {
				supplier: supplier.supplierName,
				durationMs,
				parsedCount: rows.length,
				status: "ok",
			});

			return {
				supplier: supplier.supplierName,
				ok: true,
				rows,
				durationMs,
			};
		} finally {
			try {
				await page.close();
			} catch (closeError) {
				const closeMessage =
					closeError instanceof Error
						? closeError.message
						: "Unknown page close error";

				log("warn", "supplier_page_close_failed", {
					supplier: supplier.supplierName,
					status: "partial",
					errorCode: "PAGE_CLOSE_FAILED",
					message: closeMessage,
				});
			}
		}
	} catch (error) {
		const durationMs = Date.now() - startedAt;
		const message =
			error instanceof Error ? error.message : "Unknown supplier error";

		log("error", "supplier_failed", {
			supplier: supplier.supplierName,
			durationMs,
			status: "failed",
			errorCode: "SUPPLIER_RUN_FAILED",
			message,
		});

		return {
			supplier: supplier.supplierName,
			ok: false,
			durationMs,
			errorCode: "SUPPLIER_RUN_FAILED",
			message,
		};
	}
};

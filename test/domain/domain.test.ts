import { describe, expect, it } from "vitest";

import { formatRunMessage } from "../../src/domain/format.js";
import { calculateSpread } from "../../src/domain/metrics.js";
import {
	normalizeSourceUpdatedAt,
	normalizeVnd,
} from "../../src/domain/normalize.js";

describe("domain normalize + metrics", () => {
	it("normalizes vnd values with separators", () => {
		expect(normalizeVnd("17.700.000đ")).toBe(17700000);
		expect(normalizeVnd("186,400")).toBe(186400);
	});

	it("calculates spread", () => {
		expect(calculateSpread(17650000, 17900000)).toBe(250000);
	});

	it("normalizes source updated at text to iso", () => {
		const value = normalizeSourceUpdatedAt("08:24 03/03/2026");

		expect(value).toBeDefined();
		expect(value).toContain("2026-03-03T");
	});

	it("keeps sourceUpdatedAt display as provided", () => {
		const message = formatRunMessage(
			{
				runId: "run-20260303-043555",
				status: "ok",
				suppliersConfigured: 1,
				suppliersSucceeded: 1,
				suppliersFailed: 0,
				errors: [],
			},
			[
				{
					supplier: "24h",
					product: "SJC",
					buy: 186400,
					sell: 189400,
					spread: 3000,
					sourceUpdatedAt: "03/03/2026 11:32",
					crawledAt: "2026-03-03T04:35:55.000Z",
					sourceUrl: "https://example.com",
				},
			],
			"2026-03-03T04:35:55.000Z",
		);

		expect(message).toContain("Crawl at:");
		expect(message).toContain("Gold Price now:");
		expect(message).toContain("03/03/2026 11:32");
	});
});

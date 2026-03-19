import { describe, expect, it } from "vitest";

import {
	categorizeItem,
	formatPriceValue,
	formatSpreadValue,
	getSourceUpdatedLabel,
} from "../../src/domain/presentation.js";
import type { GoldItem } from "../../src/parsers/types.js";

describe("presentation helpers", () => {
	describe("categorizeItem", () => {
		it("classifies GoldPrice as international", () => {
			const item: GoldItem = {
				supplier: "GoldPrice",
				product: "Gold spot (USD/oz)",
				buy: 4855,
				sell: 4855,
				spread: 0,
				sourceUpdatedAt: "unknown",
				crawledAt: new Date().toISOString(),
				sourceUrl: "https://goldprice.org",
			};

			expect(categorizeItem(item)).toBe("international");
		});

		it("classifies 24h as domestic-luong", () => {
			const item: GoldItem = {
				supplier: "GoldVN 24H",
				product: "SJC",
				buy: 175400,
				sell: 178400,
				spread: 3000,
				sourceUpdatedAt: "10:50",
				crawledAt: new Date().toISOString(),
				sourceUrl: "https://24h.com.vn",
			};

			expect(categorizeItem(item)).toBe("domestic-luong");
		});

		it("classifies other suppliers as domestic-chi", () => {
			const item: GoldItem = {
				supplier: "Kim Khánh Việt Hùng",
				product: "Vàng 999.9",
				buy: 16670000,
				sell: 16920000,
				spread: 250000,
				sourceUpdatedAt: "08:37",
				crawledAt: new Date().toISOString(),
				sourceUrl: "https://kimkhanhviethung.vn",
			};

			expect(categorizeItem(item)).toBe("domestic-chi");
		});
	});

	describe("formatPriceValue", () => {
		it("formats international values as raw numbers (no grouping)", () => {
			const value = 4855;
			const formatted = formatPriceValue(value, "international");
			expect(formatted).toBe("4855");
		});

		it("formats domestic-luong values with vi-VN grouping and strips .000", () => {
			const value = 175400;
			const formatted = formatPriceValue(value, "domestic-luong");
			expect(formatted).toBe("175.400");
		});

		it("formats domestic-chi values with vi-VN grouping and strips .000", () => {
			const value = 16670000;
			const formatted = formatPriceValue(value, "domestic-chi");
			expect(formatted).toBe("16.670");
		});

		it("does not strip .000 if not present", () => {
			const value = 300;
			const formatted = formatPriceValue(value, "domestic-chi");
			expect(formatted).toBe("300");
		});
	});

	describe("formatSpreadValue", () => {
		it("delegates to formatPriceValue", () => {
			const value = 3000;
			const formatted = formatSpreadValue(value, "domestic-luong");
			expect(formatted).toBe("3");
		});
	});

	describe("getSourceUpdatedLabel", () => {
		it("returns raw value when provided", () => {
			const label = getSourceUpdatedLabel("10:50 19/03/2026");
			expect(label).toBe("10:50 19/03/2026");
		});

		it("returns unknown when value is undefined", () => {
			const label = getSourceUpdatedLabel(undefined);
			expect(label).toBe("unknown");
		});

		it("trims whitespace", () => {
			const label = getSourceUpdatedLabel("  10:50  ");
			expect(label).toBe("10:50");
		});
	});
});

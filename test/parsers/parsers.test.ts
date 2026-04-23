import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Page } from "playwright";
import { describe, expect, it } from "vitest";

import { SUPPLIERS } from "../../src/config/suppliers.js";
import { parse24h } from "../../src/parsers/parser24h.js";
import { parseHoaKimNguyen } from "../../src/parsers/parserHoaKimNguyen.js";
import { parseKimKhanhVietHung } from "../../src/parsers/parserKimKhanhVietHung.js";
import { parseNgocThinh } from "../../src/parsers/parserNgocThinh.js";
import { parseGoldPrice } from "../../src/parsers/parserGoldPrice.js";

const fixture = (name: string): string => {
	return readFileSync(join(process.cwd(), "test", "fixtures", name), "utf8");
};

const fakePage = (text: string): Page => {
	return {
		locator: () => ({
			innerText: async () => text,
		}),
	} as unknown as Page;
};

describe("supplier parsers", () => {
	it("parses 24h rows for SJC, PNJ Hà Nội and DOJI HN", async () => {
		const supplier = SUPPLIERS.find((item) => item.supplierId === "24H")!;
		const rows = await parse24h(fakePage(fixture("24h.html")), supplier);

		expect(rows).toHaveLength(3);
		expect(rows[0].product).toBe("SJC");
		expect(rows[0].buyRaw).toBe("186,400");
		expect(rows[0].sellRaw).toBe("189,400");
		expect(rows[1].product).toBe("PNJ Hà Nội");
		expect(rows[2].product).toBe("DOJI HN");
		expect(rows[2].buyRaw).toBe("186,300");
		expect(rows[2].sellRaw).toBe("189,300");
	});

	it("parses Kim Khánh Việt Hùng row", async () => {
		const supplier = SUPPLIERS.find(
			(item) => item.supplierId === "KIM_KHANH_VIET_HUNG",
		)!;
		const rows = await parseKimKhanhVietHung(
			fakePage(fixture("kim-khanh-viet-hung.html")),
			supplier,
		);

		expect(rows).toHaveLength(1);
		expect(rows[0].product).toBe("Vàng 999.9");
		expect(rows[0].buyRaw).toBe("17.700.000");
		expect(rows[0].sellRaw).toBe("17.980.000");
	});

	it("parses Hoa Kim Nguyên row", async () => {
		const supplier = SUPPLIERS.find(
			(item) => item.supplierId === "HOA_KIM_NGUYEN",
		)!;
		const rows = await parseHoaKimNguyen(
			fakePage(fixture("hoa-kim-nguyen.html")),
			supplier,
		);

		expect(rows).toHaveLength(1);
		expect(rows[0].product).toBe("9999 vĩ");
		expect(rows[0].buyRaw).toBe("17680");
		expect(rows[0].sellRaw).toBe("18040");
	});

	it("parses Ngọc Thịnh row", async () => {
		const supplier = SUPPLIERS.find(
			(item) => item.supplierId === "NGOC_THINH",
		)!;
		const rows = await parseNgocThinh(
			fakePage(fixture("ngoc-thinh.html")),
			supplier,
		);

		expect(rows).toHaveLength(1);
		expect(rows[0].product).toBe("Vàng 9999 (nhẫn tròn)");
		expect(rows[0].buyRaw).toBe("17.650.000");
		expect(rows[0].sellRaw).toBe("17.900.000");
	});

	it("parses GoldPrice world gold USD row", async () => {
		const supplier = SUPPLIERS.find((item) => item.supplierId === "GOLDPRICE")!;
		const rows = await parseGoldPrice(
			fakePage(fixture("goldprice.html")),
			supplier,
		);

		expect(rows).toHaveLength(1);
		expect(rows[0].product).toBe("Gold spot (USD/oz)");
		expect(rows[0].buyRaw).toBe("5295");
		expect(rows[0].sellRaw).toBe("5295");
		expect(rows[0].sourceUpdatedAtRaw).toBe("04:15 NY Time");
	});

	it("parses GoldPrice with NY footer last_updated", async () => {
		const supplier = SUPPLIERS.find((item) => item.supplierId === "GOLDPRICE")!;
		const rows = await parseGoldPrice(
			fakePage(fixture("goldprice-holdings.html")),
			supplier,
		);

		expect(rows).toHaveLength(1);
		expect(rows[0].product).toBe("Gold spot (USD/oz)");
		expect(rows[0].buyRaw).toBe("5143");
		expect(rows[0].sellRaw).toBe("5143");
		expect(rows[0].sourceUpdatedAtRaw).toBe(
			"Mar 3rd 2026, 09:20:05 am NY time",
		);
	});
});

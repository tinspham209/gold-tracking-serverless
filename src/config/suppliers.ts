export type SupplierId =
	| "24H"
	| "KIM_KHANH_VIET_HUNG"
	| "HOA_KIM_NGUYEN"
	| "NGOC_THINH"
	| "GOLDPRICE";

export interface SupplierTarget {
	supplierId: SupplierId;
	supplierName: string;
	sourceUrl: string;
	products: string[];
}

export const SUPPLIERS: SupplierTarget[] = [
	{
		supplierId: "GOLDPRICE",
		supplierName: "GoldPrice",
		sourceUrl: "https://goldprice.org/",
		products: ["Gold spot (USD/oz)"],
	},
	{
		supplierId: "24H",
		supplierName: "GoldVN 24H",
		sourceUrl: "https://www.24h.com.vn/gia-vang-hom-nay-c425.html",
		products: ["SJC", "PNJ Hà Nội"],
	},
	{
		supplierId: "KIM_KHANH_VIET_HUNG",
		supplierName: "Kim Khánh Việt Hùng",
		sourceUrl: "https://kimkhanhviethung.vn/tra-cuu-gia-vang.html",
		products: ["Vàng 999.9"],
	},
	{
		supplierId: "HOA_KIM_NGUYEN",
		supplierName: "Hoa Kim Nguyên",
		sourceUrl: "https://hoakimnguyen.com/tra-cuu-gia-vang/",
		products: ["9999 vĩ"],
	},
	{
		supplierId: "NGOC_THINH",
		supplierName: "Ngọc Thịnh Jewelry",
		sourceUrl:
			"https://ngocthinh-jewelry.vn/pages/bang-gia-vang?srsltid=AfmBOoq5tMd-2wmZ7g_RKBRlinDJavXPxMxCZG-7OXWP1FTtn5VgNFHo",
		products: ["Vàng 9999 (nhẫn tròn)"],
	},
];

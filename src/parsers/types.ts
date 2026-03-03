import type { SupplierId } from "../config/suppliers.js";
import type { SupplierTarget } from "../config/suppliers.js";
import type { Page } from "playwright";

export interface ParsedGoldRow {
	supplierId: SupplierId;
	supplier: string;
	product: string;
	buyRaw: string;
	sellRaw: string;
	sourceUpdatedAtRaw?: string;
	sourceUrl: string;
}

export interface GoldItem {
	supplier: string;
	product: string;
	buy: number;
	sell: number;
	spread: number;
	sourceUpdatedAt?: string;
	crawledAt: string;
	sourceUrl: string;
}

export type RunStatus = "ok" | "partial" | "failed";

export interface SupplierError {
	supplier: string;
	errorCode: string;
	message: string;
}

export interface RunSummary {
	runId: string;
	status: RunStatus;
	suppliersConfigured: number;
	suppliersSucceeded: number;
	suppliersFailed: number;
	errors: SupplierError[];
}

export interface RunResult {
	summary: RunSummary;
	items: GoldItem[];
}

export type SupplierParser = (
	page: Page,
	supplier: SupplierTarget,
) => Promise<ParsedGoldRow[]>;

export interface SupplierExecutionSuccess {
	supplier: string;
	ok: true;
	rows: ParsedGoldRow[];
	durationMs: number;
}

export interface SupplierExecutionFailure {
	supplier: string;
	ok: false;
	durationMs: number;
	errorCode: string;
	message: string;
}

export type SupplierExecutionResult =
	| SupplierExecutionSuccess
	| SupplierExecutionFailure;

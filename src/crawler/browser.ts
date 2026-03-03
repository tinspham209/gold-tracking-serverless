import { chromium, type Browser } from "playwright";

export const createBrowser = async (): Promise<Browser> => {
	return chromium.launch({
		headless: true,
	});
};

import { describe, expect, test } from "vite-plus/test";

import { promptSettingsSchema } from "../../src/configuration";

describe("promptSettingsSchema", () => {
	test("defaults settings when omitted", () => {
		expect(promptSettingsSchema.parse({})).toEqual({
			horizontalPadding: 0,
			promptPrefix: "π",
		});
	});

	test("prefaults an undefined input to the schema defaults", () => {
		expect(promptSettingsSchema.parse(undefined)).toEqual({
			horizontalPadding: 0,
			promptPrefix: "π",
		});
	});

	test("accepts a non-negative integer padding", () => {
		expect(promptSettingsSchema.parse({ horizontalPadding: 4 })).toEqual({
			horizontalPadding: 4,
			promptPrefix: "π",
		});
	});

	test("accepts a custom prompt prefix", () => {
		expect(promptSettingsSchema.parse({ promptPrefix: "❯" })).toEqual({
			horizontalPadding: 0,
			promptPrefix: "❯",
		});
	});

	test("rejects a negative padding", () => {
		expect(() => promptSettingsSchema.parse({ horizontalPadding: -1 })).toThrow();
	});

	test("rejects a non-integer padding", () => {
		expect(() => promptSettingsSchema.parse({ horizontalPadding: 1.5 })).toThrow();
	});
});

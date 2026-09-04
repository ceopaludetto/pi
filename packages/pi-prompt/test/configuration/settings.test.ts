import { describe, expect, test } from "vite-plus/test";

import { promptSettingsSchema } from "../../src/configuration";

describe("promptSettingsSchema", () => {
	test("defaults horizontalPadding to 0 when omitted", () => {
		expect(promptSettingsSchema.parse({})).toEqual({ horizontalPadding: 0 });
	});

	test("prefaults an undefined input to the schema defaults", () => {
		expect(promptSettingsSchema.parse(undefined)).toEqual({ horizontalPadding: 0 });
	});

	test("accepts a non-negative integer padding", () => {
		expect(promptSettingsSchema.parse({ horizontalPadding: 4 })).toEqual({ horizontalPadding: 4 });
	});

	test("rejects a negative padding", () => {
		expect(() => promptSettingsSchema.parse({ horizontalPadding: -1 })).toThrow();
	});

	test("rejects a non-integer padding", () => {
		expect(() => promptSettingsSchema.parse({ horizontalPadding: 1.5 })).toThrow();
	});
});

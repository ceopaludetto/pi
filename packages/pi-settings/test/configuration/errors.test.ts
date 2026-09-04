import type { StandardSchemaV1 } from "@standard-schema/spec";

import { describe, expect, test } from "vite-plus/test";

import {
	InvalidPluginNameError,
	SettingsIoError,
	SettingsNotFoundError,
	SettingsParseError,
	SettingsValidationError,
} from "../../src";

describe("InvalidPluginNameError", () => {
	test("builds a descriptive message from the plugin and reason", () => {
		const error = new InvalidPluginNameError({ plugin: "@scope/name", reason: "it is empty" });

		expect(error._tag).toBe("InvalidPluginNameError");
		expect(error.plugin).toBe("@scope/name");
		expect(error.message).toBe("Invalid plugin name \"@scope/name\": it is empty");
	});
});

describe("SettingsNotFoundError", () => {
	test("includes the plugin and path", () => {
		const error = new SettingsNotFoundError({ plugin: "@scope/name", path: "/tmp/settings.json" });

		expect(error._tag).toBe("SettingsNotFoundError");
		expect(error.message).toBe("No settings found for \"@scope/name\" at /tmp/settings.json");
	});
});

describe("SettingsIoError", () => {
	test("unwraps an Error cause message", () => {
		const error = new SettingsIoError({
			plugin: "@scope/name",
			path: "/tmp/settings.json",
			operation: "read",
			cause: new Error("boom"),
		});

		expect(error._tag).toBe("SettingsIoError");
		expect(error.operation).toBe("read");
		expect(error.message).toBe("Failed to read settings at /tmp/settings.json: boom");
	});

	test("stringifies a non-Error cause", () => {
		const error = new SettingsIoError({
			plugin: "@scope/name",
			path: "/tmp/settings.json",
			operation: "write",
			cause: "disk full",
		});

		expect(error.message).toBe("Failed to write settings at /tmp/settings.json: disk full");
	});
});

describe("SettingsParseError", () => {
	test("reports the JSON failure detail", () => {
		const error = new SettingsParseError({
			plugin: "@scope/name",
			path: "/tmp/settings.json",
			cause: new Error("Unexpected token"),
		});

		expect(error._tag).toBe("SettingsParseError");
		expect(error.message).toBe("Invalid JSON in settings at /tmp/settings.json: Unexpected token");
	});
});

describe("SettingsValidationError", () => {
	test("joins issues with their dotted paths", () => {
		const issues: ReadonlyArray<StandardSchemaV1.Issue> = [
			{ message: "Required", path: ["symbol"] },
			{ message: "Too long", path: [{ key: "nested" }, "field"] },
			{ message: "Root issue" },
		];

		const error = new SettingsValidationError({ plugin: "@scope/name", path: "/tmp/settings.json", issues });

		expect(error._tag).toBe("SettingsValidationError");
		expect(error.message).toBe(
			"Invalid settings at /tmp/settings.json: symbol: Required; nested.field: Too long; Root issue",
		);
	});
});

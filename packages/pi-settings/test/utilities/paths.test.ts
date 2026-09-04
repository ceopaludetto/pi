import { join } from "node:path";

import { afterEach, describe, expect, test } from "vite-plus/test";

import { InvalidPluginNameError, normalizePluginName, resolveSettingsDirectory, resolveSettingsPath } from "../../src";

const originalAgentDirectory = process.env.PI_AGENT_DIR;
const originalHome = process.env.PI_HOME;

afterEach(() => {
	process.env.PI_AGENT_DIR = originalAgentDirectory;
	process.env.PI_HOME = originalHome;
});

describe("resolveSettingsPath", () => {
	test("maps the plugin identifier to a nested settings.json", () => {
		process.env.PI_HOME = "/tmp/home";
		delete process.env.PI_AGENT_DIR;

		const path = resolveSettingsPath("@ceo.paludetto/pi-prompt").unwrapOr("");

		expect(path).toBe(join("/tmp/home", ".pi", "agent", "settings", "@ceo.paludetto", "pi-prompt", "settings.json"));
	});

	test("honours PI_AGENT_DIR", () => {
		process.env.PI_AGENT_DIR = "/custom/agent";

		expect(resolveSettingsDirectory()).toBe(join("/custom", "agent", "settings"));
	});

	test("rejects traversal identifiers", () => {
		const result = resolveSettingsPath("../../etc/passwd");

		expect(result.isErr()).toBe(true);
		expect(InvalidPluginNameError.is(result.isErr() ? result.error : null)).toBe(true);
	});

	test("rejects empty identifiers", () => {
		expect(normalizePluginName("   ").isErr()).toBe(true);
	});
});

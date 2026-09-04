import { mkdirSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { z } from "zod";

import { defineSettings, loadSettings } from "../src";

const PLUGIN = "@ceo.paludetto/pi-prompt";

const schema = z.object({
	symbol: z.string().default("π"),
	color: z.string().optional(),
});

let agentDirectory: string;
const originalAgentDirectory = process.env.PI_AGENT_DIR;

beforeEach(async () => {
	agentDirectory = await mkdtemp(join(tmpdir(), "pi-settings-"));
	process.env.PI_AGENT_DIR = agentDirectory;
});

afterEach(async () => {
	process.env.PI_AGENT_DIR = originalAgentDirectory;
	await rm(agentDirectory, { recursive: true, force: true });
});

function settingsPath(): string {
	return join(agentDirectory, "settings", "@ceo.paludetto", "pi-prompt", "settings.json");
}

async function seed(content: string): Promise<void> {
	const path = settingsPath();
	mkdirSync(dirname(path), { recursive: true });
	await writeFile(path, content, "utf8");
}

describe("defineSettings", () => {
	test("loads and validates an existing settings file", async () => {
		await seed(JSON.stringify({ symbol: ">", color: "cyan" }));

		const result = await defineSettings(PLUGIN, schema).load();

		expect(result.isOk()).toBe(true);
		expect(result.unwrapOr(null)).toEqual({ symbol: ">", color: "cyan" });
	});

	test("fails with SettingsNotFoundError when no file exists", async () => {
		const result = await loadSettings(PLUGIN, schema);

		expect(result.isErr()).toBe(true);
		expect(result.isErr() ? result.error._tag : null).toBe("SettingsNotFoundError");
	});

	test("applies schema defaults when defaults option is provided", async () => {
		const result = await loadSettings(PLUGIN, schema, { defaults: {} });

		expect(result.unwrapOr(null)).toEqual({ symbol: "π" });
	});

	test("fails with SettingsParseError on invalid JSON", async () => {
		await seed("{ not json");

		const result = await loadSettings(PLUGIN, schema);

		expect(result.isErr() ? result.error._tag : null).toBe("SettingsParseError");
	});

	test("fails with SettingsValidationError on schema mismatch", async () => {
		await seed(JSON.stringify({ symbol: 42 }));

		const result = await loadSettings(PLUGIN, schema);

		expect(result.isErr() ? result.error._tag : null).toBe("SettingsValidationError");
	});

	test("loadOr returns the fallback on failure", async () => {
		const value = await defineSettings(PLUGIN, schema).loadOr({ symbol: "fallback" });

		expect(value).toEqual({ symbol: "fallback" });
	});

	test("save writes validated settings and creates directories", async () => {
		const settings = defineSettings(PLUGIN, schema);

		const saved = await settings.save({ symbol: "$" });
		expect(saved.isOk()).toBe(true);

		const reloaded = await settings.load();
		expect(reloaded.unwrapOr(null)).toEqual({ symbol: "$" });
	});

	test("save rejects invalid input", async () => {
		const result = await defineSettings(PLUGIN, schema).save({ symbol: 1 } as never);

		expect(result.isErr() ? result.error._tag : null).toBe("SettingsValidationError");
	});
});

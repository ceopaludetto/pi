import type { Result as ResultType } from "better-result";

import { homedir } from "node:os";
import { isAbsolute, join, normalize, resolve, sep } from "node:path";

import { Result } from "better-result";

import { InvalidPluginNameError } from "~/configuration";

export const SETTINGS_FILE_NAME = "settings.json";

/**
 * Root of the pi agent configuration, e.g. `~/.pi/agent`.
 *
 * Honours `PI_AGENT_DIR` (full path) and `PI_HOME` (`.pi` parent) overrides,
 * which makes the loader testable and portable across sandboxes.
 */
export function resolveAgentDirectory(): string {
	const explicit = process.env.PI_AGENT_DIR;
	if (explicit)
		return resolve(explicit);

	const home = process.env.PI_HOME ?? homedir();

	return join(home, ".pi", "agent");
}

/** Directory holding every plugin settings folder, e.g. `~/.pi/agent/settings`. */
export function resolveSettingsDirectory(): string {
	return join(resolveAgentDirectory(), "settings");
}

/**
 * Resolves the settings file for a plugin identifier.
 *
 * The identifier doubles as a relative path, so `@ceo.paludetto/pi-prompt`
 * becomes `~/.pi/agent/settings/@ceo.paludetto/pi-prompt/settings.json`.
 */
export function resolveSettingsPath(plugin: string): ResultType<string, InvalidPluginNameError> {
	return Result.gen(function* () {
		const identifier = yield* normalizePluginName(plugin);
		const root = resolveSettingsDirectory();

		return Result.ok(join(root, ...identifier.split("/"), SETTINGS_FILE_NAME));
	});
}

/** Validates that the identifier is a safe relative path segment list. */
export function normalizePluginName(plugin: string): ResultType<string, InvalidPluginNameError> {
	const trimmed = plugin.trim();

	if (!trimmed) {
		return Result.err(new InvalidPluginNameError({ plugin, reason: "it is empty" }));
	}

	if (isAbsolute(trimmed) || trimmed.includes("\0")) {
		return Result.err(new InvalidPluginNameError({ plugin, reason: "it must be a relative identifier" }));
	}

	const segments = normalize(trimmed).split(/[/\\]/).filter(Boolean);

	if (segments.length === 0 || segments.some((segment) => segment === "." || segment === "..")) {
		return Result.err(new InvalidPluginNameError({ plugin, reason: "it must not traverse directories" }));
	}

	if (segments.some((segment) => segment.includes(sep) && sep !== "/")) {
		return Result.err(new InvalidPluginNameError({ plugin, reason: "it contains invalid separators" }));
	}

	return Result.ok(segments.join("/"));
}

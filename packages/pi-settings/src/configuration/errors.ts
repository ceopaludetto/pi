import type { StandardSchemaV1 } from "@standard-schema/spec";

import { TaggedError } from "better-result";

/** The plugin identifier is not a usable relative path segment. */
export class InvalidPluginNameError extends TaggedError("InvalidPluginNameError")<{
	plugin: string;
	message: string;
}> {
	public constructor(args: { plugin: string; reason: string }) {
		super({ plugin: args.plugin, message: `Invalid plugin name "${args.plugin}": ${args.reason}` });
	}
}

/** No `settings.json` exists for the plugin. */
export class SettingsNotFoundError extends TaggedError("SettingsNotFoundError")<{
	plugin: string;
	path: string;
	message: string;
}> {
	public constructor(args: { plugin: string; path: string }) {
		super({ ...args, message: `No settings found for "${args.plugin}" at ${args.path}` });
	}
}

/** The settings file exists but could not be read or written. */
export class SettingsIoError extends TaggedError("SettingsIoError")<{
	plugin: string;
	path: string;
	operation: "read" | "write";
	cause: unknown;
	message: string;
}> {
	public constructor(args: { plugin: string; path: string; operation: "read" | "write"; cause: unknown }) {
		const detail = args.cause instanceof Error ? args.cause.message : String(args.cause);
		super({ ...args, message: `Failed to ${args.operation} settings at ${args.path}: ${detail}` });
	}
}

/** The settings file is not valid JSON. */
export class SettingsParseError extends TaggedError("SettingsParseError")<{
	plugin: string;
	path: string;
	cause: unknown;
	message: string;
}> {
	public constructor(args: { plugin: string; path: string; cause: unknown }) {
		const detail = args.cause instanceof Error ? args.cause.message : String(args.cause);
		super({ ...args, message: `Invalid JSON in settings at ${args.path}: ${detail}` });
	}
}

/** The settings content does not satisfy the provided standard-schema. */
export class SettingsValidationError extends TaggedError("SettingsValidationError")<{
	plugin: string;
	path: string;
	issues: ReadonlyArray<StandardSchemaV1.Issue>;
	message: string;
}> {
	public constructor(args: { plugin: string; path: string; issues: ReadonlyArray<StandardSchemaV1.Issue> }) {
		const detail = args.issues
			.map((issue) => {
				const path = (issue.path ?? [])
					.map((segment) => (typeof segment === "object" ? String(segment.key) : String(segment)))
					.join(".");

				return path ? `${path}: ${issue.message}` : issue.message;
			})
			.join("; ");

		super({ ...args, message: `Invalid settings at ${args.path}: ${detail}` });
	}
}

export type SettingsError
	= | InvalidPluginNameError
		| SettingsIoError
		| SettingsNotFoundError
		| SettingsParseError
		| SettingsValidationError;

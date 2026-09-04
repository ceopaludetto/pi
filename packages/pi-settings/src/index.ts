import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { SettingsError } from "~/configuration";
import type { Result as ResultType } from "better-result";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { Result } from "better-result";

import {
	SettingsIoError,
	SettingsNotFoundError,
	SettingsParseError,
	SettingsValidationError,
} from "~/configuration";
import { resolveSettingsPath } from "~/utilities";

export * from "~/configuration";
export * from "~/utilities";

export type InferSettings<Schema extends StandardSchemaV1> = StandardSchemaV1.InferOutput<Schema>;

export type SettingsOptions<Schema extends StandardSchemaV1> = {
	/**
	 * Raw value validated when the settings file is missing.
	 *
	 * Defaults to `undefined`, which makes {@link Settings.load} fail with
	 * `SettingsNotFoundError`. Pass `{}` to let schema defaults kick in.
	 */
	defaults?: StandardSchemaV1.InferInput<Schema>;
};

export type Settings<Schema extends StandardSchemaV1> = {
	/** Plugin identifier, e.g. `@ceo.paludetto/pi-prompt`. */
	readonly plugin: string;
	/** Absolute path of the backing `settings.json`. */
	readonly path: ResultType<string, SettingsError>;
	/** Reads, parses and validates the settings file. */
	load: () => Promise<ResultType<InferSettings<Schema>, SettingsError>>;
	/** Like {@link Settings.load} but falls back to `fallback` on any failure. */
	loadOr: (fallback: InferSettings<Schema>) => Promise<InferSettings<Schema>>;
	/** Validates and persists settings, creating parent directories as needed. */
	save: (value: StandardSchemaV1.InferInput<Schema>) => Promise<ResultType<InferSettings<Schema>, SettingsError>>;
};

/**
 * Creates a typed settings accessor for a pi plugin.
 *
 * The plugin identifier is used as the path inside the pi configuration folder,
 * so `@ceo.paludetto/pi-prompt` maps to
 * `~/.pi/agent/settings/@ceo.paludetto/pi-prompt/settings.json`.
 *
 * @example
 * const schema = z.object({ symbol: z.string().default("π") });
 * const settings = defineSettings("@ceo.paludetto/pi-prompt", schema, { defaults: {} });
 * const configuration = await settings.loadOr({ symbol: "π" });
 */
export function defineSettings<Schema extends StandardSchemaV1>(
	plugin: string,
	schema: Schema,
	options: SettingsOptions<Schema> = {},
): Settings<Schema> {
	const path = resolveSettingsPath(plugin);

	const load = async (): Promise<ResultType<InferSettings<Schema>, SettingsError>> =>
		Result.gen(async function* () {
			const file = yield* path;
			const content = yield* Result.await(readSettingsFile(plugin, file));

			if (content === null) {
				if (options.defaults === undefined) {
					return Result.err(new SettingsNotFoundError({ plugin, path: file }));
				}

				return Result.ok(yield* Result.await(validate(schema, options.defaults, plugin, file)));
			}

			const raw = yield* parseJson(plugin, file, content);

			return Result.ok(yield* Result.await(validate(schema, raw, plugin, file)));
		});

	const save = async (
		value: StandardSchemaV1.InferInput<Schema>,
	): Promise<ResultType<InferSettings<Schema>, SettingsError>> =>
		Result.gen(async function* () {
			const file = yield* path;
			const validated = yield* Result.await(validate(schema, value, plugin, file));

			yield* Result.await(writeSettingsFile(plugin, file, validated));

			return Result.ok(validated);
		});

	return {
		plugin,
		path,
		load,
		loadOr: async (fallback) => (await load()).unwrapOr(fallback),
		save,
	};
}

/** Convenience one-shot helper around {@link defineSettings}. */
export async function loadSettings<Schema extends StandardSchemaV1>(
	plugin: string,
	schema: Schema,
	options: SettingsOptions<Schema> = {},
): Promise<ResultType<InferSettings<Schema>, SettingsError>> {
	return defineSettings(plugin, schema, options).load();
}

/** Reads the file, mapping a missing file to `null` instead of a failure. */
async function readSettingsFile(
	plugin: string,
	path: string,
): Promise<ResultType<string | null, SettingsIoError>> {
	const read = await Result.tryPromise({
		try: (): Promise<string | null> => readFile(path, "utf8"),
		catch: (cause) => new SettingsIoError({ plugin, path, operation: "read", cause }),
	});

	return read.tryRecover((error) => (isNotFound(error.cause) ? Result.ok(null) : Result.err(error)));
}

async function writeSettingsFile(
	plugin: string,
	path: string,
	value: unknown,
): Promise<ResultType<void, SettingsIoError>> {
	return Result.tryPromise({
		try: async () => {
			await mkdir(dirname(path), { recursive: true });
			await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
		},
		catch: (cause) => new SettingsIoError({ plugin, path, operation: "write", cause }),
	});
}

function parseJson(plugin: string, path: string, content: string): ResultType<unknown, SettingsParseError> {
	return Result.try({
		try: () => JSON.parse(content) as unknown,
		catch: (cause) => new SettingsParseError({ plugin, path, cause }),
	});
}

/** Runs a standard-schema validation, supporting sync and async vendors. */
async function validate<Schema extends StandardSchemaV1>(
	schema: Schema,
	value: unknown,
	plugin: string,
	path: string,
): Promise<ResultType<InferSettings<Schema>, SettingsValidationError>> {
	const result = await schema["~standard"].validate(value);

	if (result.issues) {
		return Result.err(new SettingsValidationError({ plugin, path, issues: result.issues }));
	}

	return Result.ok(result.value as InferSettings<Schema>);
}

function isNotFound(cause: unknown): boolean {
	return typeof cause === "object" && cause !== null && (cause as NodeJS.ErrnoException).code === "ENOENT";
}

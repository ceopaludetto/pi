# @ceo.paludetto/pi-settings

Standardized, type-safe settings for pi plugins and skills.

A plugin identifier doubles as its configuration path, so `@ceo.paludetto/pi-prompt` resolves to:

```
~/.pi/agent/settings/@ceo.paludetto/pi-prompt/settings.json
```

Validation uses any [Standard Schema](https://standardschema.dev) library (zod, valibot, arktype, effect schema, …) and every failure is returned as a typed [`better-result`](https://better-result.dev) `Result` — nothing throws.

## Usage

```ts
import { defineSettings } from "@ceo.paludetto/pi-settings";
import { z } from "zod";

const schema = z.object({
	symbol: z.string().default("π"),
	color: z.string().optional(),
});

const settings = defineSettings("@ceo.paludetto/pi-prompt", schema, { defaults: {} });

// Result<{ symbol: string; color?: string }, SettingsError>
const result = await settings.load();

result.match({
	ok: (config) => console.log(config.symbol),
	err: (error) => console.error(error.message),
});

// Or ignore failures with a fallback
const config = await settings.loadOr({ symbol: "π" });

// Validate and persist (creates parent directories)
await settings.save({ symbol: ">" });
```

One-shot helper:

```ts
import { loadSettings } from "@ceo.paludetto/pi-settings";

const result = await loadSettings("@ceo.paludetto/pi-prompt", schema);
```

## Behaviour

| Situation                    | Result                                            |
| ---------------------------- | ------------------------------------------------- |
| File missing, no `defaults`  | `err(SettingsNotFoundError)`                      |
| File missing, `defaults` set | `defaults` validated through the schema           |
| Invalid JSON                 | `err(SettingsParseError)`                         |
| Schema mismatch              | `err(SettingsValidationError)` with issue details |
| Unreadable / unwritable file | `err(SettingsIoError)`                            |
| Unsafe identifier (`../etc`) | `err(InvalidPluginNameError)`                     |

Errors are `TaggedError`s, so they can be matched exhaustively:

```ts
import { matchError } from "better-result";

matchError(error, {
	SettingsNotFoundError: (e) => `create ${e.path}`,
	SettingsValidationError: (e) => e.issues.map((i) => i.message).join(", "),
	SettingsParseError: (e) => e.message,
	SettingsIoError: (e) => e.message,
	InvalidPluginNameError: (e) => e.message,
});
```

## Paths

| Export                       | Description                                    |
| ---------------------------- | ---------------------------------------------- |
| `resolveAgentDirectory()`    | `~/.pi/agent` (or `$PI_AGENT_DIR`, `$PI_HOME`) |
| `resolveSettingsDirectory()` | `~/.pi/agent/settings`                         |
| `resolveSettingsPath(name)`  | Full `settings.json` path for a plugin         |

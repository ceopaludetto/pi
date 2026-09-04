import { defineSettings } from "@ceo.paludetto/pi-settings";
import { z } from "zod";

export const PLUGIN_NAME = "@ceo.paludetto/pi-prompt";

export const promptSettingsSchema = z.object({
	horizontalPadding: z.number().int().min(0).default(0),
}).prefault({});

export type PromptSettings = z.infer<typeof promptSettingsSchema>;

/**
 * Typed accessor for the pi-prompt settings file.
 *
 * Backed by `~/.pi/agent/settings/@ceo.paludetto/pi-prompt/settings.json` and
 * seeded with schema defaults when the file is missing.
 */
export const promptSettings = defineSettings(PLUGIN_NAME, promptSettingsSchema, { defaults: {} });

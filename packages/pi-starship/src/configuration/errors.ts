import { TaggedError } from "better-result";

/** Rendering the starship prompt through the `starship` CLI failed. */
export class StarshipPromptError extends TaggedError("StarshipPromptError")<{ cause: unknown; message: string }> {
	public constructor(args: { cause: unknown }) {
		const detail = args.cause instanceof Error ? args.cause.message : String(args.cause);
		super({ ...args, message: `Failed to render starship prompt: ${detail}` });
	}
}

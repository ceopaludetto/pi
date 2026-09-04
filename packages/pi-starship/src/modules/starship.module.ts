import type { Result as ResultType } from "better-result";

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { Result } from "better-result";

import { StarshipPromptError } from "~/configuration";
import { Module } from "~/utilities/types";

const execFileAsync = promisify(execFile);

const STARSHIP_ARGUMENTS = [
	"--status=0",
	"--keymap=",
	"--pipestatus=0",
	"--cmd-duration=0",
	"--jobs=0",
];

const ESCAPE_CHARACTER = "\x1B";
const TRAILING_SGR_PATTERN = new RegExp(`${ESCAPE_CHARACTER}\\[[0-9;]*m+$`, "g");

export class StarshipModule extends Module {
	private prompt: string | null = null;

	public override async refresh(): Promise<void> {
		const res = await this.fetchStarshipPrompt();
		this.prompt = res.unwrapOr(null);
	}

	public override render(): string | null {
		return this.prompt;
	}

	private async fetchStarshipPrompt(): Promise<ResultType<string | null, StarshipPromptError>> {
		return Result.tryPromise({
			try: async () => {
				const environment = { ...process.env, PWD: this.context.cwd, STARSHIP_SHELL: "bash" };
				const options = { cwd: this.context.cwd, timeout: 3000, env: environment };

				const { stdout } = await execFileAsync("starship", [
					"prompt",
					`--terminal-width=${this.context.getWidth()}`,
					...STARSHIP_ARGUMENTS,
				], options);

				return this.cleanStarshipOutput(stdout);
			},
			catch: (cause) => new StarshipPromptError({ cause }),
		});
	}

	private cleanStarshipOutput(stdout: string): string | null {
		const firstLine = stdout.split("\n")[0] ?? "";

		const withAnsiEscapes = firstLine
			.replace(/\\\[/g, "")
			.replace(/\\\]/g, "")
			.replace(/%\{/g, ESCAPE_CHARACTER)
			.replace(/%\}/g, "");

		const trimmed = withAnsiEscapes
			.replace(TRAILING_SGR_PATTERN, "")
			.trimEnd();

		return trimmed || null;
	}
}

import { execFile } from "node:child_process";
import { promisify } from "node:util";

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
		this.prompt = await this.fetchStarshipPrompt();
	}

	public override render(): string | null {
		return this.prompt;
	}

	private async fetchStarshipPrompt(): Promise<string | null> {
		try {
			const { stdout } = await execFileAsync(
				"starship",
				["prompt", `--terminal-width=${this.context.getWidth()}`, ...STARSHIP_ARGUMENTS],
				{
					cwd: this.context.cwd,
					timeout: 3000,
					env: { ...process.env, PWD: this.context.cwd, STARSHIP_SHELL: "bash" },
				},
			);

			return this.cleanStarshipOutput(stdout);
		} catch {
			return null;
		}
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

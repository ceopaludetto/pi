import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { PromptSettings } from "~/configuration";

import { stripAnsi } from "@ceo.paludetto/pi-utilities";
import { CustomEditor } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";

import { promptSettings } from "~/configuration";

type CustomEditorArguments = ConstructorParameters<typeof CustomEditor>;

function isBorderLine(line: string): boolean {
	const stripped = stripAnsi(line);

	return /^─+$/.test(stripped) || /^─── [↑↓]/.test(stripped);
}

class PromptEditor extends CustomEditor {
	private readonly padding: string;
	private readonly promptIndent: string;
	private readonly promptPrefix: string;

	public constructor(
		tui: CustomEditorArguments[0],
		theme: CustomEditorArguments[1],
		keybindings: CustomEditorArguments[2],
		settings: PromptSettings,
	) {
		super(tui, theme, keybindings);
		this.padding = " ".repeat(settings.horizontalPadding);
		this.promptPrefix = `${settings.promptPrefix.trimEnd()} `;
		this.promptIndent = " ".repeat(visibleWidth(this.promptPrefix));
	}

	public override render(width: number): string[] {
		const innerWidth = Math.max(
			1,
			width - visibleWidth(this.promptPrefix) - this.padding.length * 2,
		);
		const rendered = super.render(innerWidth);

		if (rendered.length === 0) return rendered;

		const lines = rendered.slice(1);
		const bottomBorderIndex = lines.findIndex(isBorderLine);

		const res: string[] = [];
		let isFirstContentLine = true;

		for (let index = 0; index < lines.length; index++) {
			if (index === bottomBorderIndex) continue;

			const prefix = isFirstContentLine ? this.promptPrefix : this.promptIndent;
			res.push(this.padding + prefix + lines[index] + this.padding);
			isFirstContentLine = false;
		}

		return res;
	}
}

export default function PromptExtension(pi: ExtensionAPI) {
	pi.on("session_start", async (_, context) => {
		if (context.mode !== "tui") return;

		const settings = await promptSettings.load();
		if (settings.isErr()) return;

		context.ui.setEditorComponent(
			(tui, theme, keybindings) => new PromptEditor(tui, theme, keybindings, settings.value),
		);
	});
}

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { PromptSettings } from "~/configuration";

import { stripAnsi } from "@ceo.paludetto/pi-utilities";
import { CustomEditor } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";

import { promptSettings } from "~/configuration";

const PROMPT_PREFIX = "π ";
const PROMPT_PREFIX_WIDTH = visibleWidth(PROMPT_PREFIX);
const PROMPT_INDENT = " ".repeat(PROMPT_PREFIX_WIDTH);

type CustomEditorArguments = ConstructorParameters<typeof CustomEditor>;

function isBorderLine(line: string): boolean {
	const stripped = stripAnsi(line);

	return /^─+$/.test(stripped) || /^─── [↑↓]/.test(stripped);
}

class PromptEditor extends CustomEditor {
	private readonly settings: PromptSettings;
	private readonly padding: string;

	public constructor(
		tui: CustomEditorArguments[0],
		theme: CustomEditorArguments[1],
		keybindings: CustomEditorArguments[2],
		settings: PromptSettings,
	) {
		super(tui, theme, keybindings);
		this.settings = settings;
		this.padding = " ".repeat(settings.horizontalPadding);
	}

	public override render(width: number): string[] {
		const innerWidth = Math.max(1, width - PROMPT_PREFIX_WIDTH - this.settings.horizontalPadding * 2);
		const rendered = super.render(innerWidth);

		if (rendered.length === 0)
			return rendered;

		const lines = rendered.slice(1);
		const bottomBorderIndex = lines.findIndex(isBorderLine);

		const res: string[] = [];
		let isFirstContentLine = true;

		for (let index = 0; index < lines.length; index++) {
			if (index === bottomBorderIndex)
				continue;

			const prefix = isFirstContentLine ? PROMPT_PREFIX : PROMPT_INDENT;
			res.push(this.padding + prefix + lines[index] + this.padding);
			isFirstContentLine = false;
		}

		return res;
	}
}

export default function PromptExtension(pi: ExtensionAPI) {
	pi.on("session_start", async (_, context) => {
		if (context.mode !== "tui")
			return;

		const settings = await promptSettings.load();
		if (settings.isErr())
			return;

		context.ui.setEditorComponent((tui, theme, keybindings) =>
			new PromptEditor(tui, theme, keybindings, settings.value));
	});
}

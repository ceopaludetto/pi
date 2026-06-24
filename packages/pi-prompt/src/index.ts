import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { stripAnsi } from "@ceo.paludetto/pi-utilities";
import { CustomEditor } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";

const PROMPT_PREFIX = "π ";
const PROMPT_PREFIX_WIDTH = visibleWidth(PROMPT_PREFIX);
const PROMPT_INDENT = " ".repeat(PROMPT_PREFIX_WIDTH);
const HORIZONTAL_PADDING = " ";

function isBorderLine(line: string): boolean {
	const stripped = stripAnsi(line);

	return /^─+$/.test(stripped) || /^─── [↑↓]/.test(stripped);
}

class PromptEditor extends CustomEditor {
	public override render(width: number): string[] {
		const innerWidth = Math.max(1, width - PROMPT_PREFIX_WIDTH - 2);
		const rendered = super.render(innerWidth);

		if (rendered.length === 0)
			return rendered;

		const lines = rendered.slice(1);
		const bottomBorderIndex = lines.findIndex(isBorderLine);

		const result: string[] = [];
		let isFirstContentLine = true;

		for (let index = 0; index < lines.length; index++) {
			if (index === bottomBorderIndex)
				continue;

			const prefix = isFirstContentLine ? PROMPT_PREFIX : PROMPT_INDENT;
			result.push(HORIZONTAL_PADDING + prefix + lines[index] + HORIZONTAL_PADDING);
			isFirstContentLine = false;
		}

		return result;
	}
}

export default function PromptExtension(pi: ExtensionAPI) {
	pi.on("session_start", (_, context) => {
		if (context.mode !== "tui")
			return;

		context.ui.setEditorComponent((tui, theme, keybindings) => new PromptEditor(tui, theme, keybindings));
	});
}

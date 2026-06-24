import { bold, capitalizeFirst, cyan, dim, formatProviderName, magenta } from "@ceo.paludetto/pi-utilities";

import { Module } from "~/utilities/types";

export class ModelModule extends Module {
	public override render(): string | null {
		const model = this.context.model;

		if (!model)
			return null;

		const provider = formatProviderName(model.provider);
		const thinkingLevel = this.context.getThinkingLevel();

		const parenthesisContent = thinkingLevel !== "off"
			? `${provider}${dim("/")}${cyan(capitalizeFirst(thinkingLevel))}`
			: provider;

		return `${bold(magenta(model.name))}${dim(" (")}${parenthesisContent}${dim(")")}`;
	}
}

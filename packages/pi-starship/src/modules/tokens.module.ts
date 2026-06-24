import type { AssistantMessage } from "@earendil-works/pi-ai";

import { cyan, dim, formatTokenCount, green, yellow } from "@ceo.paludetto/pi-utilities";

import { Module } from "~/utilities/types";

export class TokensModule extends Module {
	public override render(): string | null {
		const { inputTokens, outputTokens, totalCost } = this.aggregateUsage(this.context.sessionManager.getBranch());

		if (inputTokens === 0 && outputTokens === 0)
			return null;

		return [
			cyan(`↑${formatTokenCount(inputTokens)}`),
			green(`↓${formatTokenCount(outputTokens)}`),
			yellow(`$${totalCost.toFixed(3)}`),
		].join(dim("/"));
	}

	private aggregateUsage(branch: any[]): { inputTokens: number; outputTokens: number; totalCost: number } {
		let inputTokens = 0;
		let outputTokens = 0;
		let totalCost = 0;

		for (const entry of branch) {
			if (entry.type !== "message" || entry.message.role !== "assistant")
				continue;

			const message = entry.message as AssistantMessage;
			inputTokens += message.usage.input;
			outputTokens += message.usage.output;
			totalCost += message.usage.cost.total;
		}

		return { inputTokens, outputTokens, totalCost };
	}
}

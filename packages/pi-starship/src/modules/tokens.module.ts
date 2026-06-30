/* eslint-disable prefer-template */
import type { SessionEntry } from "@earendil-works/pi-coding-agent";

import { cyan, dim, formatTokenCount, green, yellow } from "@ceo.paludetto/pi-utilities";

import { Module } from "~/utilities/types";

export class TokensModule extends Module {
	public override render(): string | null {
		const data = this.aggregateUsage(this.context.sessionManager.getBranch());

		if (data.in === 0 && data.out === 0)
			return null;

		return [
			cyan("↑" + formatTokenCount(data.in)),
			green("↓" + formatTokenCount(data.out)),
			yellow("$" + data.total.toFixed(3)),
		].join(dim("/"));
	}

	private aggregateUsage(branch: SessionEntry[]) {
		return branch.reduce((acc, entry) => {
			if (entry.type !== "message" || entry.message.role !== "assistant")
				return acc;

			acc.in += entry.message.usage.input;
			acc.out += entry.message.usage.output;
			acc.total += entry.message.usage.cost.total;

			return acc;
		}, { in: 0, out: 0, total: 0 });
	}
}

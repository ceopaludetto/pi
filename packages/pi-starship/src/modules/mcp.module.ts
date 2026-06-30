import { cyan, dim } from "@ceo.paludetto/pi-utilities";

import { Module } from "~/utilities/types";

/** Status key published by pi-mcp-adapter (e.g. "MCP: 2/3 servers"). */
const MCP_STATUS_KEY = "mcp";
const SERVER_RATIO_PATTERN = /(\d+)\/(\d+)/;

export class McpModule extends Module {
	public override render(): string | null {
		const status = this.context.getStatuses().get(MCP_STATUS_KEY);

		if (!status)
			return null;

		const match = SERVER_RATIO_PATTERN.exec(status);

		if (!match)
			return null;

		return `${cyan("MCP")} ${dim("(")}${match[1]}/${match[2]}${dim(")")}`;
	}
}

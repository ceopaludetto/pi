import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export type ModuleContext = {
	getStatuses: () => ReadonlyMap<string, string>;
	getThinkingLevel: () => string;
	getWidth: () => number;
} & ExtensionContext;

export abstract class Module {
	public constructor(
		protected readonly context: ModuleContext,
	) {}

	public abstract render(): string | null;
	public async refresh(): Promise<void> {}
}

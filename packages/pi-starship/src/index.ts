import type { Module, ModuleContext } from "./utilities/types";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { dim } from "@ceo.paludetto/pi-utilities";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

import { McpModule } from "./modules/mcp.module";
import { createPhaseTracker, ModeModule } from "./modules/mode.module";
import { ModelModule } from "./modules/model.module";
import { StarshipModule } from "./modules/starship.module";
import { TokensModule } from "./modules/tokens.module";
import { YoloModule } from "./modules/yolo.module";

const MODULE_SEPARATOR = dim(" ⋅ ");
const HORIZONTAL_PADDING = " ";

export default function StarshipExtension(pi: ExtensionAPI) {
	let thinkingLevel = "off";
	let lastRenderWidth = 120;
	let requestRender: (() => void) | undefined;
	let refreshAll: (() => Promise<void>) | undefined;
	let extensionStatuses: ReadonlyMap<string, string> = new Map();

	const phaseTracker = createPhaseTracker(pi, () => requestRender?.());

	pi.on("session_start", async (_, context) => {
		thinkingLevel = pi.getThinkingLevel();

		const moduleContext: ModuleContext = {
			...context,
			getStatuses: () => extensionStatuses,
			getThinkingLevel: () => thinkingLevel,
			getWidth: () => lastRenderWidth,
		};

		const leftModules: Module[] = [
			new StarshipModule(moduleContext),
			new McpModule(moduleContext),
		];

		const rightModules: Module[] = [
			new YoloModule(moduleContext),
			new ModeModule(moduleContext, phaseTracker),
			new ModelModule(moduleContext),
			new TokensModule(moduleContext),
		];

		const allModules = [...leftModules, ...rightModules];

		refreshAll = async () => {
			await Promise.all(allModules.map((item) => item.refresh()));
			requestRender?.();
		};

		await refreshAll();

		context.ui.setFooter((tui, _, data) => {
			requestRender = () => tui.requestRender();
			const unsubscribe = data.onBranchChange(() => refreshAll?.());

			return {
				dispose: unsubscribe,
				invalidate() {},

				render(width: number): string[] {
					extensionStatuses = data.getExtensionStatuses();
					phaseTracker.query();

					if (width !== lastRenderWidth) {
						lastRenderWidth = width;
						for (const item of leftModules)
							item.refresh();
					}

					const contentWidth = width - 2;

					const left = leftModules
						.map((item) => item.render())
						.filter((value): value is string => value !== null)
						.join(MODULE_SEPARATOR);

					const right = rightModules
						.map((item) => item.render())
						.filter((value): value is string => value !== null)
						.join(MODULE_SEPARATOR);

					const gap = " ".repeat(Math.max(1, contentWidth - visibleWidth(left) - visibleWidth(right)));
					return [HORIZONTAL_PADDING + truncateToWidth(left + gap + right, contentWidth) + HORIZONTAL_PADDING];
				},
			};
		});
	});

	pi.on("agent_end", () => {
		refreshAll?.();
	});

	pi.on("thinking_level_select", (event, _) => {
		thinkingLevel = event.level;
		requestRender?.();
	});
}

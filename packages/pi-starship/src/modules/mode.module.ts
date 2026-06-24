import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { ModuleContext } from "~/utilities/types";

import { green, yellow } from "@ceo.paludetto/pi-utilities";

import { Module } from "~/utilities/types";

const REQUEST_CHANNEL = "plannotator:request";

type PlannotatorPhase = "idle" | "planning" | "executing";

export type PhaseTracker = {
	query: () => void;
	getPhase: () => PlannotatorPhase | null;
};

export function createPhaseTracker(pi: ExtensionAPI, onPhaseChange: () => void): PhaseTracker {
	let currentPhase: PlannotatorPhase | null = null;

	function applyPhaseFromResponse(response: any) {
		if (response?.status !== "handled" || !response.result?.phase)
			return;
		if (currentPhase === response.result.phase)
			return;

		currentPhase = response.result.phase;
		onPhaseChange();
	}

	pi.events.on(REQUEST_CHANNEL, (data: any) => {
		if (data?.action !== "plan-mode" || typeof data?.respond !== "function")
			return;

		const originalRespond = data.respond;

		data.respond = (response: any) => {
			originalRespond(response);
			applyPhaseFromResponse(response);
		};
	});

	function query() {
		pi.events.emit(REQUEST_CHANNEL, {
			requestId: Math.random().toString(36).slice(2),
			action: "plan-mode",
			payload: { mode: "status" },
			respond: (response: any) => applyPhaseFromResponse(response),
		});
	}

	return { query, getPhase: () => currentPhase };
}

export class ModeModule extends Module {
	public constructor(context: ModuleContext, private readonly phaseTracker: PhaseTracker) {
		super(context);
	}

	public override render(): string | null {
		const phase = this.phaseTracker.getPhase();

		if (phase === null)
			return null;

		return phase !== "idle" ? yellow("Plan") : green("Build");
	}
}

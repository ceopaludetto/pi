import { bold, rainbow } from "@ceo.paludetto/pi-utilities";

import { Module } from "~/utilities/types";

/** Published by @gotgenes/pi-permission-system via ctx.ui.setStatus(). */
const PERMISSION_SYSTEM_STATUS_KEY = "pi-permission-system";
const PERMISSION_SYSTEM_YOLO_STATUS_VALUE = "yolo";

export class YoloModule extends Module {
	public override render(): string | null {
		if (this.getStatuses().get(PERMISSION_SYSTEM_STATUS_KEY) !== PERMISSION_SYSTEM_YOLO_STATUS_VALUE)
			return null;

		return bold(rainbow("Yolo"));
	}
}

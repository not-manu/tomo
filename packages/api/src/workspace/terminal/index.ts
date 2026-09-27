import { z } from "zod";
import { Sync } from "../../sync";
import { Presence } from "../presence";

export namespace Terminal {
	export const Size = z.object({
		cols: z.number().int().min(2).max(500),
		rows: z.number().int().min(2).max(200),
	});
	export type Size = z.infer<typeof Size>;

	const Ref = z.object({ windowId: z.string() });

	export const Events = {
		attach: Sync.event("terminal.attach", Ref.extend({ size: Size })),
		detach: Sync.event("terminal.detach", Ref),
		input: Sync.event("terminal.input", Ref.extend({ data: z.string().max(65_536) })),
		resize: Sync.event("terminal.resize", Ref.extend({ size: Size })),
		snapshot: Sync.event("terminal.snapshot", Ref.extend({ data: z.string(), size: Size })),
		output: Sync.event("terminal.output", Ref.extend({ data: z.string() })),
		size: Sync.event("terminal.size", Ref.extend({ size: Size })),
		typing: Sync.event("terminal.typing", Ref.extend({ user: Presence.User })),
		exit: Sync.event("terminal.exit", Ref),
	};
}

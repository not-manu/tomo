import { z } from "zod";
import { Sync } from "../sync";

export namespace Sandbox {
	export const Image = "tomo-sandbox";
	export const Mount = "/workspace";
	export const User = "1000:1000";
	export const Timeout = 60;

	export const Entry = z.object({
		name: z.string(),
		path: z.string(),
		type: z.enum(["file", "dir"]),
		size: z.number(),
		modifiedAt: z.coerce.date(),
	});
	export type Entry = z.infer<typeof Entry>;

	export const Result = z.object({
		exitCode: z.number(),
		stdout: z.string(),
		stderr: z.string(),
	});
	export type Result = z.infer<typeof Result>;

	export const Run = z.object({
		cmd: z.string().min(1),
		cwd: z.string().default("/"),
		timeout: z.number().int().positive().max(600).default(Timeout),
	});
	export type Run = z.infer<typeof Run>;

	export const Previews = {
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		webp: "image/webp",
		avif: "image/avif",
		mp4: "video/mp4",
		webm: "video/webm",
		mov: "video/quicktime",
		m4v: "video/mp4",
	} as const;

	export function mime(path: string) {
		const extension = path.split(".").pop()?.toLowerCase() ?? "";
		return Previews[extension as keyof typeof Previews] ?? "application/octet-stream";
	}

	export function preview(path: string) {
		const type = mime(path);
		if (type.startsWith("image/")) return "image";
		if (type.startsWith("video/")) return "video";
		return undefined;
	}

	const Meter = z.object({ used: z.number(), limit: z.number() });

	export const Usage = z.object({
		plan: z.object({ id: z.string(), name: z.string() }),
		running: z.boolean(),
		cpu: Meter,
		memory: Meter,
		storage: Meter,
	});
	export type Usage = z.infer<typeof Usage>;

	export const Events = {
		changed: Sync.event("sandbox.changed", z.object({ workspaceId: z.string(), path: z.string() })),
	};
}

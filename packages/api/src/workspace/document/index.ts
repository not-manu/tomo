import { z } from "zod";
import { Sync } from "../../sync";

export namespace Document {
	export const Field = "content";
	export const MaxBytes = 1024 * 1024;

	const Ref = z.object({ path: z.string().min(1).max(1024) });
	const Update = Ref.extend({ update: z.string().max(4 * MaxBytes) });

	export const Events = {
		open: Sync.event("doc.open", Ref),
		close: Sync.event("doc.close", Ref),
		update: Sync.event("doc.update", Update),
		awareness: Sync.event("doc.awareness", Update),
		state: Sync.event("doc.state", Update),
		error: Sync.event("doc.error", Ref.extend({ message: z.string() })),
	};

	export function encode(bytes: Uint8Array) {
		let binary = "";
		for (let index = 0; index < bytes.length; index += 0x8000) {
			binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
		}
		return btoa(binary);
	}

	export function decode(text: string) {
		return Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
	}
}

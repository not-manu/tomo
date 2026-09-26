import { z } from "zod";

export namespace Sync {
	export type Event<T extends string = string, S extends z.ZodType = z.ZodType> = {
		type: T;
		schema: S;
	};
	export type Data<E extends Event> = z.infer<E["schema"]>;

	export function event<const T extends string, S extends z.ZodType>(type: T, schema: S) {
		return { type, schema } satisfies Event<T, S>;
	}

	export const Message = z.object({ type: z.string(), data: z.unknown() });
	export type Message = z.infer<typeof Message>;

	export function encode<E extends Event>(event: E, data: Data<E>) {
		return JSON.stringify({ type: event.type, data });
	}

	export function parse(raw: unknown): Message | undefined {
		if (typeof raw !== "string") return undefined;
		try {
			return Message.parse(JSON.parse(raw));
		} catch {
			return undefined;
		}
	}

	export function decode<E extends Event>(event: E, message: Message): Data<E> | undefined {
		if (message.type !== event.type) return undefined;
		const result = event.schema.safeParse(message.data);
		return result.success ? (result.data as Data<E>) : undefined;
	}
}

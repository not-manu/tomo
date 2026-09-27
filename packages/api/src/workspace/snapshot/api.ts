import { createReadStream, createWriteStream, rmSync, statSync } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { Env } from "../../api/env";

export namespace SnapshotAPI {
	export const MaxBytes = 2 * 1024 * 1024;

	const Root = resolve(dirname(Env.DATABASE_PATH), "snapshots");

	function file(id: string) {
		return resolve(Root, `${id}.webp`);
	}

	export function at(id: string) {
		try {
			return Math.round(statSync(file(id)).mtimeMs);
		} catch {
			return null;
		}
	}

	export async function save(id: string, body: ReadableStream<Uint8Array>) {
		await mkdir(Root, { recursive: true });
		const temp = `${file(id)}.${process.pid}.tmp`;
		let bytes = 0;
		const limit = new TransformStream<Uint8Array, Uint8Array>({
			transform(chunk, controller) {
				bytes += chunk.byteLength;
				if (bytes > MaxBytes) throw new Error("Snapshot too large");
				controller.enqueue(chunk);
			},
		});
		await pipeline(
			Readable.fromWeb(body.pipeThrough(limit) as NodeReadableStream<Uint8Array>),
			createWriteStream(temp),
		).catch((error) => {
			rmSync(temp, { force: true });
			throw error;
		});
		await rename(temp, file(id));
	}

	export function stream(id: string) {
		return Readable.toWeb(createReadStream(file(id))) as ReadableStream<Uint8Array>;
	}

	export function remove(id: string) {
		rmSync(file(id), { force: true });
	}
}

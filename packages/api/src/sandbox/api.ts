import { execFile } from "node:child_process";
import {
	createReadStream,
	createWriteStream,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
} from "node:fs";
import { mkdir as mkdirAsync, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { promisify } from "node:util";
import type { Docker } from "../api/docker";
import { DockerAPI } from "../api/docker/api";
import { Env } from "../api/env";
import { Plan } from "../plan";
import { Sandbox } from ".";

const exec = promisify(execFile);

export namespace SandboxAPI {
	export const Root = resolve(dirname(Env.DATABASE_PATH), "workspaces");

	export function dir(id: string) {
		return resolve(Root, id);
	}

	function host(id: string, path: string) {
		const root = dir(id);
		const target = resolve(root, `.${sep}${path.replace(/^\/+/, "")}`);
		if (target !== root && !target.startsWith(root + sep))
			throw new Error("Path escapes workspace");
		return target;
	}

	function guest(path: string) {
		const target = posix.resolve(Sandbox.Mount, `./${path.replace(/^\/+/, "")}`);
		if (target !== Sandbox.Mount && !target.startsWith(`${Sandbox.Mount}/`)) {
			throw new Error("Path escapes workspace");
		}
		return target;
	}

	export function create(id: string) {
		mkdirSync(dir(id), { recursive: true });
		void container(id).catch((error) => console.error(`sandbox ${id} warm-up failed`, error));
	}

	export async function remove(id: string) {
		containers.delete(id);
		await DockerAPI.remove(name(id));
		rmSync(dir(id), { recursive: true, force: true });
	}

	export function list(id: string, path = "/"): Sandbox.Entry[] {
		const base = host(id, path);
		return readdirSync(base, { withFileTypes: true }).map((entry) => {
			const full = join(base, entry.name);
			const stats = statSync(full);
			return {
				name: entry.name,
				path: `/${relative(dir(id), full).split(sep).join("/")}`,
				type: entry.isDirectory() ? "dir" : "file",
				size: stats.size,
				modifiedAt: stats.mtime,
			};
		});
	}

	export function read(id: string, path: string): Buffer {
		return readFileSync(host(id, path));
	}

	export function modified(id: string, path: string) {
		return statSync(host(id, path)).mtimeMs;
	}

	export function size(id: string, path: string) {
		return statSync(host(id, path)).size;
	}

	export async function storage(id: string) {
		const { stdout } = await exec("du", ["-sk", dir(id)]);
		return Number.parseInt(stdout, 10) * 1024 || 0;
	}

	export async function usage(id: string): Promise<Sandbox.Usage> {
		const plan = Plan.of({ id });
		const [stats, used] = await Promise.all([DockerAPI.stats(name(id)), storage(id)]);
		return {
			plan: { id: plan.id, name: plan.name },
			running: stats !== undefined,
			cpu: { used: stats?.cpus ?? 0, limit: plan.limits.cpus },
			memory: { used: stats?.memoryBytes ?? 0, limit: plan.limits.memoryBytes },
			storage: { used, limit: plan.limits.storageBytes },
		};
	}

	export async function write(id: string, path: string, data: Uint8Array) {
		if ((await storage(id)) + data.byteLength > Plan.of({ id }).limits.storageBytes) {
			throw new Error("Storage limit reached");
		}
		const target = host(id, path);
		await mkdirAsync(dirname(target), { recursive: true });
		await writeFile(target, data);
	}

	export async function upload(
		id: string,
		path: string,
		body: ReadableStream<Uint8Array>,
		bytes: number,
	) {
		if ((await storage(id)) + bytes > Plan.of({ id }).limits.storageBytes) {
			throw new Error("Storage limit reached");
		}
		const target = host(id, path);
		await mkdirAsync(dirname(target), { recursive: true });
		await pipeline(
			Readable.fromWeb(body as NodeReadableStream<Uint8Array>),
			createWriteStream(target),
		);
	}

	export function stream(id: string, path: string, range?: { start: number; end: number }) {
		return Readable.toWeb(createReadStream(host(id, path), range)) as ReadableStream<Uint8Array>;
	}

	export function mkdir(id: string, path: string) {
		mkdirSync(host(id, path), { recursive: true });
	}

	export function unlink(id: string, path: string) {
		const target = host(id, path);
		if (target === dir(id)) throw new Error("Cannot remove workspace root");
		rmSync(target, { recursive: true, force: true });
	}

	export async function run(id: string, input: Sandbox.Run): Promise<Sandbox.Result> {
		return DockerAPI.exec(await container(id), {
			cmd: ["timeout", String(input.timeout), "sh", "-c", input.cmd],
			cwd: guest(input.cwd),
		});
	}

	export async function shell(id: string, args: { cmd: string[]; size: Docker.Size }) {
		return DockerAPI.shell(await container(id), {
			cmd: args.cmd,
			cwd: Sandbox.Mount,
			env: [
				"TERM=xterm-256color",
				"COLORTERM=truecolor",
				"LANG=C.UTF-8",
				...(Env.OPENAI_API_KEY
					? [`OPENAI_API_KEY=${Env.OPENAI_API_KEY}`, `CODEX_API_KEY=${Env.OPENAI_API_KEY}`]
					: []),
			],
			size: args.size,
		});
	}

	export async function exec(id: string, cmd: string[]) {
		return DockerAPI.exec(await container(id), { cmd });
	}

	function name(id: string) {
		return `tomo-sbx-${id}`;
	}

	const containers = new Map<string, Promise<Docker.Container>>();

	function container(id: string) {
		const cached = containers.get(id);
		if (cached) return cached;
		const pending = attach(id).catch((error) => {
			containers.delete(id);
			throw error;
		});
		containers.set(id, pending);
		return pending;
	}

	async function attach(id: string) {
		const image = await DockerAPI.imageId(Sandbox.Image);
		if (!image) throw new Error(`Image ${Sandbox.Image} not found; run pnpm sandbox:build`);
		const existing = await DockerAPI.container(name(id), image);
		if (existing) return existing;
		mkdirSync(dir(id), { recursive: true });
		const { limits } = Plan.of({ id });
		return DockerAPI.create({
			name: name(id),
			image: Sandbox.Image,
			binds: { [dir(id)]: Sandbox.Mount },
			labels: { "tomo.sandbox": id },
			memoryBytes: limits.memoryBytes,
			cpus: limits.cpus,
			pids: limits.pids,
		});
	}
}

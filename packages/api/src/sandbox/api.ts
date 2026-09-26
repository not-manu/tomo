import {
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import type { Docker } from "../api/docker";
import { DockerAPI } from "../api/docker/api";
import { Env } from "../api/env";
import { Sandbox } from ".";

export namespace SandboxAPI {
	export const Root = resolve(dirname(Env.DATABASE_PATH), "workspaces");

	export function dir(id: string) {
		return resolve(Root, id);
	}

	function host(id: string, path: string) {
		const root = dir(id);
		const target = resolve(root, `.${sep}${path.replace(/^\/+/, "")}`);
		if (target !== root && !target.startsWith(root + sep)) throw new Error("Path escapes workspace");
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

	export function write(id: string, path: string, data: string | Uint8Array) {
		const target = host(id, path);
		mkdirSync(dirname(target), { recursive: true });
		writeFileSync(target, data);
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
		const existing = await DockerAPI.container(name(id));
		if (existing) return existing;
		if (!(await DockerAPI.hasImage(Sandbox.Image))) {
			throw new Error(`Image ${Sandbox.Image} not found; run pnpm sandbox:build`);
		}
		mkdirSync(dir(id), { recursive: true });
		return DockerAPI.create({
			name: name(id),
			image: Sandbox.Image,
			binds: { [dir(id)]: Sandbox.Mount },
			labels: { "tomo.sandbox": id },
			memoryBytes: 1024 * 1024 * 1024,
			cpus: 1,
			pids: 256,
		});
	}
}

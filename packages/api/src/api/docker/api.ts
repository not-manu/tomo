import { PassThrough } from "node:stream";
import Dockerode from "dockerode";
import type { Docker } from ".";

export namespace DockerAPI {
	const client = new Dockerode();

	export async function hasImage(image: string) {
		const found = await client.getImage(image).inspect().catch(ignore(404));
		return found !== undefined;
	}

	export async function container(name: string): Promise<Docker.Container | undefined> {
		const handle = client.getContainer(name);
		const info = await handle.inspect().catch(ignore(404));
		if (!info) return undefined;
		if (!info.State.Running) await handle.start();
		return handle;
	}

	export async function create(opts: Docker.Create): Promise<Docker.Container> {
		const created = await client.createContainer({
			name: opts.name,
			Image: opts.image,
			Labels: opts.labels,
			HostConfig: {
				Binds: Object.entries(opts.binds).map(([host, guest]) => `${host}:${guest}`),
				Memory: opts.memoryBytes,
				NanoCpus: opts.cpus === undefined ? undefined : Math.round(opts.cpus * 1e9),
				PidsLimit: opts.pids,
			},
		});
		await created.start();
		return created;
	}

	export async function stats(name: string): Promise<Docker.Stats | undefined> {
		const handle = client.getContainer(name);
		const info = await handle.inspect().catch(ignore(404));
		if (!info?.State.Running) return undefined;
		const raw = await handle.stats({ stream: false });
		const cpuDelta = raw.cpu_stats.cpu_usage.total_usage - raw.precpu_stats.cpu_usage.total_usage;
		const systemDelta = raw.cpu_stats.system_cpu_usage - (raw.precpu_stats.system_cpu_usage ?? 0);
		const cpus = systemDelta > 0 ? (cpuDelta / systemDelta) * (raw.cpu_stats.online_cpus || 1) : 0;
		const memory = raw.memory_stats as {
			usage?: number;
			stats?: { inactive_file?: number; total_inactive_file?: number };
		};
		const inactive = memory.stats?.inactive_file ?? memory.stats?.total_inactive_file ?? 0;
		return { cpus: Math.max(0, cpus), memoryBytes: Math.max(0, (memory.usage ?? 0) - inactive) };
	}

	export async function remove(name: string) {
		await client.getContainer(name).remove({ force: true }).catch(ignore(404));
	}

	export async function exec(
		container: Docker.Container,
		opts: Docker.Exec,
	): Promise<Docker.Result> {
		const exec = await container.exec({
			Cmd: opts.cmd,
			WorkingDir: opts.cwd,
			AttachStdout: true,
			AttachStderr: true,
		});
		const stream = await exec.start({ hijack: true, stdin: false });
		const stdout = collect();
		const stderr = collect();
		client.modem.demuxStream(stream, stdout.stream, stderr.stream);
		await new Promise<void>((done, fail) => {
			stream.on("end", done);
			stream.on("error", fail);
		});
		const { ExitCode } = await exec.inspect();
		return { exitCode: ExitCode ?? 0, stdout: stdout.text(), stderr: stderr.text() };
	}

	function ignore(statusCode: number) {
		return (error: unknown) => {
			if ((error as { statusCode?: number }).statusCode !== statusCode) throw error;
		};
	}

	function collect() {
		const chunks: Buffer[] = [];
		const stream = new PassThrough();
		stream.on("data", (chunk: Buffer) => chunks.push(chunk));
		return { stream, text: () => Buffer.concat(chunks).toString("utf8") };
	}
}

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

	export async function remove(name: string) {
		await client
			.getContainer(name)
			.remove({ force: true })
			.catch(ignore(404));
	}

	export async function exec(container: Docker.Container, opts: Docker.Exec): Promise<Docker.Result> {
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

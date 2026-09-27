import type Dockerode from "dockerode";

export namespace Docker {
	export type Container = Dockerode.Container;

	export type Create = {
		name: string;
		image: string;
		binds: Record<string, string>;
		labels?: Record<string, string>;
		memoryBytes?: number;
		cpus?: number;
		pids?: number;
	};

	export type Exec = {
		cmd: string[];
		cwd?: string;
	};

	export type Size = { cols: number; rows: number };

	export type Shell = {
		cmd: string[];
		cwd: string;
		env: string[];
		size: Size;
	};

	export type Pty = {
		stream: NodeJS.ReadWriteStream;
		resize: (size: Size) => Promise<unknown>;
	};

	export type Stats = { cpus: number; memoryBytes: number };

	export type Result = {
		exitCode: number;
		stdout: string;
		stderr: string;
	};
}

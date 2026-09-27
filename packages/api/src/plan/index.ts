const GiB = 1024 ** 3;

export namespace Plan {
	export type Limits = {
		cpus: number;
		memoryBytes: number;
		storageBytes: number;
		pids: number;
		desktops: number;
	};
	export type Tier = { id: string; name: string; limits: Limits };

	export const Free = {
		id: "free",
		name: "Free",
		limits: { cpus: 1, memoryBytes: 1 * GiB, storageBytes: 5 * GiB, pids: 256, desktops: 4 },
	} satisfies Tier;

	export function of(_workspace: { id: string }): Tier {
		// TODO: store a plan per workspace and return paid tiers with higher limits
		return Free;
	}
}

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { Core } from "../../core";

function findRoot(from: string): string {
	let dir = from;
	while (!existsSync(join(dir, "pnpm-workspace.yaml"))) {
		const parent = dirname(dir);
		if (parent === dir) return process.cwd();
		dir = parent;
	}
	return dir;
}

const ROOT = findRoot(dirname(fileURLToPath(import.meta.url)));
const ENV_FILE = resolve(ROOT, ".env");

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const schema = z.object({
	ENVIRONMENT: z.enum(["development", "production"]).default("development"),
	PORT: z.coerce.number().int().positive().default(Core.Ports.Api),
	DATABASE_PATH: z
		.string()
		.min(1)
		.transform((file) => resolve(ROOT, file)),
	BETTER_AUTH_SECRET: z.string().min(32),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	OPENAI_API_KEY: z.string().startsWith("sk-").optional(),
});

export type Env = z.infer<typeof schema>;

export const Env: Env = (() => {
	const result = schema.safeParse(process.env);
	if (result.success) return result.data;
	console.error(`invalid environment (see .env.example)\n${z.prettifyError(result.error)}`);
	process.exit(1);
})();

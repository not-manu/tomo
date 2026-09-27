import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sandbox } from "@tomo/api";
import type { DragEvent } from "react";
import { toast } from "sonner";
import { errorMessage, hono } from "~/lib/hono";
import { useSync } from "./use-sync";

export const FileKeys = {
	all: (workspaceId: string) => ["workspace", workspaceId, "files"] as const,
	list: (workspaceId: string, path: string) => ["workspace", workspaceId, "files", path] as const,
};

export function join(dir: string, name: string) {
	return `${dir.replace(/\/+$/, "")}/${name}`;
}

export function parent(path: string) {
	const dir = path.replace(/\/+$/, "").split("/").slice(0, -1).join("/");
	return dir || "/";
}

export function basename(path: string) {
	return path.replace(/\/+$/, "").split("/").pop() || "Home";
}

export function hasFiles(event: DragEvent) {
	return event.dataTransfer.types.includes("Files");
}

export function fileUrl(workspaceId: string, path: string, version?: Date) {
	const url = hono.api.workspace[":id"].files.content.$url({
		param: { id: workspaceId },
		query: { path },
	});
	if (version) url.searchParams.set("v", String(version.getTime()));
	return url.toString();
}

export function useFileSync() {
	const client = useQueryClient();
	useSync(Sandbox.Events.changed, ({ workspaceId }) => {
		client.invalidateQueries({ queryKey: FileKeys.all(workspaceId) });
	});
}

export function useFiles(workspaceId: string, path: string) {
	return useQuery({
		queryKey: FileKeys.list(workspaceId, path),
		queryFn: async () => {
			const response = await hono.api.workspace[":id"].files.$get({
				param: { id: workspaceId },
				query: { path },
			});
			if (response.status === 404) return [];
			if (!response.ok) throw new Error(await errorMessage(response));
			const entries = (await response.json()).map((entry) => Sandbox.Entry.parse(entry));
			return entries
				.filter((entry) => !entry.name.startsWith("."))
				.sort((a, b) =>
					a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1,
				);
		},
	});
}

export function useUpload(workspaceId: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async ({ dir, files }: { dir: string; files: File[] }) => {
			for (const file of files) {
				const url = hono.api.workspace[":id"].files.$url({
					param: { id: workspaceId },
					query: { path: join(dir, file.name) },
				});
				const response = await fetch(url, { method: "PUT", body: file, credentials: "include" });
				if (!response.ok) throw new Error(await errorMessage(response));
			}
		},
		onError: (error) => toast.error(error.message),
		onSettled: () => client.invalidateQueries({ queryKey: FileKeys.all(workspaceId) }),
	});
}

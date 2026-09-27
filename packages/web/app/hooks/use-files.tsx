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

function put(url: string, file: File, onProgress: (loaded: number) => void) {
	return new Promise<void>((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open("PUT", url);
		request.withCredentials = true;
		request.upload.onprogress = (event) => onProgress(event.loaded);
		request.onload = () => {
			if (request.status >= 200 && request.status < 300) return resolve();
			let message = "Upload failed";
			try {
				message = JSON.parse(request.responseText).message ?? message;
			} catch {}
			reject(new Error(message));
		};
		request.onerror = () => reject(new Error("Upload failed"));
		request.send(file);
	});
}

export function useUpload(workspaceId: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async ({ dir, files }: { dir: string; files: File[] }) => {
			const total = files.reduce((sum, file) => sum + file.size, 0);
			const label = files.length === 1 ? (files[0]?.name ?? "file") : `${files.length} files`;
			const toastId = total > 0 ? toast.loading(`Uploading ${label}… 0%`) : undefined;
			let done = 0;
			let shown = 0;
			try {
				for (const file of files) {
					const url = hono.api.workspace[":id"].files
						.$url({ param: { id: workspaceId }, query: { path: join(dir, file.name) } })
						.toString();
					await put(url, file, (loaded) => {
						const percent = Math.floor(((done + loaded) / total) * 100);
						if (toastId === undefined || percent === shown) return;
						shown = percent;
						toast.loading(`Uploading ${label}… ${percent}%`, { id: toastId });
					});
					done += file.size;
					client.invalidateQueries({ queryKey: FileKeys.list(workspaceId, dir) });
				}
				if (toastId !== undefined) toast.success(`Uploaded ${label}`, { id: toastId });
			} catch (error) {
				const message = error instanceof Error ? error.message : "Upload failed";
				if (toastId !== undefined) toast.error(message, { id: toastId });
				else toast.error(message);
				throw error;
			}
		},
		onSettled: () => client.invalidateQueries({ queryKey: FileKeys.all(workspaceId) }),
	});
}

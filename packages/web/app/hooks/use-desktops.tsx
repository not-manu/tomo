import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Desktop } from "@tomo/api";
import { errorMessage, hono } from "~/lib/hono";
import { useSync } from "./use-sync";

export function useDesktopSync() {
	const client = useQueryClient();
	useSync(Desktop.Events.changed, ({ workspaceId }) => {
		client.invalidateQueries({ queryKey: Desktop.QueryKeys.all(workspaceId) });
	});
}

export function useDesktops(workspaceId: string) {
	return useQuery({
		queryKey: Desktop.QueryKeys.all(workspaceId),
		queryFn: async () => {
			const response = await hono.api.workspace[":id"].desktops.$get({
				param: { id: workspaceId },
			});
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useCreateDesktop(workspaceId: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (input: Desktop.Create) => {
			const response = await hono.api.workspace[":id"].desktops.$post({
				param: { id: workspaceId },
				json: input,
			});
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => client.invalidateQueries({ queryKey: Desktop.QueryKeys.all(workspaceId) }),
	});
}

export function useRenameDesktop(workspaceId: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async ({ desktopId, name }: { desktopId: string; name: string }) => {
			const response = await hono.api.workspace[":id"].desktops[":desktopId"].$patch({
				param: { id: workspaceId, desktopId },
				json: { name },
			});
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => client.invalidateQueries({ queryKey: Desktop.QueryKeys.all(workspaceId) }),
	});
}

export function useRemoveDesktop(workspaceId: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (desktopId: string) => {
			const response = await hono.api.workspace[":id"].desktops[":desktopId"].$delete({
				param: { id: workspaceId, desktopId },
			});
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => client.invalidateQueries({ queryKey: Desktop.QueryKeys.all(workspaceId) }),
	});
}

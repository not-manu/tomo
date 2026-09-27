import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Presence, Workspace } from "@tomo/api";
import { errorMessage, hono } from "~/lib/hono";
import { useSync } from "./use-sync";

export function useWorkspaceSync() {
	const client = useQueryClient();
	useSync(Workspace.Events.updated, ({ workspaceId }) => {
		client.invalidateQueries({ queryKey: Workspace.QueryKeys.one(workspaceId), exact: true });
		client.invalidateQueries({ queryKey: Workspace.QueryKeys.all() });
	});
	useSync(Workspace.Events.removed, ({ workspaceId }) => {
		client.resetQueries({ queryKey: Workspace.QueryKeys.one(workspaceId) });
		client.invalidateQueries({ queryKey: Workspace.QueryKeys.all() });
	});
	useSync(Presence.Events.online, ({ workspaceId }) => {
		client.invalidateQueries({ queryKey: Workspace.QueryKeys.one(workspaceId), exact: true });
		client.invalidateQueries({ queryKey: Workspace.QueryKeys.all() });
	});
	useSync(Workspace.Events.members, ({ workspaceId }) => {
		client.invalidateQueries({ queryKey: Workspace.QueryKeys.members(workspaceId) });
		client.invalidateQueries({ queryKey: Workspace.QueryKeys.all() });
	});
}

export function useWorkspaces() {
	return useQuery({
		queryKey: Workspace.QueryKeys.all(),
		queryFn: async () => {
			const response = await hono.api.workspace.$get();
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useWorkspace(id: string, options: { enabled?: boolean } = {}) {
	return useQuery({
		queryKey: Workspace.QueryKeys.one(id),
		retry: false,
		enabled: options.enabled ?? true,
		queryFn: async () => {
			const response = await hono.api.workspace[":id"].$get({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useUsage(id: string) {
	return useQuery({
		queryKey: Workspace.QueryKeys.usage(id),
		refetchInterval: 5_000,
		staleTime: 0,
		queryFn: async () => {
			const response = await hono.api.workspace[":id"].usage.$get({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useMembers(id: string) {
	return useQuery({
		queryKey: Workspace.QueryKeys.members(id),
		queryFn: async () => {
			const response = await hono.api.workspace[":id"].members.$get({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useCreateWorkspace() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (input: Workspace.Create) => {
			const response = await hono.api.workspace.$post({ json: input });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => client.invalidateQueries({ queryKey: Workspace.QueryKeys.all() }),
	});
}

export function useUpdateWorkspace(id: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (input: Workspace.Update) => {
			const response = await hono.api.workspace[":id"].$patch({ param: { id }, json: input });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => {
			client.invalidateQueries({ queryKey: Workspace.QueryKeys.one(id) });
			client.invalidateQueries({ queryKey: Workspace.QueryKeys.all() });
		},
	});
}

export function useDeleteWorkspace(id: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const response = await hono.api.workspace[":id"].$delete({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => {
			client.removeQueries({ queryKey: Workspace.QueryKeys.one(id) });
			client.invalidateQueries({ queryKey: Workspace.QueryKeys.all() });
		},
	});
}

export function useLeaveWorkspace(id: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const response = await hono.api.workspace[":id"].leave.$post({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => {
			client.removeQueries({ queryKey: Workspace.QueryKeys.one(id) });
			client.invalidateQueries({ queryKey: Workspace.QueryKeys.all() });
		},
	});
}

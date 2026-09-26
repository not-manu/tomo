import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Workspace } from "@tomo/api";
import { errorMessage, hono } from "~/lib/hono";

export const workspaceKeys = {
	all: ["workspaces"] as const,
	one: (id: string) => ["workspace", id] as const,
	members: (id: string) => ["workspace", id, "members"] as const,
};

export function useWorkspaces() {
	return useQuery({
		queryKey: workspaceKeys.all,
		queryFn: async () => {
			const response = await hono.api.workspace.$get();
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useWorkspace(id: string) {
	return useQuery({
		queryKey: workspaceKeys.one(id),
		retry: false,
		queryFn: async () => {
			const response = await hono.api.workspace[":id"].$get({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useMembers(id: string) {
	return useQuery({
		queryKey: workspaceKeys.members(id),
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
		onSuccess: () => client.invalidateQueries({ queryKey: workspaceKeys.all }),
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
			client.invalidateQueries({ queryKey: workspaceKeys.one(id) });
			client.invalidateQueries({ queryKey: workspaceKeys.all });
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
			client.removeQueries({ queryKey: workspaceKeys.one(id) });
			client.invalidateQueries({ queryKey: workspaceKeys.all });
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
			client.removeQueries({ queryKey: workspaceKeys.one(id) });
			client.invalidateQueries({ queryKey: workspaceKeys.all });
		},
	});
}

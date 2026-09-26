import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Workspace } from "@tomo/api";
import { errorMessage, hono } from "~/lib/hono";

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

export function useWorkspace(id: string) {
	return useQuery({
		queryKey: Workspace.QueryKeys.one(id),
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

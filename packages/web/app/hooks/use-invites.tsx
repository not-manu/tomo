import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Invite } from "@tomo/api";
import { workspaceKeys } from "~/hooks/use-workspace";
import { errorMessage, hono } from "~/lib/hono";

export const inviteKeys = {
	inbox: ["invites"] as const,
	workspace: (id: string) => ["workspace", id, "invites"] as const,
};

export function useInbox() {
	return useQuery({
		queryKey: inviteKeys.inbox,
		queryFn: async () => {
			const response = await hono.api.invites.$get();
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useAcceptInvite() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await hono.api.invites[":id"].accept.$post({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => {
			client.invalidateQueries({ queryKey: inviteKeys.inbox });
			client.invalidateQueries({ queryKey: workspaceKeys.all });
		},
	});
}

export function useDeclineInvite() {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await hono.api.invites[":id"].decline.$post({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => client.invalidateQueries({ queryKey: inviteKeys.inbox }),
	});
}

export function useWorkspaceInvites(id: string) {
	return useQuery({
		queryKey: inviteKeys.workspace(id),
		queryFn: async () => {
			const response = await hono.api.workspace[":id"].invites.$get({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useCreateInvite(id: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (input: Invite.Create) => {
			const response = await hono.api.workspace[":id"].invites.$post({ param: { id }, json: input });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => client.invalidateQueries({ queryKey: inviteKeys.workspace(id) }),
	});
}

export function useRevokeInvite(id: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (inviteId: string) => {
			const response = await hono.api.workspace[":id"].invites[":inviteId"].$delete({
				param: { id, inviteId },
			});
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => client.invalidateQueries({ queryKey: inviteKeys.workspace(id) }),
	});
}

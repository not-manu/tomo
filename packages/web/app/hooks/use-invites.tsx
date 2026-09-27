import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Invite, Workspace } from "@tomo/api";
import { errorMessage, hono } from "~/lib/hono";
import { useSync } from "./use-sync";

export function useInviteSync() {
	const client = useQueryClient();
	useSync(Invite.Events.inbox, () => {
		client.invalidateQueries({ queryKey: Invite.QueryKeys.inbox() });
	});
	useSync(Invite.Events.workspace, ({ workspaceId }) => {
		client.invalidateQueries({ queryKey: Invite.QueryKeys.workspace(workspaceId) });
	});
}

export function useInbox() {
	return useQuery({
		queryKey: Invite.QueryKeys.inbox(),
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
			client.invalidateQueries({ queryKey: Invite.QueryKeys.inbox() });
			client.invalidateQueries({ queryKey: Workspace.QueryKeys.all() });
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
		onSuccess: () => client.invalidateQueries({ queryKey: Invite.QueryKeys.inbox() }),
	});
}

export function useWorkspaceInvites(id: string) {
	return useQuery({
		queryKey: Invite.QueryKeys.workspace(id),
		queryFn: async () => {
			const response = await hono.api.workspace[":id"].invites.$get({ param: { id } });
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function usePeople() {
	return useQuery({
		queryKey: Invite.QueryKeys.people(),
		queryFn: async () => {
			const response = await hono.api.invites.people.$get();
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
	});
}

export function useCreateInvite(id: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (input: Invite.Create) => {
			const response = await hono.api.workspace[":id"].invites.$post({
				param: { id },
				json: input,
			});
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onSuccess: () => {
			client.invalidateQueries({ queryKey: Invite.QueryKeys.workspace(id) });
			client.invalidateQueries({ queryKey: Invite.QueryKeys.people() });
		},
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
		onSuccess: () => client.invalidateQueries({ queryKey: Invite.QueryKeys.workspace(id) }),
	});
}

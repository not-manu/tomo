import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DesktopWindow } from "@tomo/api";
import { toast } from "sonner";
import { errorMessage, hono } from "~/lib/hono";
import { useSync } from "./use-sync";

type Window = DesktopWindow.Select;

export function useWindowSync() {
	const client = useQueryClient();
	useSync(DesktopWindow.Events.changed, ({ workspaceId }) => {
		client.invalidateQueries({ queryKey: DesktopWindow.QueryKeys.all(workspaceId) });
	});
}

export function useWindows(workspaceId: string) {
	return useQuery({
		queryKey: DesktopWindow.QueryKeys.all(workspaceId),
		queryFn: async () => {
			const response = await hono.api.workspace[":id"].windows.$get({
				param: { id: workspaceId },
			});
			if (!response.ok) throw new Error(await errorMessage(response));
			return (await response.json()).map((window) => DesktopWindow.Select.parse(window));
		},
	});
}

function useOptimistic<T>(
	workspaceId: string,
	apply: (windows: Window[], input: T) => Window[],
	request: (input: T) => Promise<Response>,
) {
	const client = useQueryClient();
	const queryKey = DesktopWindow.QueryKeys.all(workspaceId);
	return useMutation({
		mutationFn: async (input: T) => {
			const response = await request(input);
			if (!response.ok) throw new Error(await errorMessage(response));
		},
		onMutate: async (input) => {
			await client.cancelQueries({ queryKey });
			const previous = client.getQueryData<Window[]>(queryKey);
			if (previous) client.setQueryData(queryKey, apply(previous, input));
			return { previous };
		},
		onError: (error, _, context) => {
			if (context?.previous) client.setQueryData(queryKey, context.previous);
			toast.error(error.message);
		},
		onSettled: () => client.invalidateQueries({ queryKey }),
	});
}

export function useCreateWindow(workspaceId: string) {
	const client = useQueryClient();
	return useMutation({
		mutationFn: async (input: DesktopWindow.Create) => {
			const response = await hono.api.workspace[":id"].windows.$post({
				param: { id: workspaceId },
				json: input,
			});
			if (!response.ok) throw new Error(await errorMessage(response));
			return response.json();
		},
		onError: (error) => toast.error(error.message),
		onSettled: () =>
			client.invalidateQueries({ queryKey: DesktopWindow.QueryKeys.all(workspaceId) }),
	});
}

type Update = { windowId: string } & DesktopWindow.Update;

export function useUpdateWindow(workspaceId: string) {
	return useOptimistic<Update>(
		workspaceId,
		(windows, { windowId, frame, maximized, focus, path }) => {
			const target = windows.find((window) => window.id === windowId);
			const top = Math.max(
				0,
				...windows
					.filter((window) => window.desktopId === target?.desktopId)
					.map((window) => window.z),
			);
			return windows.map((window) =>
				window.id === windowId
					? {
							...window,
							...frame,
							maximized: maximized ?? window.maximized,
							path: path ?? window.path,
							z: focus ? top + 1 : window.z,
						}
					: window,
			);
		},
		({ windowId, ...json }) =>
			hono.api.workspace[":id"].windows[":windowId"].$patch({
				param: { id: workspaceId, windowId },
				json,
			}),
	);
}

export function useRemoveWindow(workspaceId: string) {
	return useOptimistic<string>(
		workspaceId,
		(windows, windowId) => windows.filter((window) => window.id !== windowId),
		(windowId) =>
			hono.api.workspace[":id"].windows[":windowId"].$delete({
				param: { id: workspaceId, windowId },
			}),
	);
}

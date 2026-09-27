import { domToBlob } from "modern-screenshot";
import { useCallback, useEffect, useRef } from "react";
import { hono } from "~/lib/hono";

const Width = 1280;
const Interval = 15_000;
const Skip = new Set(["IFRAME", "VIDEO"]);

export function snapshotUrl(workspaceId: string, version: number) {
	const url = hono.api.workspace[":id"].snapshot.$url({ param: { id: workspaceId } });
	url.searchParams.set("v", String(version));
	return url.toString();
}

async function digest(blob: Blob) {
	const hash = await crypto.subtle.digest("SHA-1", await blob.arrayBuffer());
	return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function useSnapshot(workspaceId: string) {
	const last = useRef<string>(undefined);
	const pending = useRef<Promise<void>>(undefined);

	const capture = useCallback(() => {
		pending.current ??= (async () => {
			const node = document.querySelector<HTMLElement>("[data-surface]");
			if (!node?.clientWidth) return;
			const blob = await Promise.race([
				domToBlob(node, {
					type: "image/webp",
					quality: 0.8,
					scale: Width / node.clientWidth,
					timeout: 3_000,
					filter: (el) =>
						!(el instanceof HTMLElement) ||
						(!Skip.has(el.tagName) && !("snapshotIgnore" in el.dataset)),
				}),
				new Promise<never>((_, fail) => setTimeout(() => fail(new Error("timeout")), 15_000)),
			]);
			const hash = await digest(blob);
			if (hash === last.current) return;
			const url = hono.api.workspace[":id"].snapshot.$url({ param: { id: workspaceId } });
			const response = await fetch(url, { method: "PUT", body: blob, credentials: "include" });
			if (response.ok) last.current = hash;
		})()
			.catch(() => undefined)
			.finally(() => {
				pending.current = undefined;
			});
		return pending.current;
	}, [workspaceId]);

	useEffect(() => {
		const first = setTimeout(capture, 2_000);
		const timer = setInterval(() => {
			if (document.visibilityState === "visible") void capture();
		}, Interval);
		const hide = () => {
			if (document.visibilityState === "hidden") void capture();
		};
		document.addEventListener("visibilitychange", hide);
		return () => {
			clearTimeout(first);
			clearInterval(timer);
			document.removeEventListener("visibilitychange", hide);
		};
	}, [capture]);

	return capture;
}

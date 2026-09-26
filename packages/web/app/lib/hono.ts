import { Api } from "@tomo/api";
import { hc, type InferResponseType } from "hono/client";

export const baseURL =
	typeof window === "undefined" ? Api.URLs.Domains.Production : window.location.origin;

export const hono = hc<Api.App>(baseURL, {
	init: { credentials: "include" },
});

// biome-ignore lint/suspicious/noExplicitAny: relax InferResponseType's Response constraint for hc clients
export type InferHono<T extends (...args: any) => any> = InferResponseType<T>;

export async function errorMessage(response: { json(): Promise<unknown> }): Promise<string> {
	const body: unknown = await response.json().catch(() => null);
	if (body && typeof body === "object") {
		if ("error" in body && typeof body.error === "string") return body.error;
		if ("message" in body && typeof body.message === "string") return body.message;
	}
	return "Something went wrong. Please try again.";
}

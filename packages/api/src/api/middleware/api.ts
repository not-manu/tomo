import { isAuthenticated as isAuthenticatedMiddleware } from "./is-authenticated";
import { isMember as isMemberMiddleware, isOwner as isOwnerMiddleware } from "./is-member";

export namespace MiddlewareAPI {
	export const isAuthenticated = isAuthenticatedMiddleware;
	export const isMember = isMemberMiddleware;
	export const isOwner = isOwnerMiddleware;
}

import type { Auth } from "../../auth";
import type { Workspace } from "../../workspace";
import type { Member } from "../../workspace/member";

export namespace Middleware {
	export type IsAuthenticated = { Variables: { identity: Auth.Identity } };
	export type IsMember = {
		Variables: IsAuthenticated["Variables"] & { workspace: Workspace.Select; member: Member.Select };
	};
}

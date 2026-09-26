import { DbAPI } from "../api/db/api";
import type { SocketAPI } from "../api/socket/api";
import type { Workspace } from "../workspace";
import { WorkspaceAPI } from "../workspace/api";
import { Invite } from "../workspace/invite";
import { Sync } from ".";

export namespace SyncAPI {
	export type Connection = { user: { id: string; email: string }; ws: SocketAPI.Context };

	export type Target =
		| { users: string[] }
		| { emails: string[] }
		| { workspace: Pick<Workspace.Select, "id"> };

	const connections = new Set<Connection>();

	export function connect(connection: Connection) {
		connections.add(connection);
	}

	export function disconnect(connection: Connection) {
		connections.delete(connection);
	}

	export function push<E extends Sync.Event>(to: Target, event: E, data: Sync.Data<E>) {
		const matches = matcher(to);
		const message = Sync.encode(event, data);
		for (const connection of connections) {
			if (matches(connection.user)) connection.ws.send(message);
		}
	}

	function matcher(to: Target): (user: Connection["user"]) => boolean {
		if ("users" in to) {
			const ids = new Set(to.users);
			return (user) => ids.has(user.id);
		}
		if ("emails" in to) {
			const emails = new Set(to.emails.map(Invite.normalizeEmail));
			return (user) => emails.has(Invite.normalizeEmail(user.email));
		}
		const members = WorkspaceAPI.members(DbAPI.instance(), to.workspace);
		return matcher({ users: members.map((member) => member.userId) });
	}
}

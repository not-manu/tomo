import { and, asc, count, eq, max } from "drizzle-orm";
import { Db } from "../../api/db";
import type { User } from "../../auth/user";
import { Plan } from "../../plan";
import type { Workspace } from "..";
import { Desktop } from ".";

export namespace DesktopAPI {
	type WorkspaceRef = Pick<Workspace.Select, "id">;
	type UserRef = Pick<User.Select, "id">;
	type Ref = Pick<Desktop.Select, "id">;

	export function list(db: Db.Client, workspace: WorkspaceRef) {
		return db
			.select()
			.from(Desktop.Table)
			.where(eq(Desktop.Table.workspaceId, workspace.id))
			.orderBy(asc(Desktop.Table.position), asc(Desktop.Table.createdAt))
			.all();
	}

	export function get(db: Db.Client, args: { workspace: WorkspaceRef; desktop: Ref }) {
		return db
			.select()
			.from(Desktop.Table)
			.where(
				and(
					eq(Desktop.Table.id, args.desktop.id),
					eq(Desktop.Table.workspaceId, args.workspace.id),
				),
			)
			.get();
	}

	export function initial(db: Db.Client, args: { workspace: WorkspaceRef; user: UserRef }) {
		return db
			.insert(Desktop.Table)
			.values({
				workspaceId: args.workspace.id,
				name: Desktop.defaultName(0),
				position: 0,
				createdBy: args.user.id,
			})
			.returning()
			.get();
	}

	export function create(
		db: Db.Type,
		args: { workspace: WorkspaceRef; user: UserRef; input: Desktop.Create },
	) {
		return Db.transaction(db, (tx) => {
			const stats = tx
				.select({ total: count(), last: max(Desktop.Table.position) })
				.from(Desktop.Table)
				.where(eq(Desktop.Table.workspaceId, args.workspace.id))
				.get();
			const total = stats?.total ?? 0;
			if (total >= Plan.of(args.workspace).limits.desktops) {
				throw new Error("Desktop limit reached");
			}
			return tx
				.insert(Desktop.Table)
				.values({
					workspaceId: args.workspace.id,
					name: args.input.name ?? Desktop.defaultName(total),
					position: (stats?.last ?? -1) + 1,
					createdBy: args.user.id,
				})
				.returning()
				.get();
		});
	}

	export function rename(db: Db.Client, args: { desktop: Ref; input: Desktop.Update }) {
		return db
			.update(Desktop.Table)
			.set({ name: args.input.name })
			.where(eq(Desktop.Table.id, args.desktop.id))
			.returning()
			.get();
	}

	export function reorder(db: Db.Type, args: { workspace: WorkspaceRef; input: Desktop.Order }) {
		return Db.transaction(db, (tx) => {
			const current = list(tx, args.workspace).map((desktop) => desktop.id);
			const next = new Set(args.input.ids);
			if (next.size !== current.length || current.some((id) => !next.has(id))) {
				throw new Error("Order must include every desktop exactly once");
			}
			args.input.ids.forEach((id, position) => {
				tx.update(Desktop.Table).set({ position }).where(eq(Desktop.Table.id, id)).run();
			});
			return list(tx, args.workspace);
		});
	}

	export function remove(db: Db.Type, args: { workspace: WorkspaceRef; desktop: Ref }) {
		return Db.transaction(db, (tx) => {
			if (list(tx, args.workspace).length <= 1) {
				throw new Error("Cannot remove the last desktop");
			}
			tx.delete(Desktop.Table).where(eq(Desktop.Table.id, args.desktop.id)).run();
		});
	}
}

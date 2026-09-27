import { and, asc, count, eq, max } from "drizzle-orm";
import { Db } from "../../api/db";
import type { User } from "../../auth/user";
import type { Workspace } from "..";
import type { Desktop } from "../desktop";
import { DesktopWindow } from ".";

export namespace WindowAPI {
	type WorkspaceRef = Pick<Workspace.Select, "id">;
	type DesktopRef = Pick<Desktop.Select, "id">;
	type UserRef = Pick<User.Select, "id">;
	type Ref = Pick<DesktopWindow.Select, "id">;

	const Table = DesktopWindow.Table;

	export function list(db: Db.Client, workspace: WorkspaceRef) {
		return db
			.select()
			.from(Table)
			.where(eq(Table.workspaceId, workspace.id))
			.orderBy(asc(Table.z), asc(Table.createdAt))
			.all();
	}

	export function onDesktop(db: Db.Client, desktop: DesktopRef) {
		return db.select().from(Table).where(eq(Table.desktopId, desktop.id)).all();
	}

	export function get(db: Db.Client, args: { workspace: WorkspaceRef; window: Ref }) {
		return db
			.select()
			.from(Table)
			.where(and(eq(Table.id, args.window.id), eq(Table.workspaceId, args.workspace.id)))
			.get();
	}

	function top(db: Db.Client, desktop: DesktopRef) {
		const stats = db
			.select({ total: count(), z: max(Table.z) })
			.from(Table)
			.where(eq(Table.desktopId, desktop.id))
			.get();
		return { total: stats?.total ?? 0, z: (stats?.z ?? 0) + 1 };
	}

	export function create(
		db: Db.Type,
		args: {
			workspace: WorkspaceRef;
			desktop: DesktopRef;
			user: UserRef;
			app: DesktopWindow.App;
			path?: string | undefined;
		},
	) {
		return Db.transaction(db, (tx) => {
			const { total, z } = top(tx, args.desktop);
			if (total >= DesktopWindow.Max) throw new Error("Window limit reached");
			const offset = (total % 6) * 0.03;
			return tx
				.insert(Table)
				.values({
					workspaceId: args.workspace.id,
					desktopId: args.desktop.id,
					app: args.app,
					path: args.path ?? null,
					x: 0.08 + offset,
					y: 0.08 + offset,
					w: 0.5,
					h: 0.55,
					z,
					createdBy: args.user.id,
				})
				.returning()
				.get();
		});
	}

	export function update(
		db: Db.Type,
		args: { window: DesktopWindow.Select; input: DesktopWindow.Update },
	) {
		return Db.transaction(db, (tx) => {
			const { frame, maximized, focus, path } = args.input;
			const z = focus ? top(tx, { id: args.window.desktopId }).z : undefined;
			if (!frame && maximized === undefined && z === undefined && path === undefined) {
				return args.window;
			}
			return tx
				.update(Table)
				.set({ ...frame, maximized, z, path })
				.where(eq(Table.id, args.window.id))
				.returning()
				.get();
		});
	}

	export function remove(db: Db.Client, window: Ref) {
		db.delete(Table).where(eq(Table.id, window.id)).run();
	}

	export function forget(db: Db.Client, args: { workspace: WorkspaceRef; path: string }) {
		const parent = args.path.split("/").slice(0, -1).join("/") || "/";
		const inside = (path: string | null) =>
			path !== null && (path === args.path || path.startsWith(`${args.path}/`));
		const affected = list(db, args.workspace).filter((window) => inside(window.path));
		for (const window of affected) {
			if (window.app === "finder") {
				db.update(Table).set({ path: parent }).where(eq(Table.id, window.id)).run();
			} else remove(db, window);
		}
		return affected.length > 0;
	}
}

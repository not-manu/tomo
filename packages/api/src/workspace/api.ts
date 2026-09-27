import { and, desc, eq } from "drizzle-orm";
import { Db } from "../api/db";
import { User } from "../auth/user";
import { SandboxAPI } from "../sandbox/api";
import { Workspace } from ".";
import { DesktopAPI } from "./desktop/api";
import { Member } from "./member";
import { SnapshotAPI } from "./snapshot/api";

export namespace WorkspaceAPI {
	type Ref = Pick<Workspace.Select, "id">;
	type UserRef = Pick<User.Select, "id">;

	export function create(db: Db.Type, args: { owner: UserRef; input: Workspace.Create }) {
		return Db.transaction(db, (tx) => {
			const workspace = tx
				.insert(Workspace.Table)
				.values({
					name: args.input.name,
					ownerId: args.owner.id,
					wallpaper: Workspace.DefaultWallpaper,
				})
				.returning()
				.get();
			tx.insert(Member.Table)
				.values({ workspaceId: workspace.id, userId: args.owner.id, role: "owner" })
				.run();
			DesktopAPI.initial(tx, { workspace, user: args.owner });
			SandboxAPI.create(workspace.id);
			return workspace;
		});
	}

	export function get(db: Db.Client, workspace: Ref) {
		return db.select().from(Workspace.Table).where(eq(Workspace.Table.id, workspace.id)).get();
	}

	export function list(db: Db.Client, args: { user: UserRef }) {
		return db
			.select({
				id: Workspace.Table.id,
				name: Workspace.Table.name,
				wallpaper: Workspace.Table.wallpaper,
				ownerId: Workspace.Table.ownerId,
				createdAt: Workspace.Table.createdAt,
				updatedAt: Workspace.Table.updatedAt,
				role: Member.Table.role,
			})
			.from(Member.Table)
			.innerJoin(Workspace.Table, eq(Member.Table.workspaceId, Workspace.Table.id))
			.where(eq(Member.Table.userId, args.user.id))
			.orderBy(desc(Workspace.Table.createdAt))
			.all();
	}

	export function member(db: Db.Client, args: { workspace: Ref; user: UserRef }) {
		return db
			.select()
			.from(Member.Table)
			.where(
				and(eq(Member.Table.workspaceId, args.workspace.id), eq(Member.Table.userId, args.user.id)),
			)
			.get();
	}

	export function members(db: Db.Client, workspace: Ref) {
		return db
			.select({
				userId: Member.Table.userId,
				role: Member.Table.role,
				joinedAt: Member.Table.joinedAt,
				name: User.Table.name,
				email: User.Table.email,
				image: User.Table.image,
			})
			.from(Member.Table)
			.innerJoin(User.Table, eq(Member.Table.userId, User.Table.id))
			.where(eq(Member.Table.workspaceId, workspace.id))
			.orderBy(Member.Table.joinedAt)
			.all();
	}

	export function leave(db: Db.Client, args: { workspace: Ref; user: UserRef }) {
		db.delete(Member.Table)
			.where(
				and(eq(Member.Table.workspaceId, args.workspace.id), eq(Member.Table.userId, args.user.id)),
			)
			.run();
	}

	export function update(db: Db.Client, args: { workspace: Ref; input: Workspace.Update }) {
		return db
			.update(Workspace.Table)
			.set(args.input)
			.where(eq(Workspace.Table.id, args.workspace.id))
			.returning()
			.get();
	}

	export async function remove(db: Db.Client, workspace: Ref) {
		db.delete(Workspace.Table).where(eq(Workspace.Table.id, workspace.id)).run();
		await SandboxAPI.remove(workspace.id);
		SnapshotAPI.remove(workspace.id);
	}
}

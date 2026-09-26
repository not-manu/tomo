import { and, desc, eq } from "drizzle-orm";
import { Db } from "../../api/db";
import { User } from "../../auth/user";
import { Workspace } from "..";
import { Member } from "../member";
import { Invite } from ".";

export namespace InviteAPI {
	type Ref = Pick<Invite.Select, "id">;
	type WorkspaceRef = Pick<Workspace.Select, "id">;
	type UserRef = Pick<User.Select, "id" | "email">;

	export function create(
		db: Db.Client,
		args: { workspace: WorkspaceRef; invitedBy: Pick<User.Select, "id">; input: Invite.Create },
	) {
		const email = Invite.normalizeEmail(args.input.email);
		if (isMember(db, { workspace: args.workspace, email })) throw new Error("Already a member");
		return db
			.insert(Invite.Table)
			.values({
				workspaceId: args.workspace.id,
				email,
				role: args.input.role,
				invitedBy: args.invitedBy.id,
			})
			.onConflictDoUpdate({
				target: [Invite.Table.workspaceId, Invite.Table.email],
				set: {
					role: args.input.role,
					status: "pending",
					invitedBy: args.invitedBy.id,
					updatedAt: Db.Now(),
				},
			})
			.returning()
			.get();
	}

	export function get(db: Db.Client, invite: Ref) {
		return db.select().from(Invite.Table).where(eq(Invite.Table.id, invite.id)).get();
	}

	export function inbox(db: Db.Client, args: { user: UserRef }) {
		return db
			.select({
				id: Invite.Table.id,
				workspaceId: Invite.Table.workspaceId,
				workspaceName: Workspace.Table.name,
				role: Invite.Table.role,
				invitedBy: User.Table.name,
				createdAt: Invite.Table.createdAt,
			})
			.from(Invite.Table)
			.innerJoin(Workspace.Table, eq(Invite.Table.workspaceId, Workspace.Table.id))
			.innerJoin(User.Table, eq(Invite.Table.invitedBy, User.Table.id))
			.where(
				and(
					eq(Invite.Table.email, Invite.normalizeEmail(args.user.email)),
					eq(Invite.Table.status, "pending"),
				),
			)
			.orderBy(desc(Invite.Table.createdAt))
			.all();
	}

	export function list(db: Db.Client, workspace: WorkspaceRef) {
		return db
			.select()
			.from(Invite.Table)
			.where(and(eq(Invite.Table.workspaceId, workspace.id), eq(Invite.Table.status, "pending")))
			.orderBy(desc(Invite.Table.createdAt))
			.all();
	}

	export function accept(db: Db.Type, args: { invite: Ref; user: UserRef }) {
		return Db.transaction(db, (tx) => {
			const invite = pendingFor(tx, args);
			if (!invite) return undefined;
			tx.insert(Member.Table)
				.values({ workspaceId: invite.workspaceId, userId: args.user.id, role: invite.role })
				.onConflictDoNothing()
				.run();
			tx.update(Invite.Table)
				.set({ status: "accepted" })
				.where(eq(Invite.Table.id, invite.id))
				.run();
			return tx
				.select()
				.from(Workspace.Table)
				.where(eq(Workspace.Table.id, invite.workspaceId))
				.get();
		});
	}

	export function decline(db: Db.Client, args: { invite: Ref; user: UserRef }) {
		const invite = pendingFor(db, args);
		if (!invite) return undefined;
		db.update(Invite.Table).set({ status: "declined" }).where(eq(Invite.Table.id, invite.id)).run();
		return invite;
	}

	export function revoke(db: Db.Client, invite: Ref) {
		db.delete(Invite.Table).where(eq(Invite.Table.id, invite.id)).run();
	}

	function pendingFor(db: Db.Client, args: { invite: Ref; user: UserRef }) {
		return db
			.select()
			.from(Invite.Table)
			.where(
				and(
					eq(Invite.Table.id, args.invite.id),
					eq(Invite.Table.email, Invite.normalizeEmail(args.user.email)),
					eq(Invite.Table.status, "pending"),
				),
			)
			.get();
	}

	function isMember(db: Db.Client, args: { workspace: WorkspaceRef; email: string }) {
		return (
			db
				.select({ userId: Member.Table.userId })
				.from(Member.Table)
				.innerJoin(User.Table, eq(Member.Table.userId, User.Table.id))
				.where(
					and(eq(Member.Table.workspaceId, args.workspace.id), eq(User.Table.email, args.email)),
				)
				.get() !== undefined
		);
	}
}

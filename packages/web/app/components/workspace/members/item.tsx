import { User } from "~/components/user";
import type { hono, InferHono } from "~/lib/hono";

type Member = InferHono<(typeof hono.api.workspace)[":id"]["members"]["$get"]>[number];

export function Item({ member }: { member: Member }) {
	return (
		<li className="flex items-center gap-3 py-3">
			<User.Avatar id={member.userId} image={member.image} name={member.name} size="sm" />
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm">{member.name}</p>
				<p className="truncate text-muted-foreground text-xs">{member.email}</p>
			</div>
			<span className="text-muted-foreground text-xs capitalize">{member.role}</span>
		</li>
	);
}

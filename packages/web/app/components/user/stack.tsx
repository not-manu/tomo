import { AvatarGroup, AvatarGroupCount } from "~/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { Avatar } from "./avatar";

type Person = { id: string; name?: string | null | undefined; image?: string | null | undefined };

export function Stack({
	users,
	max = 3,
	size = "sm",
	className,
}: {
	users: Person[];
	max?: number;
	size?: "xs" | "sm" | "default" | "lg";
	className?: string;
}) {
	if (users.length === 0) return null;
	const shown = users.length > max ? users.slice(0, max - 1) : users;
	const hidden = users.slice(shown.length);

	return (
		<AvatarGroup
			className={cn(size === "xs" || size === "sm" ? "-space-x-1.5" : "-space-x-2", className)}
		>
			{shown.map((user) => (
				<Tooltip key={user.id}>
					<TooltipTrigger asChild>
						<span className="inline-flex rounded-full ring-2 ring-background">
							<Avatar
								id={user.id}
								image={user.image ?? null}
								name={user.name ?? null}
								size={size}
							/>
						</span>
					</TooltipTrigger>
					<TooltipContent>{user.name}</TooltipContent>
				</Tooltip>
			))}
			{hidden.length > 0 ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<AvatarGroupCount
							className={cn(
								"font-medium text-xs",
								size === "xs" && "size-5 text-[10px]",
								size === "sm" && "size-6",
								size === "lg" && "size-10",
							)}
						>
							+{hidden.length}
						</AvatarGroupCount>
					</TooltipTrigger>
					<TooltipContent>{hidden.map((user) => user.name).join(", ")}</TooltipContent>
				</Tooltip>
			) : null}
		</AvatarGroup>
	);
}

import { type Presence, User as UserModel } from "@tomo/api";
import { cn } from "~/lib/utils";

const COLORS = [
	["fill-blue-600", "bg-blue-600"],
	["fill-red-600", "bg-red-600"],
	["fill-green-600", "bg-green-600"],
	["fill-orange-600", "bg-orange-600"],
	["fill-purple-600", "bg-purple-600"],
	["fill-magenta-600", "bg-magenta-600"],
	["fill-cyan-600", "bg-cyan-600"],
	["fill-yellow-600", "bg-yellow-600"],
] as const;

function color(id: string) {
	let hash = 0;
	for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
	return COLORS[Math.abs(hash) % COLORS.length] ?? COLORS[0];
}

export function Root({ cursors, className }: { cursors: Presence.Cursor[]; className?: string }) {
	return (
		<div className={cn("pointer-events-none relative overflow-hidden", className)}>
			{cursors.map(({ id, user, point }) => {
				if (!point) return null;
				const [fill, bg] = color(user.id);
				return (
					<div
						key={id}
						className="absolute flex items-start transition-[left,top] duration-75 ease-linear"
						style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
					>
						<svg viewBox="0 0 16 16" className={cn("size-4", fill)} aria-hidden="true">
							<path d="M1 1l5 14 2-6 6-2z" className="stroke-white" strokeLinejoin="round" />
						</svg>
						<span
							className={cn("mt-3 rounded-md px-1.5 py-0.5 font-medium text-[10px] text-white", bg)}
						>
							{UserModel.firstName(user) || "Someone"}
						</span>
					</div>
				);
			})}
		</div>
	);
}

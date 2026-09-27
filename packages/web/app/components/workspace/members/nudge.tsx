import { Plus, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { User } from "~/components/user";

export function Nudge({
	user,
	alone,
	onInvite,
}: {
	user: { id: string; name: string; image?: string | null | undefined };
	alone: boolean;
	onInvite: () => void;
}) {
	const [ready, setReady] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		if (!alone) return setReady(false);
		const timer = setTimeout(() => setReady(true), 2500);
		return () => clearTimeout(timer);
	}, [alone]);

	return (
		<AnimatePresence>
			{alone && ready && !dismissed ? (
				<motion.div
					animate={{ opacity: 1, y: 0, scale: 1 }}
					className="flex w-full flex-col gap-3 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-xl"
					data-snapshot-ignore
					exit={{ opacity: 0, y: 8, scale: 0.98 }}
					initial={{ opacity: 0, y: 8, scale: 0.98 }}
					transition={{ duration: 0.2, ease: "easeOut" }}
				>
					<div className="flex items-start gap-3">
						<div className="flex shrink-0 items-center">
							<User.Avatar id={user.id} image={user.image ?? null} name={user.name} />
							<span className="-ml-2 flex size-8 items-center justify-center rounded-full border border-muted-foreground/50 border-dashed bg-popover text-muted-foreground">
								<Plus className="size-3.5" />
							</span>
						</div>
						<div className="flex grow flex-col gap-1">
							<span className="font-medium text-sm">tomo is better with friends</span>
							<span className="text-muted-foreground text-xs leading-relaxed">
								This computer is built to be shared. Invite a teammate and you'll see their cursor,
								terminal and edits right here, live.
							</span>
						</div>
						<button
							aria-label="Dismiss"
							className="-mt-1 -mr-1 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
							onClick={() => setDismissed(true)}
							type="button"
						>
							<X className="size-3.5" />
						</button>
					</div>
					<div className="flex justify-end gap-2">
						<Button onClick={() => setDismissed(true)} size="sm" variant="ghost">
							Not now
						</Button>
						<Button
							onClick={() => {
								setDismissed(true);
								onInvite();
							}}
							size="sm"
						>
							<UserPlus data-icon="inline-start" />
							Invite someone
						</Button>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}

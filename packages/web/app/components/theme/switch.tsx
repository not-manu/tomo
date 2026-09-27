import { Moon, Sun } from "lucide-react";
import { useTheme } from "~/components/theme/provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export function Switch() {
	const { resolved, setTheme } = useTheme();
	const next = resolved === "dark" ? "light" : "dark";
	const Icon = resolved === "dark" ? Moon : Sun;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					aria-label={`Switch to ${next} mode`}
					className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
					onClick={() => setTheme(next)}
					type="button"
				>
					<Icon className="size-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent>{next === "dark" ? "Dark mode" : "Light mode"}</TooltipContent>
		</Tooltip>
	);
}

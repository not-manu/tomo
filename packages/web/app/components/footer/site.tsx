import { Core } from "@tomo/api";
import { Theme } from "~/components/theme";
import { Tomo } from "~/components/tomo";

const links = [
	{ label: "Privacy", to: "/privacy" },
	{ label: "Terms", to: "/terms" },
] as const;

export function Site() {
	return (
		<footer className="flex items-center gap-6 py-12 text-xs">
			<span className="font-[450] text-muted-foreground">v{Core.VERSION}</span>
			<nav className="flex items-center gap-6">
				{links.map((link) => (
					<Tomo.Link
						key={link.to}
						className="w-fit text-muted-foreground transition hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
						to={link.to}
					>
						{link.label}
					</Tomo.Link>
				))}
			</nav>
			<div className="grow" />
			<Theme.Toggle />
		</footer>
	);
}

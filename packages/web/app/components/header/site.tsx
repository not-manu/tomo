import { Core } from "@tomo/api";
import { Tomo } from "~/components/tomo";

export function Site() {
	return (
		<header className="flex h-16 items-center">
			<Tomo.Link
				aria-label={`${Core.NAME} home`}
				className="text-foreground transition hover:opacity-70 focus-visible:opacity-70 focus-visible:outline-none"
				to="/"
			>
				<Tomo.Logo className="size-6" />
			</Tomo.Link>
		</header>
	);
}

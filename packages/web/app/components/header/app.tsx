import { Core } from "@tomo/api";
import { Tomo } from "~/components/tomo";
import { User } from "~/components/user";

export function App() {
	return (
		<header className="flex h-16 items-center">
			<Tomo.Link
				aria-label={`${Core.NAME} home`}
				className="text-foreground transition hover:opacity-70 focus-visible:opacity-70 focus-visible:outline-none"
				to="/app"
			>
				<Tomo.Logo className="size-6" />
			</Tomo.Link>
			<div className="grow" />
			<User.Dropdown.Menu />
		</header>
	);
}

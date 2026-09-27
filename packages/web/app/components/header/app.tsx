import { User } from "~/components/user";
import { Crumbs } from "./crumbs";

export function App() {
	return (
		<header className="flex h-16 items-center gap-6">
			<Crumbs />
			<div className="grow" />
			<User.Dropdown.Menu />
		</header>
	);
}

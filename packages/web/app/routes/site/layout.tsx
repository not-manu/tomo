import { Outlet } from "react-router";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";

export default function SiteLayout() {
	return (
		<div className="mx-auto flex min-h-svh max-w-6xl flex-col px-4 py-20 sm:px-16">
			<Header.Site />
			<main className="flex flex-1 flex-col justify-center">
				<Outlet />
			</main>
			<Footer.Site />
		</div>
	);
}

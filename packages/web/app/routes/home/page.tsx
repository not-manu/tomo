import { Core } from "@tomo/api";
import { Auth } from "~/components/auth";
import { Footer } from "~/components/footer";
import { Text } from "~/components/text";
import { Tomo } from "~/components/tomo";

export default function HomePage() {
	return (
		<main className="mx-auto flex min-h-svh max-w-6xl flex-col px-4 pt-20 sm:px-16">
			<header className="flex items-center">
				<Tomo.Link
					to="/"
					aria-label={`${Core.NAME} home`}
					className="text-foreground transition hover:opacity-70 focus-visible:opacity-70 focus-visible:outline-none"
				>
					<Tomo.Logo className="size-6" />
				</Tomo.Link>
			</header>
			<div className="h-24 sm:h-32" />
			<Text.Heading>
				A collaborative workspace for humans
				<br />
				and agents
			</Text.Heading>
			<div className="h-8" />
			<div className="flex flex-wrap items-center gap-2">
				<Auth.Button />
			</div>
			<div className="h-16" />
			{/* TODO: demo animation of the shared desktop */}
			<div className="aspect-video w-full rounded-2xl border bg-muted" />
			<div className="grow" />
			<Footer.Site />
		</main>
	);
}

import { Core } from "@tomo/api";
import { Auth } from "~/components/auth";
import { Demo } from "~/components/demo";
import { Footer } from "~/components/footer";
import { Figma } from "~/components/svgs/figma";
import { GitHub } from "~/components/svgs/github";
import { Text } from "~/components/text";
import { Tomo } from "~/components/tomo";
import { Button } from "~/components/ui/button";

const FIGMA_URL =
	"https://www.figma.com/design/aLwUo7SOc5OYmaaUI3nw46/Innovation-Cup---Aura-67?node-id=39-994";
const GITHUB_URL = "https://github.com/not-manu/tomo";

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
				<div className="grow" />
				<Button asChild size="icon-lg" variant="ghost">
					<a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
						<GitHub className="size-5" />
					</a>
				</Button>
				<Button asChild size="icon-lg" variant="ghost">
					<a href={FIGMA_URL} target="_blank" rel="noreferrer" aria-label="Figma">
						<Figma className="size-5" />
					</a>
				</Button>
			</div>
			<div className="h-16" />
			<Demo.Root />
			<div className="grow" />
			<div className="h-16" />
			<Footer.Site />
		</main>
	);
}

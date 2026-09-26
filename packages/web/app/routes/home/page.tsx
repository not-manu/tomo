import { Core } from "@tomo/api";
import { Auth } from "~/components/auth";
import { Figure } from "~/components/figure";
import { Footer } from "~/components/footer";
import { Section } from "~/components/section";
import { Text } from "~/components/text";
import { Tomo } from "~/components/tomo";
import { Button } from "~/components/ui/button";

const STACK = [
	["Web", "React Router, Tailwind, Motion"],
	["API", "Hono on Node 22"],
	["Infra", "Docker, Caddy, Terraform"],
	["Cloud", "Google Compute Engine"],
] as const;

const PROBLEM = [
	["Who", "The specific role, situation or population affected"],
	["What", "The moment the problem occurs"],
	["Why it matters now", "Time, money, risk or missed opportunity, quantified"],
	["Why current options fall short", "The real alternatives and where they break down"],
] as const;

const INSIGHT = [
	["What we observed", "A concrete moment, conversation, data point or experience"],
	["What it revealed", "The deeper problem beneath the obvious one"],
	["Why it unlocks a solution", "What now makes this possible"],
] as const;

const IMPACT = [
	["Primary number", "Number + what it measures"],
	["Number 2 · optional", "Number + what it measures"],
	["Number 3 · optional", "Number + what it measures"],
] as const;

const ROADMAP = [
	["Near term", "Timeframe + measurable milestone"],
	["Medium term", "Timeframe + measurable milestone"],
	["Long term", "Timeframe + measurable milestone"],
] as const;

const GAP = "h-40 sm:h-56";

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
			<Section.Label index={1}>{Core.NAME}</Section.Label>
			<div className="h-4" />
			<Text.Heading className="max-w-120">{Core.DESCRIPTION}</Text.Heading>
			<div className="h-8" />
			<div className="flex flex-wrap items-center gap-2">
				<Auth.Button />
				<Button size="lg" variant="secondary">
					Read the docs
				</Button>
			</div>
			<div className="h-16" />
			{/* TODO: replace with a demo of the shared desktop (video or live mockup) */}
			<div className="aspect-video w-full rounded-2xl border bg-muted" />

			<div className={GAP} />
			<Section.Root
				index={2}
				label="Problem & urgency"
				prompt="The problem in one sentence"
				title="AI is single-player. Work isn't."
			>
				<div className="grid gap-12 sm:grid-cols-2">
					{PROBLEM.map(([label, hint]) => (
						<Section.Field key={label} label={label} hint={hint} />
					))}
				</div>
			</Section.Root>

			<div className={GAP} />
			<Section.Root
				index={3}
				label="Inspiration / key insight"
				prompt="The insight in one memorable sentence"
			>
				<div className="grid gap-12 sm:grid-cols-3">
					{INSIGHT.map(([label, hint]) => (
						<Section.Field key={label} label={label} hint={hint} />
					))}
				</div>
			</Section.Root>

			<div className={GAP} />
			<Section.Root
				index={4}
				label="Solution overview"
				prompt="What it is, in one sentence"
				title="One computer for your team and its agents."
			>
				<Section.Field label="Who it is for" hint="Who uses or benefits from the solution" />
				<div className="flex flex-col gap-24 sm:gap-32">
					<Figure.Root title="Always on">
						<Figure.AlwaysOn />
					</Figure.Root>
					<Figure.Root title="One computer, everyone on it" flip>
						<Figure.Shared />
					</Figure.Root>
					<Figure.Root title="Isolated workspaces">
						<Figure.Isolated />
					</Figure.Root>
				</div>
				<Section.Field
					label="What changes"
					hint="What the user can now do, achieve or avoid that wasn't possible before"
				/>
			</Section.Root>

			<div className={GAP} />
			<Section.Root
				index={5}
				label="Quantified impact"
				prompt="The most important outcome as a number"
			>
				<div className="grid gap-12 sm:grid-cols-3">
					{IMPACT.map(([label, hint]) => (
						<Section.Field key={label} label={label} hint={hint} />
					))}
				</div>
				<Section.Field
					label="How the numbers were calculated"
					hint="Inputs × method × source × assumptions, each labeled verified, research, calculated or illustrative"
				/>
			</Section.Root>

			<div className={GAP} />
			<Section.Root
				index={6}
				label="What makes this different?"
				prompt="The differentiator in one sentence"
			>
				<Section.Placeholder
					label="Comparison against the real alternatives people use today"
					className="aspect-video"
				/>
				<div className="grid gap-12 sm:grid-cols-2">
					<Section.Field
						label="How it is different"
						hint="One specific differentiator against today's alternatives"
					/>
					<Section.Field
						label="Why it is possible, and hard to copy"
						hint="Data, technical approach, workflow access, expertise or partnerships"
					/>
				</div>
			</Section.Root>

			<div className={GAP} />
			<Section.Root
				index={7}
				label="Technical design"
				prompt="The technical decision that makes this work"
			>
				{/* TODO: architecture / data-flow diagram, understandable to a non-specialist */}
				<Section.Placeholder label="Architecture / data-flow diagram" className="aspect-video" />
				<div className="flex flex-col gap-6">
					<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
						Stack
					</span>
					<dl className="grid gap-x-8 gap-y-10 sm:grid-cols-4">
						{STACK.map(([layer, tools]) => (
							<div key={layer} className="flex flex-col gap-2">
								<dt className="text-muted-foreground text-sm">{layer}</dt>
								<dd className="text-balance">{tools}</dd>
							</div>
						))}
					</dl>
				</div>
			</Section.Root>

			<div className={GAP} />
			<Section.Root index={8} label="Future roadmap" prompt="Where this goes if it works">
				<div className="grid gap-12 sm:grid-cols-3">
					{ROADMAP.map(([label, hint]) => (
						<Section.Field key={label} label={label} hint={hint} />
					))}
				</div>
			</Section.Root>

			<div className={GAP} />
			<Footer.Site />
		</main>
	);
}

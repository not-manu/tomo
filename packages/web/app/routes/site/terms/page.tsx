import { Core } from "@tomo/api";
import { Legal } from "~/components/legal";

const CONTACT = "manu.anish@mail.utoronto.ca";

export default function TermsPage() {
	return (
		<Legal.Root
			title="Terms of Service"
			updated="September 26, 2026"
			sections={[
				{
					heading: "Acceptance",
					body: `By using ${Core.NAME}, you agree to these terms. If you do not agree, please do not use the service.`,
				},
				{
					heading: "Your account",
					body: "You are responsible for activity under your account and for keeping your sign-in credentials secure. You must be old enough to consent to a service like this in your jurisdiction.",
				},
				{
					heading: "Workspaces and agents",
					body: "Workspaces run code, including code written by AI agents acting on your instructions. You are responsible for what you and your agents run, and for anyone you invite into a workspace. Do not use workspaces to attack other systems, mine cryptocurrency, or run anything unlawful.",
				},
				{
					heading: "Acceptable use",
					body: "Don't misuse the service: no unlawful activity, no harassment, no attempts to break out of, overload, or interfere with the platform, and no infringing on others' rights.",
				},
				{
					heading: "Content",
					body: `You retain ownership of content you create in ${Core.NAME}. You grant us the rights needed to store, run, and display it as part of operating the service, including sending it to AI model providers on your behalf.`,
				},
				{
					heading: "Termination",
					body: `You may stop using ${Core.NAME} at any time. We may suspend or terminate accounts and workspaces that violate these terms.`,
				},
				{
					heading: "Disclaimer",
					body: (
						<>
							{Core.NAME} is an early product built during a hackathon. The service is provided "as
							is" without warranties of any kind, and may be interrupted, changed, or shut down at
							any time. To the extent permitted by law, we are not liable for indirect or
							consequential damages, including loss of data in a workspace.
						</>
					),
				},
				{
					heading: "Contact",
					body: (
						<>
							Questions? Email us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
						</>
					),
				},
			]}
		/>
	);
}

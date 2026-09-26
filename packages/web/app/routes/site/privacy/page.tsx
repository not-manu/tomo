import { Core } from "@tomo/api";
import { Legal } from "~/components/legal";

const CONTACT = "manu.anish@mail.utoronto.ca";

export default function PrivacyPage() {
	return (
		<Legal.Root
			title="Privacy Policy"
			updated="September 26, 2026"
			sections={[
				{
					heading: "Overview",
					body: `${Core.NAME} ("we", "us") is a shared computer for teams and their AI agents. This policy describes what information we collect, how we use it, and the choices you have.`,
				},
				{
					heading: "Information we collect",
					body: "When you sign in with Google, we receive your name, email address, and profile picture. When you sign up with an email and password, we store your name, email, and a hashed password. We also store what you create inside the app: workspaces, files, terminal sessions, messages, and instructions you give to agents.",
				},
				{
					heading: "How we use information",
					body: "We use your information to operate the service, authenticate you, run your workspaces, and improve the product. Content you put in a workspace may be sent to third-party AI model providers so agents can act on it. We do not sell personal information, and we do not use it for advertising.",
				},
				{
					heading: "Sharing",
					body: `Workspaces are shared with the people you invite to them. Beyond that, we share data only with service providers needed to run ${Core.NAME} (hosting, authentication, and AI model providers), or when required by law.`,
				},
				{
					heading: "Retention",
					body: "We keep your data for as long as your account exists. Deleting a workspace deletes its files and history; deleting your account deletes the data associated with it.",
				},
				{
					heading: "Your choices",
					body: "You may request access to or deletion of your account data at any time by contacting us.",
				},
				{
					heading: "Contact",
					body: (
						<>
							Questions about this policy? Email us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
						</>
					),
				},
			]}
		/>
	);
}

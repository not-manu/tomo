import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Form } from "~/components/form";
import { Google } from "~/components/svgs/google";
import { Text } from "~/components/text";
import { Button } from "~/components/ui/button";
import { FieldGroup, FieldSeparator } from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";
import { signIn, signUp } from "~/lib/auth";

const Schema = z.object({
	name: z.string().trim().max(100),
	email: z.email("Please enter a valid email."),
	password: z.string().min(8, "Use at least 8 characters."),
});
type Schema = z.infer<typeof Schema>;

export function Root({ onDone }: { onDone: () => void }) {
	const [mode, setMode] = useState<"login" | "signup">("login");
	const [isRedirecting, setIsRedirecting] = useState(false);
	const signup = mode === "signup";

	const form = useForm<Schema>({
		resolver: zodResolver(Schema),
		defaultValues: { name: "", email: "", password: "" },
	});

	async function submit(values: Schema) {
		if (signup && !values.name) {
			form.setError("name", { message: "Please enter your name." });
			return;
		}
		const { error } = signup
			? await signUp.email({ name: values.name, email: values.email, password: values.password })
			: await signIn.email({ email: values.email, password: values.password });
		if (error) {
			toast.error(error.message ?? "Something went wrong. Please try again.");
			return;
		}
		onDone();
	}

	async function signInWithGoogle() {
		setIsRedirecting(true);
		try {
			await signIn.social({ provider: "google", callbackURL: "/app" });
		} catch (error) {
			setIsRedirecting(false);
			throw error;
		}
	}

	return (
		<div className="flex w-full max-w-sm flex-col">
			<Text.Heading>{signup ? "Create your account" : "Welcome back"}</Text.Heading>
			<Text.Subtext>
				{signup ? "Already have an account? " : "New here? "}
				<button
					type="button"
					className="cursor-pointer text-foreground underline underline-offset-4"
					onClick={() => setMode(signup ? "login" : "signup")}
				>
					{signup ? "Log in" : "Create one"}
				</button>
			</Text.Subtext>
			<div className="h-10" />
			<Button
				disabled={isRedirecting}
				onClick={signInWithGoogle}
				size="lg"
				type="button"
				variant="secondary"
			>
				{isRedirecting ? (
					<>
						<Spinner />
						Redirecting...
					</>
				) : (
					<>
						<Google className="size-4" />
						Continue with Google
					</>
				)}
			</Button>
			<FieldSeparator className="my-6">or</FieldSeparator>
			<form onSubmit={form.handleSubmit(submit)}>
				<FieldGroup>
					{signup ? (
						<Form.TextField
							autoComplete="name"
							control={form.control}
							label="Name"
							name="name"
							placeholder="Ada Lovelace"
							required
						/>
					) : null}
					<Form.TextField
						autoComplete="email"
						control={form.control}
						label="Email"
						name="email"
						placeholder="you@example.com"
						required
						type="email"
					/>
					<Form.TextField
						autoComplete={signup ? "new-password" : "current-password"}
						control={form.control}
						label="Password"
						name="password"
						required
						type="password"
					/>
					<Button disabled={form.formState.isSubmitting} size="lg" type="submit">
						{form.formState.isSubmitting ? (
							<>
								<Spinner />
								{signup ? "Creating account..." : "Logging in..."}
							</>
						) : signup ? (
							"Create account"
						) : (
							"Log in"
						)}
					</Button>
				</FieldGroup>
			</form>
		</div>
	);
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Invite } from "@tomo/api";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Form } from "~/components/form";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { useCreateInvite } from "~/hooks/use-invites";
import type { Detail } from "../header/root";

type Input = z.input<typeof Invite.Create>;

export function InviteForm({ workspace }: { workspace: Detail }) {
	const create = useCreateInvite(workspace.id);

	const form = useForm<Input, unknown, Invite.Create>({
		resolver: zodResolver(Invite.Create),
		defaultValues: { email: "" },
	});

	async function submit(values: Invite.Create) {
		try {
			await create.mutateAsync(values);
			toast.success(`Invited ${values.email}`);
			form.reset();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<form className="flex items-end gap-2" onSubmit={form.handleSubmit(submit)}>
			<div className="flex-1">
				<Form.TextField
					autoComplete="email"
					control={form.control}
					label="Invite by email"
					name="email"
					placeholder="teammate@example.com"
					type="email"
				/>
			</div>
			<Button disabled={form.formState.isSubmitting} type="submit" variant="secondary">
				{form.formState.isSubmitting ? <Spinner /> : "Invite"}
			</Button>
		</form>
	);
}

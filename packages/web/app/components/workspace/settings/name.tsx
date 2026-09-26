import { zodResolver } from "@hookform/resolvers/zod";
import { Workspace } from "@tomo/api";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "~/components/form";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { useUpdateWorkspace } from "~/hooks/use-workspace";

export function Name({ workspace }: { workspace: Pick<Workspace.Select, "id" | "name"> }) {
	const update = useUpdateWorkspace(workspace.id);

	const form = useForm<Workspace.Create>({
		resolver: zodResolver(Workspace.Create),
		values: { name: workspace.name },
	});

	async function submit(values: Workspace.Create) {
		try {
			await update.mutateAsync(values);
			toast.success("Workspace renamed");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<form className="flex max-w-sm items-end gap-2" onSubmit={form.handleSubmit(submit)}>
			<div className="flex-1">
				<Form.TextField control={form.control} label="Name" name="name" required />
			</div>
			<Button disabled={form.formState.isSubmitting || !form.formState.isDirty} type="submit">
				{form.formState.isSubmitting ? <Spinner /> : "Save"}
			</Button>
		</form>
	);
}

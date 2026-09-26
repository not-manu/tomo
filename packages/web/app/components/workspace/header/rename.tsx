import { zodResolver } from "@hookform/resolvers/zod";
import { Workspace } from "@tomo/api";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "~/components/form";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { FieldGroup } from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";
import { useUpdateWorkspace } from "~/hooks/use-workspace";
import type { Detail } from "./root";

export function Rename({ workspace }: { workspace: Detail }) {
	const [open, setOpen] = useState(false);
	const update = useUpdateWorkspace(workspace.id);

	const form = useForm<Workspace.Create>({
		resolver: zodResolver(Workspace.Create),
		values: { name: workspace.name },
	});

	async function submit(values: Workspace.Create) {
		try {
			await update.mutateAsync(values);
			setOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button aria-label="Rename workspace" size="icon" variant="outline">
					<Pencil />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Rename workspace</DialogTitle>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(submit)}>
					<FieldGroup>
						<Form.TextField control={form.control} label="Name" name="name" required />
						<DialogFooter>
							<Button disabled={form.formState.isSubmitting} type="submit">
								{form.formState.isSubmitting ? (
									<>
										<Spinner />
										Saving...
									</>
								) : (
									"Save"
								)}
							</Button>
						</DialogFooter>
					</FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	);
}

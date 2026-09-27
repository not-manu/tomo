import { zodResolver } from "@hookform/resolvers/zod";
import { Workspace } from "@tomo/api";
import { Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Form } from "~/components/form";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { FieldGroup } from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";
import { useCreateWorkspace } from "~/hooks/use-workspace";

export function Root({ children }: { children?: ReactNode }) {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const create = useCreateWorkspace();

	const form = useForm<Workspace.Create>({
		resolver: zodResolver(Workspace.Create),
		defaultValues: { name: "" },
	});

	async function submit(values: Workspace.Create) {
		try {
			const workspace = await create.mutateAsync(values);
			setOpen(false);
			form.reset();
			navigate(Workspace.path(workspace));
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children ?? (
					<Button>
						<Plus data-icon="inline-start" />
						New workspace
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>New workspace</DialogTitle>
					<DialogDescription>One computer for your team and its agents.</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(submit)}>
					<FieldGroup>
						<Form.TextField
							control={form.control}
							label="Name"
							name="name"
							placeholder="Q4 launch"
							required
						/>
						<DialogFooter>
							<Button disabled={form.formState.isSubmitting} type="submit">
								{form.formState.isSubmitting ? (
									<>
										<Spinner />
										Creating...
									</>
								) : (
									"Create"
								)}
							</Button>
						</DialogFooter>
					</FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	);
}

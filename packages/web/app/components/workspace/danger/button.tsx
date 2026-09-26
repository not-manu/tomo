import { LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button as UiButton } from "~/components/ui/button";
import { Root, type Target } from "./root";

export function Button({ workspace }: { workspace: Target }) {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const owner = workspace.role === "owner";

	return (
		<>
			<UiButton onClick={() => setOpen(true)} variant="destructive">
				{owner ? <Trash2 data-icon="inline-start" /> : <LogOut data-icon="inline-start" />}
				{owner ? "Delete workspace" : "Leave workspace"}
			</UiButton>
			<Root
				onOpenChange={setOpen}
				onSuccess={() => navigate("/app", { replace: true })}
				open={open}
				workspace={workspace}
			/>
		</>
	);
}

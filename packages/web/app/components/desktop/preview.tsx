import { Sandbox } from "@tomo/api";
import { fileUrl } from "~/hooks/use-files";

export function Preview({ workspaceId, path }: { workspaceId: string; path: string }) {
	const kind = Sandbox.preview(path);
	const src = fileUrl(workspaceId, path);

	return (
		<div className="flex size-full items-center justify-center bg-neutral-950">
			{kind === "image" ? (
				<img alt={path} className="max-h-full max-w-full object-contain" src={src} />
			) : kind === "video" ? (
				<video autoPlay className="max-h-full max-w-full" controls loop src={src}>
					<track kind="captions" />
				</video>
			) : (
				<p className="text-neutral-400 text-sm">No preview available</p>
			)}
		</div>
	);
}

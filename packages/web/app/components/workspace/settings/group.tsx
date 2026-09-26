import type { ReactNode } from "react";

export function Group({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-4">
			<div>
				<h2 className="font-medium">{title}</h2>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			{children}
		</section>
	);
}

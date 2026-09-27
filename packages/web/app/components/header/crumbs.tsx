import { Workspace } from "@tomo/api";
import { Fragment } from "react";
import { useMatch, useParams } from "react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkspace } from "~/hooks/use-workspace";

type Crumb = { key: string; label: React.ReactNode; to: string };

export function Crumbs() {
	const { workspace: id } = useParams();
	const settings = useMatch("/w/:workspace/settings");
	const { data: workspace } = useWorkspace(id ?? "", { enabled: Boolean(id) });

	const crumbs: Crumb[] = [{ key: "app", label: "Workspaces", to: "/app" }];
	if (id) {
		crumbs.push({
			key: id,
			label: workspace?.name ?? <Skeleton className="h-4 w-20" />,
			to: Workspace.path({ id }),
		});
	}
	if (id && settings) {
		crumbs.push({ key: "settings", label: "Settings", to: `${Workspace.path({ id })}/settings` });
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{crumbs.map((crumb, index) => (
					<Fragment key={crumb.key}>
						{index > 0 ? <BreadcrumbSeparator /> : null}
						<BreadcrumbItem>
							{index === crumbs.length - 1 ? (
								<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink to={crumb.to}>{crumb.label}</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

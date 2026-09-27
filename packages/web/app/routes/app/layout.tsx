import { Navigate, Outlet, useLocation, useMatch } from "react-router";
import { Header } from "~/components/header";
import { useDesktopSync } from "~/hooks/use-desktops";
import { useInviteSync } from "~/hooks/use-invites";
import { useSyncConnection } from "~/hooks/use-sync";
import { useWindowSync } from "~/hooks/use-windows";
import { useWorkspaceSync } from "~/hooks/use-workspace";
import { useSession } from "~/lib/auth";

export default function AppLayout() {
	const location = useLocation();
	const fullscreen = useMatch("/w/:workspace/desktop");
	const { data: session, isPending } = useSession();

	useSyncConnection(Boolean(session));
	useWorkspaceSync();
	useInviteSync();
	useDesktopSync();
	useWindowSync();

	if (!isPending && !session) {
		return <Navigate replace state={{ from: location }} to="/login" />;
	}

	if (fullscreen) return isPending ? null : <Outlet />;

	return (
		<div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-24 px-4 py-20 sm:px-16">
			<Header.App />
			{isPending ? null : <Outlet />}
		</div>
	);
}

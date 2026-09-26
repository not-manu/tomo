import { Navigate, Outlet, useLocation } from "react-router";
import { Header } from "~/components/header";
import { useSession } from "~/lib/auth";

export default function AppLayout() {
	const location = useLocation();
	const { data: session, isPending } = useSession();

	if (!isPending && !session) {
		return <Navigate replace state={{ from: location }} to="/login" />;
	}

	return (
		<div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-24 px-4 py-20 sm:px-16">
			<Header.App />
			{isPending ? null : <Outlet />}
		</div>
	);
}

import { Navigate, useLocation, useNavigate } from "react-router";
import { Auth } from "~/components/auth";
import { useSession } from "~/lib/auth";

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { data: session, isPending } = useSession();
	const from: string = location.state?.from?.pathname ?? "/app";

	if (isPending) return null;
	if (session) return <Navigate replace to={from} />;

	return (
		<div className="flex flex-col items-center py-16">
			<Auth.Root onDone={() => navigate(from, { replace: true })} />
		</div>
	);
}

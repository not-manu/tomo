import { createAuthClient } from "better-auth/react";
import { baseURL } from "./hono";

export const { signIn, signUp, signOut, useSession } = createAuthClient({
	baseURL,
	basePath: "/api/auth",
	sessionOptions: { refetchOnWindowFocus: false },
});

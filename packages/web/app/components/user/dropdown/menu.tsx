import { House, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { isTheme, useTheme } from "~/components/theme/provider";
import { Tomo } from "~/components/tomo";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { signOut, useSession } from "~/lib/auth";
import { Avatar } from "../avatar";

const themeIcon = { light: Sun, dark: Moon, system: Monitor } as const;

export function Menu() {
	const navigate = useNavigate();
	const { data: session } = useSession();
	const { theme, setTheme } = useTheme();

	const user = session?.user;
	const ThemeIcon = themeIcon[theme];

	async function handleSignOut() {
		const toastId = toast.loading("Signing out...");
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					toast.success("Signed out", { id: toastId });
					navigate("/");
				},
				onError: () => {
					toast.error("Failed to sign out", { id: toastId });
				},
			},
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label="Account menu"
				className="inline-flex rounded-full outline-none ring-foreground/10 transition-all hover:ring-4 focus-visible:ring-4 focus-visible:ring-ring/30 data-[state=open]:ring-4"
			>
				<Avatar id={user?.id ?? null} image={user?.image ?? null} name={user?.name ?? null} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64" sideOffset={8}>
				{user ? (
					<DropdownMenuLabel className="flex flex-col gap-0.5 py-3">
						{user.name ? (
							<span className="font-medium text-foreground text-sm">{user.name}</span>
						) : null}
						<span className="truncate font-normal text-muted-foreground text-xs">{user.email}</span>
					</DropdownMenuLabel>
				) : null}
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Tomo.Link to="/app">
						<House />
						Home
					</Tomo.Link>
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<ThemeIcon />
						Theme
						<span className="ml-auto text-muted-foreground text-xs capitalize">{theme}</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-40">
						<DropdownMenuRadioGroup
							onValueChange={(v) => {
								if (isTheme(v)) setTheme(v);
							}}
							value={theme}
						>
							<DropdownMenuRadioItem value="light">
								<Sun />
								Light
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="dark">
								<Moon />
								Dark
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="system">
								<Monitor />
								System
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={handleSignOut} variant="destructive">
					<LogOut />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

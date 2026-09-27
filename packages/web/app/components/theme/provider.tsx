import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

export const THEMES = ["dark", "light", "system"] as const satisfies readonly Theme[];
export const isTheme = (v: unknown): v is Theme => v === "dark" || v === "light" || v === "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	resolved: "light" | "dark";
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: "system",
	resolved: "light",
	setTheme: () => null,
};

const systemTheme = (): "light" | "dark" =>
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "tomo-theme",
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		const stored = localStorage.getItem(storageKey);
		return isTheme(stored) ? stored : defaultTheme;
	});

	const [system, setSystem] = useState(systemTheme);
	const resolved = theme === "system" ? system : theme;

	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => setSystem(systemTheme());
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(resolved);
	}, [resolved]);

	const value = {
		theme,
		resolved,
		setTheme: (theme: Theme) => {
			localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};

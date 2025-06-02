import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type FC,
	type PropsWithChildren,
} from "react";
import * as v from "valibot";

const STORAGE_KEY = "theme";

const ThemeSchema = v.union([
	v.literal("dark"),
	v.literal("light"),
	v.literal("system"),
]);
type Theme = v.InferInput<typeof ThemeSchema>;

type ThemeContext = {
	theme: Theme;
	appliedTheme: "light" | "dark";
	setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContext>({
	theme: "system",
	appliedTheme: "dark",
	setTheme: () => null,
});

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
	const [theme, setTheme] = useState<Theme>(() => {
		const parsedTheme = v.safeParse(
			ThemeSchema,
			localStorage.getItem(STORAGE_KEY),
		);

		if (!parsedTheme.success) {
			return "system";
		}

		return parsedTheme.output;
	});

	const appliedTheme = useMemo(() => {
		if (theme === "system") {
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				return "dark";
			}

			return "light";
		}

		return theme;
	}, [theme]);

	useEffect(() => {
		const force =
			theme === "dark" ||
			(theme === "system" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);

		document.documentElement.classList.toggle("dark", force);

		if (theme === "system") {
			localStorage.removeItem(STORAGE_KEY);
		} else {
			localStorage.setItem(STORAGE_KEY, theme);
		}
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, appliedTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const themeContext = useContext(ThemeContext);

	if (!themeContext) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return themeContext;
};

import {
	createContext,
	useContext,
	useEffect,
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
	setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContext>({
	theme: "system",
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
		<ThemeContext.Provider value={{ theme, setTheme }}>
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

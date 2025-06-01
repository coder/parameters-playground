// @ts-expect-error TODO: create types for this
import "@fontsource-variable/inter";
import { TooltipProvider } from "@/components/Tooltip";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { ThemeProvider } from "@/contexts/theme.tsx";
import { BrowserRouter } from "react-router";

const root = document.getElementById("root");

if (!root) {
	console.error("An element with the id `root` does not exist");
} else {
	createRoot(root).render(
		<StrictMode>
			<BrowserRouter>
				<ThemeProvider>
					<TooltipProvider>
						<App />
					</TooltipProvider>
				</ThemeProvider>
			</BrowserRouter>
		</StrictMode>,
	);
}

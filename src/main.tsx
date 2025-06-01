import "@fontsource-variable/inter";
import "@fontsource/dm-mono";
import { TooltipProvider } from "@/components/Tooltip";
import { ThemeProvider } from "@/contexts/theme.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App.tsx";

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

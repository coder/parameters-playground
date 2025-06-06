import { TooltipProvider } from "@/client/components/Tooltip";
import { ThemeProvider } from "@/client/contexts/theme.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App.tsx";
import "@/client/index.css";

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

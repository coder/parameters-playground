// @ts-expect-error TODO: create types for this
import "@fontsource-variable/inter";
import { TooltipProvider } from "@/components/Tooltip";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

const root = document.getElementById("root");

if (!root) {
	console.error("An element with the id `root` does not exist");
} else {
	createRoot(root).render(
		<StrictMode>
			<TooltipProvider>
				<App />
			</TooltipProvider>
		</StrictMode>,
	);
}

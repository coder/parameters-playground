import { TooltipProvider } from "@/client/components/Tooltip";
import { ThemeProvider } from "@/client/contexts/theme.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { App } from "./App.tsx";
import "@/client/index.css";
import { EditorProvider } from "./contexts/editor.tsx";

const router = createBrowserRouter([
	{
		path: "*",
		Component: App,
	},
]);

const root = document.getElementById("root");

if (!root) {
	console.error("An element with the id `root` does not exist");
} else {
	createRoot(root).render(
		<StrictMode>
			<EditorProvider>
				<ThemeProvider>
					<TooltipProvider>
						<RouterProvider router={router} />
					</TooltipProvider>
				</ThemeProvider>
			</EditorProvider>
		</StrictMode>,
	);
}

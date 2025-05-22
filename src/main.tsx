import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const root = document.getElementById("root");

if (!root) {
	console.error("An element with the id `root` does not exist");
} else {
	createRoot(root).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}

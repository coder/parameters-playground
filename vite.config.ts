import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
	base: "/parameters-playground/",
	server: {
		// For dev purposes when using Coder Connect, and ngrok
		allowedHosts: [".coder", ".ngrok"],
	},
	plugins: [
		react(),
		basicSsl({
			name: "test",
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});

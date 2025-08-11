/// <reference types="vitest" />

import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "happy-dom",
		css: true,
		// Include coverage configuration
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"src/vite-env.d.ts",
			],
		},
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"monaco-editor": "./src/__mocks__/monaco-editor.ts",
		},
	},
});

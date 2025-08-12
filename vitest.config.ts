/// <reference types="vitest" />

import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "happy-dom",
		css: true,
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"monaco-editor": "./src/__mocks__/monaco-editor.ts",
		},
	},
});

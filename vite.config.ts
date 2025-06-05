import { defineConfig, mergeConfig } from "vite";

import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "node:path";
import fs from "node:fs/promises";
import devServer from "@hono/vite-dev-server";

const OUT_DIR = ".vercel";

/**
 *
 * Create the [config.json][1] and [vc-config.json][2] files required in the final output.
 *
 * [1]: <https://vercel.com/docs/build-output-api/configuration> "Configuration"
 * [2]: https://vercel.com/docs/build-output-api/primitives#serverless-function-configuration "Serverless function configuration"
 */
const vercelConfigPlugin = () => ({
	name: "write-vercel-config",
	// Write config
	writeBundle: async () => {
		const distPath = path.resolve(__dirname, OUT_DIR, "output");

		// Create config.json
		await fs.writeFile(
			path.join(distPath, "config.json"),
			JSON.stringify({ version: 3 }),
		);

		// Create .vc-config.json
		await fs.writeFile(
			path.join(distPath, "functions", "index.func", ".vc-config.json"),
			JSON.stringify({
				runtime: "nodejs20.x",
				handler: "index.js",
				launcherType: "Nodejs",
				shouldAddHelpers: true,
			}),
		);
	},
});

/**
 * Vite is handling both the building of our final assets and also running the
 * dev server which gives us HMR for both SSR'd templates and client React code.
 *
 * **Build Details**
 *
 * We're deploying to Vercel which requires very sepecific project outputs in
 * order to deploy properly [build structure][1](https://vercel.com/docs/build-output-api):
 *
 * .vercel/
 * └── output/
 *     ├── config.json
 *     ├── functions/
 *     │   └── index.func/
 *     │       ├── .vs-config.json
 *     │       └── index.js <- Server code
 *     └── static/
 *         └── assets/
 *             ├── client.js
 *             └── <other>
 *
 * The current build setup is hard coded to expect files at their current
 * paths within the code. This is something that could be improved to make
 * the build script less brittle.
 *
 * [1]: <https://vercel.com/docs/build-output-api> "Build Output API"
 *
 */
export default defineConfig(({ mode, command }) => {
	const baseConfig = {
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	};

	const clientBuildConfig = {
		build: {
			outDir: path.resolve(OUT_DIR, "output", "static", "assets"),
			manifest: true,
			rollupOptions: {
				input: ["./src/main.tsx"],
				output: {
					entryFileNames: "client.js",
					chunkFileNames: "[name]-[hash].js",
					assetFileNames: "[name].[ext]",
				},
			},
			emptyOutDir: false,
			copyPublicDir: true,
		},
	};

	const serverBuildConfig = {
		build: {
			copyPublicDir: false,
			outDir: OUT_DIR,
			minify: true,
			lib: {
				entry: "src/server.tsx",
				name: "server",
				formats: ["umd"],
			},
			rollupOptions: {
				// input: "src/server.tsx",
				output: {
					entryFileNames: "output/functions/index.func/index.js",
				},
				plugins: [vercelConfigPlugin()],
			},
		},
	};

	const devConfig = {
		server: {
			// For dev purposes when using Coder Connect, and ngrok
			allowedHosts: [".coder", ".ngrok"],
		},
		plugins: [
			react(),
			devServer({
				entry: "./src/server.tsx",
				export: "app",
			}),
			basicSsl({
				name: "dev",
			}),
		],
	};

	if (command === "build") {
		if (mode === "client") {
			return mergeConfig(baseConfig, clientBuildConfig);
		}
		return mergeConfig(baseConfig, serverBuildConfig);
	}

	return mergeConfig(baseConfig, devConfig);
});

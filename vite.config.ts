import { defineConfig } from "vite";
// import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "node:path";
import fs from "node:fs/promises";
// import devServer from "@hono/vite-dev-server";
import vercel from "vite-plugin-vercel";

// Vercel requires a config with the output version so this simple plugin
// is used to create it in the correct place.
const vercelConfigPlugin = () => ({
	name: "wiret-vercel-config",
	// Write config
	writeBundle: async () => {
		const distPath = path.resolve(__dirname, "dist", ".vercel", "output");

		// Create config.json
		await fs.writeFile(
			path.join(distPath, "config.json"),
			JSON.stringify({ version: 3 }),
		);

		// Write the .vc-config.json
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
 * dev server which gives us HMR even though we're serving the assets via Hono.
 *
 * **Build Details**
 *
 * We're deploying to Vercel which requires very a [build structure](https://vercel.com/docs/build-output-api):
 *  .vercel
 * ├── functions/ <- All backend code must go here otherwise Vercel will complain
 * │   └── index.js
 * └── static/
 *     └── client.js
 *
 */
export default defineConfig(({ mode }) => {
	const baseConfig = {
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	};

	if (mode === "client") {
		return {
			...baseConfig,
			build: {
				manifest: true,
				rollupOptions: {
					input: "src/main.tsx",
					output: {
						entryFileNames: "static/client.js",
						chunkFileNames: "static/assets/[name]-[hash].js",
						assetFileNames: "static/assets/[name].[ext]",
					},
				},
				emptyOutDir: false,
				copyPublicDir: false,
			},
		};
	}

	return {
		...baseConfig,
		server: {
			// For dev purposes when using Coder Connect, and ngrok
			allowedHosts: [".coder", ".ngrok"],
		},
		build: {
			minify: true,
			rollupOptions: {
				input: "src/server.tsx",
				output: {
					entryFileNames: ".vercel/output/functions/index.func/index.js",
				},
				plugins: [vercelConfigPlugin()],
			},
		},
		plugins: [
			// vercelConfigPlugin(),
			// devServer({
			// 	entry: "./src/server.tsx",
			// }),
			// basicSsl({
			// 	name: "dev",
			// }),

			vercel({
				entries: [
					{
						input: "src/server.tsx",
						destination: "index",
						route: ".*",
						edge: false,
					},
				],
			}),
		],
	};
});

import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "node:path";
import fs from "node:fs/promises";
import devServer from "@hono/vite-dev-server";

const viteConfigPlugin = () => ({
	name: "wiret-vercel-config",
	writeBundle: async () => {
		const distPath = path.resolve(__dirname, "dist", ".vercel");
		await fs.writeFile(
			path.join(distPath, "output", "config.json"),
			JSON.stringify({ version: 3 }),
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
			},
		},
		plugins: [
			// Vercel requires a config with the output version so this simple plugin
			// is used to create it in the correct place.
			viteConfigPlugin(),
			devServer({
				entry: "./src/server.tsx",
			}),
			basicSsl({
				name: "dev",
			}),
		],
	};
});

import fs from "node:fs/promises";
import path from "node:path";
import devServer from "@hono/vite-dev-server";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig, type Plugin } from "vite";

const OUT_DIR = ".vercel";

/**
 * Create the [config.json][1] and [vc-config.json][2] files required in the final output.
 *
 * [1]: <https://vercel.com/docs/build-output-api/configuration>
 * [2]: <https://vercel.com/docs/build-output-api/primitives#serverless-function-configuration>
 */
const vercelConfigPlugin = () => ({
	name: "write-vercel-config",
	// Write config
	writeBundle: async () => {
		const distPath = path.resolve(__dirname, OUT_DIR, "output");

		await fs.writeFile(
			path.join(distPath, "config.json"),
			JSON.stringify({ version: 3 }),
		);

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
 * Generate the vercel specific code within the server entry file.
 *
 * ```ts
 * import { handle } from "hono/vercel";
 *
 * ...
 *
 * const handler = handle(app);
 * export const GET = handler;
 * export const POST = handler;
 * export const PATCH = handler;
 * export const PUT = handler;
 * export const OPTIONS = handler;
 * ```
 *
 */
const vercelEntryPlugin = (): Plugin => {
	let entry: string;
	let resolvedEntryPath: string;
	let projectRoot: string;

	return {
		name: "vercel-entry",
		configResolved(config) {
			if (config.build.lib) {
				const e = config.build.lib.entry;
				if (typeof e === "string") {
					entry = e;
				} else {
					throw new Error("Entry must be a string path");
				}
			}

			projectRoot = config.root;
			resolvedEntryPath = path.normalize(path.resolve(projectRoot, entry));
		},
		async load(id) {
			const normalizedId = path.normalize(path.resolve(projectRoot, id));

			if (normalizedId === resolvedEntryPath) {
				try {
					const content = await fs.readFile(resolvedEntryPath, "utf-8");
					const transformedContent = [
						'import { handle } from "hono/vercel";',
						content,
						"const handler = handle(app);",
						"export const GET = handler;",
						"export const POST = handler;",
						"export const PATCH = handler;",
						"export const PUT = handler;",
						"export const OPTIONS = handler;",
					].join("\n");

					return transformedContent;
				} catch (e) {
					this.error(`Failed to process entry file ${entry}: ${e}`);
				}
			}

			return null;
		},
	};
};

/**
 * Vite is handling both the building of our final assets and also running the
 * dev server which gives us HMR for both SSR'd templates and client React code.
 *
 * **Build Details**
 *
 * We're deploying to Vercel which requires very sepecific project outputs in
 * order to deploy properly [build structure][1]:
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
 * [1]: <https://vercel.com/docs/build-output-api>
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
			minify: true,
			rollupOptions: {
				input: ["./src/client/index.tsx"],
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
				entry: "src/server/index.tsx",
				name: "server",
				formats: ["umd"],
			},
			plugins: [vercelConfigPlugin()],
			rollupOptions: {
				output: {
					entryFileNames: "output/functions/index.func/index.js",
				},
				// plugins: [vercelEntryPlugin("src/server/index.tsx")],
			},
		},
		plugins: [vercelEntryPlugin()],
	};

	const devConfig = {
		server: {
			// For dev purposes when using Coder Connect, and ngrok
			allowedHosts: [".coder", ".ngrok"],
		},
		plugins: [
			react(),
			devServer({
				entry: "./src/server/index.tsx",
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

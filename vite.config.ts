import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "node:path";
import devServer from "@hono/vite-dev-server";

// https://vite.dev/config/
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
				rollupOptions: {
					input: ["./src/main.tsx"],
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
				output: {
					entryFileNames: "api/index.js",
				},
			},
		},
		plugins: [
			devServer({
				entry: "./src/server.tsx",
			}),
			basicSsl({
				name: "dev",
			}),
		],
	};
});

import { api } from "@/server/api";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { renderToString } from "react-dom/server";

export const app = new Hono();

app.route("/api", api);
app.get("*", (c) => {
	const { url } = c.req;
	const { origin } = new URL(url);

	const injectClientScript = `
    import RefreshRuntime from "${origin}/@react-refresh";
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type) => type;
    window.__vite_plugin_react_preamble_installed__ = true;
    `;
	const hmrScript = import.meta.env ? (
		<script type="module">{injectClientScript}</script>
	) : null;

	const cssPath = import.meta.env.PROD
		? "/assets/main.css"
		: "src/client/index.css";
	const clientScriptPath = import.meta.env.PROD
		? "/assets/client.js"
		: "src/client/index.tsx";
	const wasmExecScriptPath = import.meta.env.PROD
		? "/assets/wasm_exec.js"
		: "/wasm_exec.js";

	return c.html(
		[
			"<!doctype html>",
			renderToString(
				<html lang="en">
					<head>
						<meta charSet="UTF-8" />
						<link rel="icon" type="image/svg+xml" href="/logo.svg" />
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1.0"
						/>
						<title>Paramaters Playground</title>
						<link rel="stylesheet" href={cssPath} />
						{hmrScript}
						<script type="module" src={wasmExecScriptPath}></script>
					</head>
					<body>
						<div id="root"></div>
						<script type="module" src={clientScriptPath}></script>
					</body>
				</html>,
			),
		].join("\n"),
	);
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;

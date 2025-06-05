 import { Hono } from "hono";
 import { renderToString } from "react-dom/server";
 import { serveStatic } from "hono/serve-static";
 import { handle } from "hono/vercel";
 import fs from "node:fs/promises";

 const app = new Hono();

 app.use(
 	"*",
 	serveStatic({
 		root: "./dist",
 		getContent: async (path, _) => {
 			try {
 				const data = await fs.readFile(path);
 				let contentType = "text/plain";

 				if (path.endsWith(".html")) {
 					contentType = "text/html";
 				} else if (path.endsWith(".js")) {
 					contentType = "application/javascript";
 				} else if (path.endsWith(".css")) {
 					contentType = "text/css";
 				} else if (path.endsWith(".json")) {
 					contentType = "application/json";
 				} else if (path.endsWith(".png")) {
 					contentType = "image/png";
 				} else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
 					contentType = "image/jpeg";
 				}

 				return new Response(data, {
 					headers: {
 						"Content-Type": contentType,
 					},
 				});
 			} catch (error) {
 				return null;
 			}
 		},
 	}),
 );

 app.get("/", (c) => {
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
 						<link rel="stylesheet" href="src/index.css" />
 						<script type="module" src="/wasm_exec.js"></script>
 					</head>
 					<body>
 						<div id="root"></div>
 						{import.meta.env.PROD ? "static/client.js" : (
 							<script type="module" src="/src/main.tsx"></script>
 						)}
 					</body>
 				</html>,
 			),
 		].join("\n"),
 	);
 });

 // const handler = (() => {
 // 	if (import.meta.env.PROD) {
 // 		return handle(app);
 // 	}

 // 	return app;
 // })();
 //

 const handler = handle(app);

 export default handler
 export const GET = handler;
 export const POST = handler;
 export const PATCH = handler;
 export const PUT = handler;
 export const OPTIONS = handler;

 


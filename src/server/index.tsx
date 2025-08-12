import { Hono } from "hono";
import { trimTrailingSlash } from "hono/trailing-slash";
import { renderToString } from "react-dom/server";
import { examples } from "@/examples/code";
import defaultExample from "@/examples/code/default.tf?raw";
import { api } from "@/server/routes/api";
import { getShareData, type ShareData } from "./blob";
import { notFound } from "./routes/404";
import { BaseHeader, getAssetPath, HmrScript } from "./utils";

// This must be exported for the dev server to work
export const app = new Hono();

app.use("*", async (ctx, next) => {
	const url = new URL(ctx.req.url);
	if (url.hostname === "coder.app" || url.hostname === "www.coder.app") {
		return ctx.redirect("https://coder.com");
	}

	await next();
});
app.route("/api", api);

app.use(trimTrailingSlash());

app.get("/", (c) => c.redirect("/parameters"));

// Serves the main web application. This must come after the API route.
app.get("/parameters/:shareId?/:example?", async (c, next) => {
	const getCodeAndUsers = async (): Promise<ShareData | null> => {
		const { shareId, example } = c.req.param();

		if (shareId && shareId !== "example") {
			const shareData = await getShareData(shareId);
			return shareData;
		}

		if (example) {
			const code = examples[example];
			return code ? { code } : null;
		}

		return { code: defaultExample };
	};

	const codeAndUsers = await getCodeAndUsers();
	if (!codeAndUsers) {
		return notFound(c, next);
	}

	return c.html(
		[
			"<!doctype html>",
			renderToString(
				<html lang="en">
					<head>
						<title>Parameters Playground</title>
						<BaseHeader />
						<HmrScript url={new URL(c.req.url)} />
						<script type="module" src={getAssetPath("/wasm_exec.js")}></script>
					</head>
					<body>
						<div id="root"></div>
						<script type="module">{`window.CODE = ${JSON.stringify(codeAndUsers.code)}`}</script>
						{codeAndUsers.users ? (
							<script type="module">{`window.USERS = ${JSON.stringify(codeAndUsers.users)}`}</script>
						) : null}
						<script
							type="module"
							src={getAssetPath("/src/client/index.tsx", "client.js")}
						></script>
					</body>
				</html>,
			),
		].join("\n"),
	);
});

app.get("*", notFound);

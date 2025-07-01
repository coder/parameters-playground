import { examples } from "@/examples/code";
import { api } from "@/server/routes/api";
import { Hono } from "hono";
import { renderToString } from "react-dom/server";
import { getShareData } from "./blob";
import { trimTrailingSlash } from "hono/trailing-slash";
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
app.get("/parameters/:shareId?/:example?", async (c) => {
	const getExampleCode = async (): Promise<string | null> => {
		const { shareId, example } = c.req.param();

		if (shareId && shareId !== "example") {
			const shareData = await getShareData(shareId);
			return shareData?.code ?? null;
		}

		if (!example) {
			return null;
		}

		return examples[example] ?? null;
	};

	const exampleCode = await getExampleCode();

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
						{exampleCode ? (
							<script type="module">{`window.CODE = ${JSON.stringify(exampleCode)}`}</script>
						) : null}
						<script type="module" src={getAssetPath("/src/client/index.tsx")}></script>
					</body>
				</html>,
			),
		].join("\n"),
	);
});

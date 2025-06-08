import { vValidator } from "@hono/valibot-validator";
import { head, put } from "@vercel/blob";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import * as v from "valibot";

export const BLOG_PATH = "parameters/share";

const parameters = new Hono()
	.get("/:id", async (c) => {
		const { id } = c.req.param();
		try {
			const { url } = await head(`${BLOG_PATH}/${id}.txt`);
			const res = await fetch(url);
			const code = new TextDecoder().decode(await res.arrayBuffer());

			return c.json({ code });
		} catch (e) {
			console.error(`Failed to load playground with id ${id}: ${e}`);
			return c.json({ code: "" }, 404);
		}
	})
	.post(
		"/",
		vValidator(
			"json",
			v.object({
				code: v.string(),
			}),
		),
		async (c) => {
			const { code } = c.req.valid("json");
			const bytes = new TextEncoder().encode(code);

			if (bytes.length < 1024 * 10) {
				// throw new Error
			}

			const id = nanoid();
			await put(`${BLOG_PATH}/${id}.txt`, code, {
				addRandomSuffix: false,
				access: "public",
			});

			return c.json({ id });
		},
	);

export const api = new Hono().route("/parameters", parameters);

export type ApiType = typeof api;

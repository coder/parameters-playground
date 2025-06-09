import { vValidator } from "@hono/valibot-validator";
import { head, put } from "@vercel/blob";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import * as v from "valibot";

export const BLOG_PATH = "parameters/share";

export const ShareDataSchema = v.object({ code: v.string() });
type ShareData = v.InferInput<typeof ShareDataSchema>;

const putShareData = async (data: ShareData): Promise<string> => {
	const id = nanoid();
	await put(`${BLOG_PATH}/${id}.json`, JSON.stringify(data), {
		addRandomSuffix: false,
		access: "public",
	});

	return id;
};

const parameters = new Hono()
	.get("/:id", async (c) => {
		const { id } = c.req.param();
		try {
			const { url } = await head(`${BLOG_PATH}/${id}.json`);
			const res = await fetch(url);
			const data = JSON.parse(
				new TextDecoder().decode(await res.arrayBuffer()),
			);

			const parsedData = v.safeParse(ShareDataSchema, data);
			if (!parsedData.success) {
				return c.json({ code: "// Something went wrong" }, 500);
			}

			return c.json(parsedData.output);
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
			const data = c.req.valid("json");
			const bytes = new TextEncoder().encode(JSON.stringify(data));

			// Check if the data is larger than 10kb
			if (bytes.length > 1024 * 10) {
				console.error("Data larger than 10kb");
				return c.json({ id: "" }, 500);
			}

			const id = await putShareData(data);
			return c.json({ id });
		},
	);

export const api = new Hono().route("/parameters", parameters);

export type ApiType = typeof api;

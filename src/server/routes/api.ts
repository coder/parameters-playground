import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { putShareData } from "@/server/blob";

const parameters = new Hono().post(
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

		// Check if the data is larger than 1mb
		if (bytes.length > 1024 * 1000) {
			console.error("Data larger than 10kb");
			return c.json({ id: "" }, 500);
		}

		const id = await putShareData(data);
		return c.json({ id });
	},
);

export const api = new Hono().route("/parameters", parameters);

export type ApiType = typeof api;

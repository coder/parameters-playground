import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { putShareData, ShareDataSchema } from "@/server/blob";

const MAX_CODE_SIZE = 1024 * 1000; // 1mb

const parameters = new Hono().post(
	"/",
	vValidator("json", ShareDataSchema),
	async (c) => {
		const data = c.req.valid("json");
		const bytes = new TextEncoder().encode(JSON.stringify(data));

		if (bytes.length > MAX_CODE_SIZE) {
			console.error("Data larger than 1mb");
			return c.json({ id: "" }, 400);
		}

		const id = await putShareData(data);
		return c.json({ id });
	},
);

export const api = new Hono().route("/parameters", parameters);

export type ApiType = typeof api;

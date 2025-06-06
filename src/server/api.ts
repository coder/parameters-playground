import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import { nanoid } from "nanoid";
import { Hono } from "hono";

const sharedCode: Map<string, Uint8Array> = new Map();

const parameters = new Hono()
	.get("/:id", (c) => {
		const { id } = c.req.param();
		const bytes = sharedCode.get(id);

		if (!bytes) {
			throw new Error("Foo");
		}

		const code = new TextDecoder().decode(bytes);

		return c.json({ code });
	})
	.post(
		"/",
		vValidator(
			"json",
			v.object({
				code: v.string(),
			}),
		),
		(c) => {
			const { code } = c.req.valid("json");
			const bytes = new TextEncoder().encode(code);

			if (bytes.length < 1024 * 10) {
				// throw new Error
			}

			const id = nanoid();
			sharedCode.set(id, bytes);

			return c.json({ id });
		},
	);

export const api = new Hono().route("/parameters", parameters);

export type ApiType = typeof api;

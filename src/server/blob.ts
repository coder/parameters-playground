import { head, put } from "@vercel/blob";
import { nanoid } from "nanoid";
import * as v from "valibot";

export const BLOG_PATH = "parameters/share";

export const ShareDataSchema = v.object({ code: v.string() });
type ShareData = v.InferInput<typeof ShareDataSchema>;

export const putShareData = async (data: ShareData): Promise<string> => {
	const id = nanoid(10);
	await put(`${BLOG_PATH}/${id}.json`, JSON.stringify(data), {
		addRandomSuffix: false,
		access: "public",
	});

	return id;
};

export const getShareData = async (id: string): Promise<{ code: string; } | null> => {
	try {
		const { url } = await head(`${BLOG_PATH}/${id}.json`);
		const res = await fetch(url);
		const data = JSON.parse(new TextDecoder().decode(await res.arrayBuffer()));

		const parsedData = v.safeParse(ShareDataSchema, data);
		if (!parsedData.success) {
			console.error("Unable to parse share data", parsedData.issues);
			return null;
		}

		return parsedData.output;
	} catch (e) {
		console.error(`Failed to load playground with id ${id}: ${e}`);
		return null;
	}
};

import { checkerModule } from "@/client/snippets";
import type { PreviewOutput, WorkspaceOwner } from "@/gen/types";
import { baseMockUser, type User } from "@/user";

export type WasmLoadState = "loaded" | "loading" | "error";

type GoPreviewDef = (
	/**
	 * A virtual filetree
	 */
	files: Record<string, string>,
	params: Record<string, string>,
	owner: WorkspaceOwner,
) => Promise<string>;

// Extend the Window object to include the Go related code that is added from
// wasm_exec.js and our loaded Go code.
declare global {
	interface Window {
		// Loaded from wasm
		go_preview?: GoPreviewDef;
		Go: { new (): Go };
		CODE?: string;
		USERS?: User[];
	}
}

declare class Go {
	argv: string[];
	env: { [envKey: string]: string };
	exit: (code: number) => void;
	importObject: WebAssembly.Imports;
	exited: boolean;
	mem: DataView;
	run(instance: WebAssembly.Instance): Promise<void>;
}

export const initWasm = async (): Promise<WasmLoadState> => {
	try {
		const goWasm = new window.Go();
		const wasmUrl = import.meta.env.PROD
			? "/assets/build/preview.wasm.gz"
			: "/build/preview.wasm.gz";

		const resp = await fetch(wasmUrl);
		if (!resp.ok) {
			throw new Error(`Failed to fetch wasm: ${resp.status}`);
		}

		let wasmBytes = await resp.arrayBuffer();

		// The .wasm.gz file may be transparently decompressed by the
		// server/CDN (via content-encoding: gzip), or served as raw gzip
		// bytes. Detect which case we're in by checking for the gzip magic
		// number (0x1f 0x8b) and decompress if needed.
		const header = new Uint8Array(wasmBytes, 0, 2);
		if (header[0] === 0x1f && header[1] === 0x8b) {
			const ds = new DecompressionStream("gzip");
			const blob = new Blob([wasmBytes]);
			const decompressed = blob.stream().pipeThrough(ds);
			wasmBytes = await new Response(decompressed).arrayBuffer();
		}

		const result = await WebAssembly.instantiate(
			wasmBytes,
			goWasm.importObject,
		);

		goWasm.run(result.instance);

		return "loaded";
	} catch (e) {
		console.error(e);
		return "error";
	}
};

export const getDynamicParametersOutput = async (
	code: string,
	parameterValues: Record<string, string>,
	user?: User,
): Promise<PreviewOutput | null> => {
	if (!window.go_preview) {
		return null;
	}

	const owner: WorkspaceOwner = {
		...(user ?? baseMockUser),
		ssh_public_key: "",
		login_type: "",
	};

	const rawOutput = await window.go_preview(
		{
			"main.tf": code,
			// Hard coded module for demo
			"checker/main.tf": checkerModule,
		},
		parameterValues,
		owner,
	);

	if (rawOutput === undefined || rawOutput === '') {
		console.error("go_preview returned empty output");
		return {
			output: null,
			diags: [
				{
					severity: "error",
					summary: "Failed to parse Terraform configuration",
					detail: "The Terraform configuration could not be parsed. Please check for syntax errors.",
					extra: { code: "", Wrapped: null },
				},
			],
		};
	}

	const output = JSON.parse(rawOutput) as PreviewOutput;

	return output;
};

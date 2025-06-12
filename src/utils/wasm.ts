import type { WorkspaceOwner } from "@/gen/types";

export type WasmLoadState = "loaded" | "loading" | "error";

type GoPreviewDef = (
	/**
	 * A virtual filetree
	 */
	files: Record<string, string>,
	owner: WorkspaceOwner,
	params: Record<string, string>,
) => Promise<string>;

// Extend the Window object to include the Go related code that is added from
// wasm_exec.js and our loaded Go code.
declare global {
	interface Window {
		// Loaded from wasm
		go_preview?: GoPreviewDef;
		Go: { new (): Go };
		CODE?: string;
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
		const result = await WebAssembly.instantiateStreaming(
			fetch(
				import.meta.env.PROD
					? "/assets/build/preview.wasm"
					: "/build/preview.wasm",
			),
			goWasm.importObject,
		);

		goWasm.run(result.instance);

		return "loaded";
	} catch (e) {
		console.error(e);
		return "error";
	}
};

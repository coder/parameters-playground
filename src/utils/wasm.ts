import { checkerModule } from "@/client/snippets";
import type { PreviewOutput, WorkspaceOwner } from "@/gen/types";
import { baseMockUser } from "@/owner";

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

export const getDynamicParametersOutput = async (
	code: string,
	parameterValues: Record<string, string>,
	owner?: WorkspaceOwner,
): Promise<PreviewOutput | null> => {
	if (!window.go_preview) {
		return null;
	}

	const rawOutput = await window.go_preview(
		{
			"main.tf": code,
			// Hard coded module for demo
			"checker/main.tf": checkerModule,
		},
		parameterValues,
		owner ?? baseMockUser,
	);

	if (rawOutput === undefined) {
		console.error("Something went wrong");
		return null;
	}

	const output = JSON.parse(rawOutput) as PreviewOutput;

	return output;
	// if (e instanceof Error) {
	// 	const diagnostic: InternalDiagnostic = {
	// 		severity: "error",
	// 		summary: e.name,
	// 		detail: e.message,
	// 		kind: "internal",
	// 	};
	// 	$setError([diagnostic]);
	// } else {
	// 	const diagnostic: InternalDiagnostic = {
	// 		severity: "error",
	// 		summary: "Error",
	// 		detail: "Something went wrong",
	// 		kind: "internal",
	// 	};

	// 	$setError([diagnostic]);
	// }
};

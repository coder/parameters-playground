import { ResizableHandle, ResizablePanelGroup } from "@/components/Resizable";
import { Editor } from "./Editor";
import { Logo } from "./components/Logo";
import { Preview } from "./Preview";
import { useStore } from "@/store";
import { useEffect } from "react";

// Glue code required to be able to run wasm compiled Go code.
import "@/utils/wasm_exec.js";

type GoPreviewDef = (v: unknown) => Promise<string>;

// Extend the Window object to include the Go related code that is added from
// wasm_exec.js and our loaded Go code.
declare global {
	interface Window {
		// Loaded from wasm
		go_preview?: GoPreviewDef;
		Go: { new (): Go };
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

export const App = () => {
	const $wasmState = useStore((state) => state.wasmState);
	const $setWasmState = useStore((state) => state.setWasmState);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const initWasm = async () => {
			try {
				const goWasm = new window.Go();
				const result = await WebAssembly.instantiateStreaming(
					fetch("build/preview.wasm"),
					goWasm.importObject,
				);

				goWasm.run(result.instance);
				$setWasmState("loaded");
			} catch (e) {
				$setWasmState("error");
				console.error(e);
			}
		};

		if ($wasmState !== "loaded") {
			initWasm();
		}
	}, []);

	return (
		<main className="flex h-dvh w-screen flex-col items-center bg-surface-primary">
			{/* NAV BAR */}
			<nav className="flex h-16 w-full justify-between border-b border-b-surface-quaternary px-6 py-2">
				<div className="flex items-center gap-2">
					<Logo className="text-content-primary" height={24} />
					<p className="font-semibold text-content-primary text-xl">
						Playground
					</p>
				</div>

				<div className="flex items-center gap-3">
					<a
						href="https://coder.com"
						target="_blank"
						rel="noreferrer"
						className="font-light text-content-secondary text-sm hover:text-content-primary"
					>
						Coder
					</a>
					<a
						href="https://coder.com"
						target="_blank"
						rel="noreferrer"
						className="font-light text-content-secondary text-sm hover:text-content-primary"
					>
						Docs
					</a>
					<a
						href="https://coder.com"
						target="_blank"
						rel="noreferrer"
						className="font-light text-content-secondary text-sm hover:text-content-primary"
					>
						Support
					</a>
				</div>
			</nav>

			<ResizablePanelGroup
				aria-hidden={!$wasmState}
				direction={"horizontal"}
			>
				{/* EDITOR */}
				<Editor />

				<ResizableHandle className="bg-surface-quaternary" />

				{/* PREVIEW */}
				<Preview />
			</ResizablePanelGroup>
		</main>
	);
};

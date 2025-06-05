import { Editor } from "@/Editor";
import { Preview } from "@/Preview";
import { Logo } from "@/components/Logo";
import { ResizableHandle, ResizablePanelGroup } from "@/components/Resizable";
import { useStore } from "@/store";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "@/components/DropdownMenu";
import { type FC, useEffect, useMemo } from "react";

import { useTheme } from "@/contexts/theme";
import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { Button } from "./components/Button";

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
					fetch(
						import.meta.env.PROD
							? "/assets/build/preview.wasm"
							: "build/preview.wasm",
					),
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
					<ThemeSelector />
				</div>
			</nav>

			<ResizablePanelGroup aria-hidden={!$wasmState} direction={"horizontal"}>
				{/* EDITOR */}
				<Editor />

				<ResizableHandle className="bg-surface-quaternary" />

				{/* PREVIEW */}
				<Preview />
			</ResizablePanelGroup>
		</main>
	);
};

const ThemeSelector: FC = () => {
	const { theme, setTheme } = useTheme();

	const Icon = useMemo(() => {
		if (theme === "system") {
			return SunMoonIcon;
		}

		if (theme === "dark") {
			return MoonIcon;
		}

		return SunIcon;
	}, [theme]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={true}>
				<Button variant="subtle" size="icon-lg">
					<Icon height={24} width={24} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setTheme("dark")}>
						<MoonIcon width={24} height={24} /> Dark
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("light")}>
						<SunIcon width={24} height={24} /> Light
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("system")}>
						<SunMoonIcon width={24} height={24} /> System
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
};

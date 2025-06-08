import { Editor } from "@/client/Editor";
import { Preview } from "@/client/Preview";
import { Logo } from "@/client/components/Logo";
import {
	ResizableHandle,
	ResizablePanelGroup,
} from "@/client/components/Resizable";
import { useStore } from "@/client/store";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "@/client/components/DropdownMenu";
import {
	type FC,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useTheme } from "@/client/contexts/theme";
import { MoonIcon, ShareIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { Button } from "@/client/components/Button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/client/components/Tooltip";
import { rpc } from "@/utils/rpc";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";

type GoPreviewDef = (v: unknown) => Promise<string>;

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

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { id } = params;
	if (!id) {
		return;
	}

	try {
		const res = await rpc.parameters[":id"].$get({ param: { id } });
		if (res.ok) {
			const { code } = await res.json();
			return code;
		}
	} catch (e) {
		console.error(`Error loading playground: ${e}`);
		return;
	}
};

export const App = () => {
	const $wasmState = useStore((state) => state.wasmState);
	const $setWasmState = useStore((state) => state.setWasmState);
	const $setCode = useStore((store) => store.setCode);
	const code = useLoaderData<typeof loader>();

	useEffect(() => {
		if (!code) {
			return;
		}

		$setCode(code);
	}, [code, $setCode]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const initWasm = async () => {
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
				<div className="flex items-center justify-center gap-4">
					<div className="flex items-center gap-2">
						<Logo className="text-content-primary" height={24} />
						<p className="font-semibold text-content-primary text-xl">
							Playground
						</p>
					</div>

					<ShareButton />
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

const ShareButton: FC = () => {
	const $code = useStore((state) => state.code);
	const [isCopied, setIsCopied] = useState(() => false);
	const timeoutId = useRef<ReturnType<typeof setTimeout>>(undefined);

	const onShare = useCallback(async () => {
		try {
			const { id } = await rpc.parameters
				.$post({ json: { code: $code } })
				.then((res) => res.json());

			const { protocol, host } = window.location;
			window.navigator.clipboard.writeText(
				`${protocol}//${host}/parameters/${id}`,
			);

			setIsCopied(() => true);
		} catch (e) {
			console.error(e);
		}
	}, [$code]);

	useEffect(() => {
		if (!isCopied) {
			return;
		}

		clearTimeout(timeoutId.current);
		const id = setTimeout(() => {
			setIsCopied(() => false);
		}, 1000);
		timeoutId.current = id;

		return () => clearTimeout(timeoutId.current);
	}, [isCopied]);

	return (
		<Tooltip open={isCopied}>
			<TooltipTrigger asChild={true}>
				<Button size="sm" onClick={onShare}>
					<ShareIcon />
					Share
				</Button>
			</TooltipTrigger>
			<TooltipContent>Copied to clipboard</TooltipContent>
		</Tooltip>
	);
};

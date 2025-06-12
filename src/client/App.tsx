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
import { initWasm, type WasmLoadState } from "@/utils/wasm";

/**
 * Load the shared code if present.
 */
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
	const [wasmLoadState, setWasmLoadingState] = useState<WasmLoadState>(() => {
		if (window.go_preview) {
			return "loaded";
		}
		return "loading";
	});
	const $setCode = useStore((store) => store.setCode);
	const code = useLoaderData<typeof loader>();

	useEffect(() => {
		if (!code) {
			return;
		}

		$setCode(code);
	}, [code, $setCode]);

	useEffect(() => {
		if (!window.go_preview) {
			initWasm().then((loadState) => {
				setWasmLoadingState(loadState);
			});
		} else {
			// We assume that if `window.go_preview` has already created then the wasm
			// has already been initiated.
			setWasmLoadingState("loaded");
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

			<ResizablePanelGroup direction={"horizontal"}>
				{/* EDITOR */}
				<Editor />

				<ResizableHandle className="bg-surface-quaternary" />

				{/* PREVIEW */}
				<Preview wasmLoadState={wasmLoadState} />
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
			const shareUrl = `${protocol}//${host}/parameters/${id}`;
			window.navigator.clipboard.writeText(shareUrl);
			window.history.pushState({}, "", shareUrl);

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

import { Editor } from "@/client/Editor";
import { Preview } from "@/client/Preview";
import { Button } from "@/client/components/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "@/client/components/DropdownMenu";
import { Logo } from "@/client/components/Logo";
import {
	ResizableHandle,
	ResizablePanelGroup,
} from "@/client/components/Resizable";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/client/components/Tooltip";
import { useTheme } from "@/client/contexts/theme";
import { defaultCode } from "@/client/snippets";
import { examples } from "@/examples";
import type {
	ParameterWithSource,
	PreviewOutput,
	WorkspaceOwner,
} from "@/gen/types";
import { mockUsers } from "@/owner";
import { rpc } from "@/utils/rpc";
import {
	type WasmLoadState,
	getDynamicParametersOutput,
	initWasm,
} from "@/utils/wasm";
import isEqual from "lodash/isEqual";
import {
	ExternalLinkIcon,
	MoonIcon,
	ShareIcon,
	SunIcon,
	SunMoonIcon,
} from "lucide-react";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "./hooks/debounce";
import { useSearchParams } from "react-router";

export const App = () => {
	const [wasmLoadState, setWasmLoadingState] = useState<WasmLoadState>(() => {
		if (window.go_preview) {
			return "loaded";
		}
		return "loading";
	});
	const [code, setCode] = useState(window.CODE ?? defaultCode);
	const [debouncedCode, isDebouncing] = useDebouncedValue(code, 1000);
	const [parameterValues, setParameterValues] = useState<
		Record<string, string>
	>({});
	const [output, setOutput] = useState<PreviewOutput | null>(null);
	const [parameters, setParameters] = useState<ParameterWithSource[]>([]);
	const [owner, setOwner] = useState<WorkspaceOwner>(mockUsers.admin);

	const onDownloadOutput = () => {
		const blob = new Blob([JSON.stringify(output, null, 2)], {
			type: "application/json",
		});

		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = "output.json";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Give the click event enough time to fire and then revoke the URL.
		// This method of doing it doesn't seem great but I'm not sure if there is a
		// better way.
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 100);
	};

	const onReset = () => {
		setParameterValues({});
		setParameters((curr) =>
			curr.map((p) => {
				p.uuid = window.crypto.randomUUID();
				return p;
			}),
		);
	};

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

	useEffect(() => {
		setParameters((curr) => {
			const newParameters = output?.output?.parameters ?? [];

			return newParameters.map((p) => {
				// Check if the parameter is already in the array and if it is then keep it.
				// This allows us to optimize React by not re-rendering parameters that haven't changed.
				//
				// We unset value because the value may not be in sync with what we have locally,
				// and we unset uuid because it's given a new random UUID every time.
				const existing = curr.find((currP) => {
					const currentParameterOmitValue = {
						...currP,
						value: undefined,
						uuid: undefined,
					};
					const existingParameterOmitValue = {
						...p,
						value: undefined,
						uuid: undefined,
					};

					return isEqual(currentParameterOmitValue, existingParameterOmitValue);
				});

				if (existing) {
					existing.value = p.value;
					return existing;
				}
				return p;
			});
		});
	}, [output]);

	useEffect(() => {
		if (wasmLoadState !== "loaded") {
			return;
		}

		getDynamicParametersOutput(debouncedCode, parameterValues, owner)
			.catch((e) => {
				console.error(e);
				setWasmLoadingState("error");

				return null;
			})
			.then((output) => {
				setOutput(output);
			});
	}, [debouncedCode, parameterValues, wasmLoadState, owner]);

	return (
		<main className="flex h-dvh w-screen flex-col items-center bg-surface-primary">
			{/* NAV BAR */}
			<nav className="flex h-16 w-full justify-between border-b border-b-surface-quaternary px-6 py-2">
				<div className="flex items-center justify-center gap-6">
					<div className="flex items-center gap-2">
						<Logo className="text-content-primary" height={24} />
						<p className="font-semibold text-content-primary text-2xl">
							Playground
						</p>
					</div>

					<ShareButton code={code} />
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
						href="https://coder.com/docs/admin/templates/extending-templates/parameters"
						target="_blank"
						rel="noreferrer"
						className="font-light text-content-secondary text-sm hover:text-content-primary"
					>
						Docs
					</a>
					<ExampleSelector />
					<ThemeSelector />
				</div>
			</nav>

			<ResizablePanelGroup direction={"horizontal"}>
				{/* EDITOR */}
				<Editor code={code} setCode={setCode} parameters={parameters} />

				<ResizableHandle className="bg-surface-quaternary" />

				{/* PREVIEW */}
				<Preview
					wasmLoadState={wasmLoadState}
					isDebouncing={isDebouncing}
					onDownloadOutput={onDownloadOutput}
					output={output}
					parameterValues={parameterValues}
					setParameterValues={setParameterValues}
					parameters={parameters}
					onReset={onReset}
					setOwner={(owner) => {
						onReset();
						setOwner(owner);
					}}
				/>
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

type ShareButtonProps = {
	code: string;
};
const ShareButton: FC<ShareButtonProps> = ({ code }) => {
	const [isCopied, setIsCopied] = useState(() => false);
	const timeoutId = useRef<ReturnType<typeof setTimeout>>(undefined);

	const onShare = async () => {
		try {
			const { id } = await rpc.parameters
				.$post({ json: { code } })
				.then((res) => res.json());

			const { protocol, host } = window.location;
			const shareUrl = `${protocol}//${host}/parameters/${id}`;
			window.navigator.clipboard.writeText(shareUrl);
			window.history.pushState({}, "", shareUrl);

			setIsCopied(() => true);
		} catch (e) {
			console.error(e);
		}
	};

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

const ExampleSelector: FC = () => {
	const [searchParams] = useSearchParams();

	return (
		<DropdownMenu defaultOpen={searchParams.has("examples")}>
			<DropdownMenuTrigger className="font-light text-content-secondary text-sm hover:text-content-primary">
				Examples
			</DropdownMenuTrigger>

			<DropdownMenuPortal>
				<DropdownMenuContent>
					{Object.entries(examples).map(([slug, title]) => {
						const href = `${window.location.origin}/parameters/example/${slug}`;
						return (
							<DropdownMenuItem key={slug} asChild={true}>
								<a href={href} target="_blank" rel="noreferrer">
									<ExternalLinkIcon />
									{title}
								</a>
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
};

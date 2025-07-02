import { Button } from "@/client/components/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "@/client/components/DropdownMenu";
import { ResizablePanel } from "@/client/components/Resizable";
import * as Tabs from "@/client/components/Tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/client/components/Tooltip";
import { useTheme } from "@/client/contexts/theme";
import { snippets } from "@/client/snippets";
import { cn } from "@/utils/cn";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import {
	CheckIcon,
	ChevronDownIcon,
	CopyIcon,
	FileJsonIcon,
	SettingsIcon,
	ZapIcon,
} from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import { useEditor } from "@/client/contexts/editor";

type EditorProps = {
	code: string;
	setCode: React.Dispatch<React.SetStateAction<string>>;
};

export const Editor: FC<EditorProps> = ({ code, setCode }) => {
	const { appliedTheme } = useTheme();
	const editorRef = useEditor();

	const [codeCopied, setCodeCopied] = useState(() => false);
	const copyTimeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	const [tab, setTab] = useState(() => "code");

	const onCopy = () => {
		navigator.clipboard.writeText(code);
		setCodeCopied(() => true);
	};

	useEffect(() => {
		if (!codeCopied) {
			return;
		}

		clearTimeout(copyTimeoutId.current);

		copyTimeoutId.current = setTimeout(() => {
			setCodeCopied(() => false);
		}, 1000);

		return () => clearTimeout(copyTimeoutId.current);
	}, [codeCopied]);

	return (
		<Tabs.Root
			asChild={true}
			value={tab}
			onValueChange={(tab) => setTab(() => tab)}
		>
			<ResizablePanel className="relative flex flex-col items-start">
				{/* EDITOR TOP BAR */}
				<Tabs.List asChild={true}>
					<div className="flex h-12 w-full items-center justify-between border-b border-b-surface-quaternary pr-3">
						<div className="flex">
							<Tabs.Trigger icon={FileJsonIcon} label="Code" value="code" />
							<Tooltip>
								<TooltipTrigger asChild={true} className="hidden">
									<Tabs.Trigger
										icon={SettingsIcon}
										label="Variables"
										value="variables"
										disabled={true}
									/>
								</TooltipTrigger>
								<TooltipContent>Coming soon</TooltipContent>
							</Tooltip>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger className="flex w-fit min-w-[140px] cursor-pointer items-center justify-between rounded-md border bg-surface-primary px-2 py-1.5 text-content-secondary transition-colors hover:text-content-primary data-[state=open]:text-content-primary">
								<div className="flex items-center justify-center gap-2">
									<ZapIcon width={18} height={18} />
									<p className="text-xs">Snippets</p>
								</div>
								<ChevronDownIcon width={18} height={18} />
							</DropdownMenuTrigger>

							<DropdownMenuPortal>
								<DropdownMenuContent align="start">
									{snippets.map(({ label, icon: Icon, snippet }, index) => (
										<DropdownMenuItem
											key={index}
											onClick={() =>
												setCode(`${code.trimEnd()}\n\n${snippet()}\n`)
											}
										>
											<Icon size={24} />
											{label}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenuPortal>
						</DropdownMenu>
					</div>
				</Tabs.List>

				{/* CODE EDITOR */}
				<div
					className={cn(
						"pointer-events-none absolute mt-12 flex w-full justify-end p-3",
						tab !== "code" && "hidden",
					)}
				>
					<Button
						className="pointer-events-auto z-10 hidden"
						variant="subtle"
						size="sm"
						onClick={onCopy}
					>
						{codeCopied ? <CheckIcon /> : <CopyIcon />} Copy
					</Button>
				</div>

				<Tabs.Content value="code" asChild={true}>
					<div className="h-full w-full bg-surface-secondary font-mono">
						<MonacoEditor
							value={code}
							onMount={(editor) => {
								editorRef.current = editor;
							}}
							onChange={(code) => {
								if (code !== undefined) {
									setCode(code);
								}
							}}
							theme={appliedTheme === "dark" ? "vs-dark" : "vs-light"}
							defaultLanguage="hcl"
							loading=""
							options={{
								minimap: {
									enabled: false,
								},
								automaticLayout: true,
								fontFamily: "DM Mono",
								fontSize: 14,
								wordWrap: "on",
								padding: {
									top: 16,
									bottom: 16,
								},
							}}
						/>
					</div>
				</Tabs.Content>
			</ResizablePanel>
		</Tabs.Root>
	);
};

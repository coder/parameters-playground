import { Button } from "@/components/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "@/components/DropdownMenu";
import { ResizablePanel } from "@/components/Resizable";
import * as Tabs from "@/components/Tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/Tooltip";
import { useStore } from "@/store";
import {
	BookIcon,
	CheckIcon,
	ChevronDownIcon,
	CopyIcon,
	FileJsonIcon,
	RadioIcon,
	SettingsIcon,
	SquareMousePointerIcon,
	TextCursorInputIcon,
	ToggleLeftIcon,
} from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import CodeEditor from "react-simple-code-editor";

// The following imports can't be re-ordered otherwise things break
// @ts-expect-error TODO: create types for this
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-hcl";
// @ts-expect-error TODO: create types for this
import "prismjs/themes/prism.css";
import { cn } from "@/utils/cn";

// Adds line numbers to the highlight.
const hightlightWithLineNumbers = (input: string, language: unknown) =>
	highlight(input, language)
		.split("\n")
		.map(
			(line: string, i: number) =>
				`<span class='editorLineNumber'>${i + 1}</span>${line}`,
		)
		.join("\n");

export const Editor: FC = () => {
	const $code = useStore((state) => state.code);
	const $setCode = useStore((state) => state.setCode);

	const [codeCopied, setCodeCopied] = useState(() => false);
	const copyTimeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	const [tab, setTab] = useState(() => "code");

	const onCopy = () => {
		navigator.clipboard.writeText($code);
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
								<TooltipTrigger asChild={true}>
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
									<BookIcon width={18} height={18} />
									<p className="text-xs">Examples</p>
								</div>
								<ChevronDownIcon width={18} height={18} />
							</DropdownMenuTrigger>

							<DropdownMenuPortal>
								<DropdownMenuContent align="start">
									<DropdownMenuItem>
										<TextCursorInputIcon width={24} height={24} />
										Text input
									</DropdownMenuItem>
									<DropdownMenuItem>
										<SquareMousePointerIcon width={24} height={24} />
										Multi-select
									</DropdownMenuItem>
									<DropdownMenuItem>
										<RadioIcon width={24} height={24} />
										Radio
									</DropdownMenuItem>
									<DropdownMenuItem>
										<ToggleLeftIcon width={24} height={24} /> Switches
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenuPortal>
						</DropdownMenu>
					</div>
				</Tabs.List>

				{/* CODE EDITOR */}
				<div
					className={cn(
						"absolute mt-12 flex h-full w-full justify-end p-3",
						tab !== "code" && "hidden",
					)}
				>
					<Button className="z-10" variant="subtle" size="sm" onClick={onCopy}>
						{codeCopied ? <CheckIcon /> : <CopyIcon />} Copy
					</Button>
				</div>

				<Tabs.Content value="code" asChild={true}>
					<div className="h-full w-full overflow-y-scroll bg-surface-secondary font-mono">
						<CodeEditor
							value={$code}
							onValueChange={(code) => $setCode(code)}
							highlight={(code) =>
								hightlightWithLineNumbers(code, languages.hcl)
							}
							textareaId="codeArea"
							className="editor pt-3"
						/>
					</div>
				</Tabs.Content>
			</ResizablePanel>
		</Tabs.Root>
	);
};

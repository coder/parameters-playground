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
import { useStore } from "@/client/store";
import {
	CheckIcon,
	ChevronDownIcon,
	CopyIcon,
	FileJsonIcon,
	RadioIcon,
	SettingsIcon,
	SquareMousePointerIcon,
	TextCursorInputIcon,
	ToggleLeftIcon,
	ZapIcon,
} from "lucide-react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import CodeEditor from "react-simple-code-editor";

// The following imports can't be re-ordered otherwise things break
// @ts-expect-error TODO: create types for this
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-hcl";
import "prismjs/themes/prism.css";
import { cn } from "@/utils/cn";
import type { ParameterFormType } from "@/gen/types";
import { multiSelect, radio, switchInput, textInput } from "@/client/snippets";

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

	const onAddSnippet = useCallback(
		(formType: ParameterFormType) => {
			if (formType === "input") {
				$setCode(`${$code.trimEnd()}\n\n${textInput}\n`);
			} else if (formType === "radio") {
				$setCode(`${$code.trimEnd()}\n\n${radio}\n`);
			} else if (formType === "multi-select") {
				$setCode(`${$code.trimEnd()}\n\n${multiSelect}\n`);
			} else if (formType === "switch") {
				$setCode(`${$code.trimEnd()}\n\n${switchInput}\n`);
			}
		},
		[$code, $setCode],
	);

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
									<DropdownMenuItem onClick={() => onAddSnippet("input")}>
										<TextCursorInputIcon width={24} height={24} />
										Text input
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => onAddSnippet("multi-select")}
									>
										<SquareMousePointerIcon width={24} height={24} />
										Multi-select
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onAddSnippet("radio")}>
										<RadioIcon width={24} height={24} />
										Radio
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onAddSnippet("switch")}>
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
						"pointer-events-none absolute mt-12 flex w-full justify-end p-3",
						tab !== "code" && "hidden",
					)}
				>
					<Button
						className="pointer-events-auto z-10"
						variant="subtle"
						size="sm"
						onClick={onCopy}
					>
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

import { Button } from "@/components/Button";
import { ResizablePanel } from "@/components/Resizable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/Tooltip";
import { type FC, useEffect, useRef, useState } from "react";
import CodeEditor from "react-simple-code-editor";
import { useStore } from "@/store";
import { CheckIcon, CopyIcon, FileJsonIcon, SettingsIcon } from "lucide-react";

// The following imports can't be re-ordered otherwise things break
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-hcl";
import "prismjs/themes/prism.css";

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
		<ResizablePanel className="flex flex-col items-start">
			{/* EDITOR TOP BAR */}
			<div className="flex w-full items-center justify-between border-b border-b-surface-quaternary pr-3">
				<div className="flex">
					<button className="flex w-fit min-w-[120px] items-center gap-1 border-x bg-surface-secondary px-4 py-3 text-content-primary transition-colors hover:bg-surface-tertiary">
						<FileJsonIcon className="w-[18px] min-w-[18px]" />
						<span className="w-full text-sm">Code</span>
					</button>

					<Tooltip>
						<TooltipTrigger asChild={true}>
							<button
								disabled={true}
								className="flex w-fit min-w-[120px] cursor-not-allowed items-center gap-1 px-4 py-3 text-content-secondary"
							>
								<SettingsIcon className="w-[18px] min-w-[18px]" />
								<span className="w-full text-sm">Variables</span>
							</button>
						</TooltipTrigger>
						<TooltipContent>Coming soon</TooltipContent>
					</Tooltip>
				</div>

				<Button variant="outline" size="sm" onClick={onCopy}>
					{codeCopied ? <CheckIcon /> : <CopyIcon />} Copy
				</Button>
			</div>

			{/* CODE EDITOR */}
			<div className="h-full w-full overflow-y-scroll bg-surface-secondary font-mono">
				<CodeEditor
					value={$code}
					onValueChange={(code) => $setCode(code)}
					highlight={(code) => hightlightWithLineNumbers(code, languages.hcl)}
					textareaId="codeArea"
					className="editor pt-3"
				/>
			</div>
		</ResizablePanel>
	);
};

import { Button } from "@/components/Button";
import { ResizablePanel } from "@/components/Resizable";
import {
	type Diagnostic,
	type InternalDiagnostic,
	outputToDiagnostics,
} from "@/diagnostics";
import type { PreviewOutput } from "@/gen/types";
import { useDebouncedValue } from "@/hooks/debounce";
import { useStore } from "@/store";
import { cn } from "@/utils/cn";
import { ActivityIcon, ExternalLinkIcon, LoaderIcon } from "lucide-react";
import { type FC, useEffect, useState } from "react";

export const Preview: FC = () => {
	const $wasmState = useStore((state) => state.wasmState);
	const $code = useStore((state) => state.code);
	const $errors = useStore((state) => state.errors);
	const $setError = useStore((state) => state.setError);

	const [debouncedCode, isDebouncing] = useDebouncedValue($code, 1000);

	const [output, setOutput] = useState<PreviewOutput | null>(() => null);

	useEffect(() => {
		if (!window.go_preview) {
			return;
		}

		const getOutput = async () => {
			try {
				const rawOutput = await window.go_preview?.({
					"main.tf": debouncedCode,
				});

				if (rawOutput === undefined) {
					console.error("Something went wrong");
				} else {
					const output = JSON.parse(rawOutput) as PreviewOutput;
					setOutput(() => output);
					$setError(outputToDiagnostics(output));
				}
			} catch (e) {
				console.error(e);
				if (e instanceof Error) {
					const diagnostic: InternalDiagnostic = {
						severity: "error",
						summary: e.name,
						detail: e.message,
						kind: "internal",
					};
					$setError([diagnostic]);
				} else {
					const diagnostic: InternalDiagnostic = {
						severity: "error",
						summary: "Error",
						detail: "Something went wrong",
						kind: "internal",
					};

					$setError([diagnostic]);
				}
			}
		};

		getOutput();
	}, [debouncedCode, $setError]);

	return (
		<ResizablePanel className="relative">
			{$wasmState !== "loaded" ? (
				<div className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center backdrop-blur-sm">
					{$wasmState === "loading" ? <WasmLoading /> : <WasmError />}
				</div>
			) : null}

			<div
				aria-hidden={
					$wasmState !== "loaded" ||
					($errors.show && $errors.diagnostics.length > 0)
				}
				className={cn(
					"flex h-full w-full flex-col items-start gap-6 p-8",
					($wasmState !== "loaded" ||
						($errors.show && $errors.diagnostics.length > 0)) &&
						"pointer-events-none",
				)}
			>
				<div className="flex w-full items-center justify-between">
					<p className="font-semibold text-3xl text-content-primary">
						Parameters
					</p>
					<Button variant="destructive">Reset form</Button>
				</div>

				<div
					className={cn(
						"flex h-full w-full items-center justify-center overflow-x-clip rounded-xl border p-4",
						output && "block overflow-y-scroll",
					)}
					style={{
						opacity: isDebouncing && $wasmState === "loaded" ? 0.5 : 1,
					}}
				>
					{output ? (
						<div className="flex flex-col gap-4">
							<p className=" w-fit break-all text-content-primary">
								{JSON.stringify(output.output?.Parameters, null, 2)}
							</p>

							<p className=" w-fit break-all text-content-primary">
								{JSON.stringify(output.diags, null, 2)}
							</p>

							<p className=" w-fit break-all text-content-primary">
								{output.parser_logs}
							</p>
						</div>
					) : (
						<PreviewEmptyState />
					)}
				</div>
			</div>

			<ErrorPane />
		</ResizablePanel>
	);
};

const PreviewEmptyState = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-3">
			<div className="flex items-center justify-center rounded-[6px] bg-highlight-sky p-2">
				<ActivityIcon className="text-content-invert" width={24} height={24} />
			</div>

			<div className="flex flex-col items-center gap-2">
				<div className="flex max-w-[258px] flex-col items-center gap-1">
					<p className="text-nowrap text-center font-semibold text-2xl text-content-primary">
						Parameters Playground
					</p>
					<p className="text-center font-medium text-content-secondary text-sm">
						Create dynamic parameters here, I need to figure out a better copy.
					</p>
				</div>
				<a
					href="#todo"
					className="flex items-center gap-0.5 text-content-link text-sm"
				>
					Read the docs
					<span className="inline">
						<ExternalLinkIcon width={16} />
					</span>
				</a>
			</div>
		</div>
	);
};

const ErrorPane = () => {
	const $errors = useStore((state) => state.errors);
	const $toggleShowError = useStore((state) => state.toggleShowError);

	if ($errors.diagnostics.length === 0) {
		return null;
	}

	return (
		<>
			<div
				aria-hidden={true}
				className={cn(
					"pointer-events-none absolute top-0 left-0 h-full w-full transition-all",
					$errors.show && "bg-black/20 dark:bg-black/50",
				)}
			>
				{/* OVERLAY */}
			</div>

			<div
				className={cn(
					"absolute bottom-0 left-0 w-full",
					$errors.show && "h-auto",
				)}
			>
				<button
					className="flex h-4 min-h-4 w-full items-center justify-center rounded-t-xl bg-border-destructive"
					onClick={$toggleShowError}
				>
					<div className="h-0.5 w-2/3 max-w-32 rounded-full bg-white/40"></div>
				</button>

				<div
					aria-hidden={!$errors.show}
					className={cn(
						"flex h-full flex-col gap-6 bg-surface-secondary p-6",
						!$errors.show && "pointer-events-none h-0 p-0",
					)}
				>
					<p className="font-semibold text-content-primary text-xl">
						An error has occurred
					</p>
					<div className="flex w-full flex-col gap-3">
						{$errors.diagnostics.map((diagnostic, index) => (
							<ErrorBlock diagnostic={diagnostic} key={index} />
						))}
					</div>
				</div>
			</div>
		</>
	);
};

type ErroBlockPorps = {
	diagnostic: Diagnostic;
};
const ErrorBlock: FC<ErroBlockPorps> = ({ diagnostic }) => {
	return (
		<div className="rounded-xl bg-surface-tertiary p-3 font-mono text-content-primary text-sm leading-normal">
			<p
				className={cn(
					"text-content-destructive",
					diagnostic.severity === "warning" && "text-content-warning",
				)}
			>
				<span className="uppercase">
					<strong>{diagnostic.severity}</strong>
				</span>
				{diagnostic.kind === "parameter"
					? ` (${diagnostic.parameterName})`
					: null}
				: {diagnostic.summary}
			</p>
			<p>{diagnostic.detail}</p>
		</div>
	);
};

const WasmLoading: FC = () => {
	return (
		<div className="flex w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border border-[#38BDF8] bg-surface-tertiary p-4">
			<LoaderIcon className="animate-spin text-content-primary" />
			<div className="text-center">
				<p className="font-semibold text-content-primary text-xl">
					Loading assets
				</p>
				<p className="text-content-secondary text-sm">
					Add some copy here to explain that this will only take a few moments
				</p>
			</div>
		</div>
	);
};

const WasmError: FC = () => {
	return (
		<div className="flex w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border border-border-destructive bg-surface-tertiary p-4 text-center">
			<p className="font-semibold text-content-primary text-xl">
				Unable to load assets{" "}
			</p>
			<p className="text-content-destructive text-sm">
				Add some copy here to explain that this will only take a few moments
			</p>
		</div>
	);
};

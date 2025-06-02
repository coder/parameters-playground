import { Button } from "@/components/Button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/Resizable";
import * as Tabs from "@/components/Tabs";
import {
	type Diagnostic,
	type InternalDiagnostic,
	outputToDiagnostics,
} from "@/diagnostics";
import type { ParserLog, PreviewOutput } from "@/gen/types";
import { useDebouncedValue } from "@/hooks/debounce";
import { useStore } from "@/store";
import { cn } from "@/utils/cn";
import * as Dialog from "@radix-ui/react-dialog";
import {
	ActivityIcon,
	BugIcon,
	DownloadIcon,
	ExternalLinkIcon,
	LoaderIcon,
	PlayIcon,
	ScrollTextIcon,
	XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import ReactJsonView from "@microlink/react-json-view";

export const Preview: FC = () => {
	const $wasmState = useStore((state) => state.wasmState);
	const $code = useStore((state) => state.code);
	const $errors = useStore((state) => state.errors);
	const $setError = useStore((state) => state.setError);

	const [debouncedCode, isDebouncing] = useDebouncedValue($code, 1000);
	const [output, setOutput] = useState<PreviewOutput | null>(() => null);

	const [params] = useSearchParams();
	const isDebug = useMemo(() => params.has("debug"), [params]);

	const [tab, setTab] = useState(() => "preview");

	const onDownloadOutput = useCallback(() => {
		const blob = new Blob([JSON.stringify(output, null, 2)], {
			type: "application/json",
		});

		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = "output.json";
		document.appendChild(link);
		link.click();
		document.removeChild(link);

		// Give the click event enough time to fire and then revoke the URL.
		// This method of doing it doesn't seem great but I'm not sure if there is a
		// better way.
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 100);
	}, [output]);

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
		<Tabs.Root
			defaultValue="preview"
			asChild={true}
			value={tab}
			onValueChange={(tab) => setTab(() => tab)}
		>
			<ResizablePanel className="relative flex flex-col">
				{$wasmState !== "loaded" ? (
					<div className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center backdrop-blur-sm">
						{$wasmState === "loading" ? <WasmLoading /> : <WasmError />}
					</div>
				) : null}

				<Tabs.List
					className={cn(
						"justify-between pr-3",
						!isDebug ? "hidden" : undefined,
					)}
				>
					<div className="flex">
						<Tabs.Trigger value="preview" icon={PlayIcon} label="Preview" />
						<Tabs.Trigger
							value="debug"
							icon={
								isDebouncing && tab === "debug"
									? ({ className, ...rest }) => (
											<LoaderIcon
												{...rest}
												className={cn("animate-spin", className)}
											/>
										)
									: BugIcon
							}
							label="Debugger"
						/>{" "}
					</div>
					<Button
						size="sm"
						variant="outline"
						className="self-center"
						onClick={onDownloadOutput}
						disabled={isDebouncing}
					>
						<DownloadIcon />
						Download output
					</Button>
				</Tabs.List>

				<Tabs.Content value="preview" asChild={true}>
					<div
						aria-hidden={
							$wasmState !== "loaded" ||
							($errors.show && $errors.diagnostics.length > 0)
						}
						className={cn(
							"flex h-full w-full flex-col items-start gap-6 p-6",
							($wasmState !== "loaded" ||
								($errors.show && $errors.diagnostics.length > 0)) &&
								"pointer-events-none",
						)}
					>
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center justify-center gap-4">
								<p className="font-semibold text-3xl text-content-primary">
									Parameters
								</p>

								<AnimatePresence>
									{isDebouncing && $wasmState === "loaded" ? (
										<motion.div
											initial={{ opacity: 0, scale: 0.75 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.75 }}
										>
											<LoaderIcon
												width={16}
												height={16}
												className="animate-spin text-content-primary"
											/>
										</motion.div>
									) : null}
								</AnimatePresence>
							</div>
							<Button variant="destructive">Reset form</Button>
						</div>

						<div className="flex h-full w-full items-center justify-center overflow-x-clip rounded-xl border p-4">
							<PreviewEmptyState />
						</div>
					</div>
				</Tabs.Content>

				<Tabs.Content value="debug" asChild={true}>
					<Debugger output={output} />
				</Tabs.Content>

				<ErrorPane />
			</ResizablePanel>
		</Tabs.Root>
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

	const hasErrors = useMemo(() => $errors.diagnostics.length > 0, [$errors]);

	return (
		<>
			<AnimatePresence propagate={true}>
				{$errors.show && hasErrors ? (
					// lint/a11y/useKeyWithClickEvents: key events don't seem to
					// work for divs, and I'm otherwise not sure how to make this element
					// more accesible. But I think it's fine since the functionality is able to
					// be used with the button below.
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						aria-hidden={true}
						className="absolute top-0 left-0 h-full w-full cursor-pointer bg-black/10 dark:bg-black/50"
						onClick={() => {
							$toggleShowError(false);
						}}
					>
						{/* OVERLAY */}
					</motion.div>
				) : null}
			</AnimatePresence>

			<AnimatePresence propagate={true}>
				{hasErrors ? (
					<motion.div
						role="alertdialog"
						transition={{
							when: "afterChildren",
						}}
						exit={{ opacity: 0 }}
						className={cn(
							"absolute bottom-0 left-0 flex max-h-[60%] w-full flex-col justify-start",
							$errors.show && "h-auto",
						)}
					>
						<motion.button
							className="flex h-4 min-h-4 w-full items-center justify-center rounded-t-xl bg-border-destructive"
							onClick={() => $toggleShowError()}
							aria-label={
								$errors.show ? "Hide error dialog" : "Show error dialog"
							}
						>
							<div className="h-0.5 w-2/3 max-w-32 rounded-full bg-white/40"></div>
						</motion.button>

						<AnimatePresence propagate={true}>
							{$errors.show ? (
								<motion.div
									initial={{ height: 0 }}
									animate={{
										height: "auto",
									}}
									exit={{ height: 0 }}
									className="flex flex-col gap-6 overflow-y-scroll bg-surface-secondary"
								>
									<div className="flex w-full flex-col gap-3 p-6">
										{$errors.diagnostics.map((diagnostic, index) => (
											<ErrorBlock diagnostic={diagnostic} key={index} />
										))}
									</div>
								</motion.div>
							) : null}
						</AnimatePresence>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
};

type ErroBlockPorps = {
	diagnostic: Diagnostic;
};
const ErrorBlock: FC<ErroBlockPorps> = ({ diagnostic }) => {
	return (
		<div className="w-full rounded-xl bg-surface-tertiary p-3 font-mono text-content-primary text-sm leading-normal">
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

type DebuggerProps = {
	output: PreviewOutput | null;
};
const Debugger: FC<DebuggerProps> = ({ output }) => {
	const parserLogs = output?.parser_logs ?? [];

	return (
		<ResizablePanelGroup
			direction="vertical"
			className="h-full w-full bg-surface-primary"
		>
			<ResizablePanel className="flex">
				<div className="h-full w-full overflow-scroll p-4">
					<ReactJsonView src={output ?? {}} collapsed={1} />
				</div>
			</ResizablePanel>
			<ResizableHandle className="bg-surface-quaternary" />
			<ResizablePanel
				className={cn(
					"flex h-full w-full flex-col justify-start bg-surface-secondary",
					parserLogs.length === 0 && "items-center justify-center",
				)}
				defaultSize={30}
			>
				{parserLogs.length === 0 ? (
					<LogsEmptyState />
				) : (
					<div className="mb-4 overflow-y-scroll">
						{parserLogs.map((log, index) => (
							<Log log={log} key={index} />
						))}
					</div>
				)}
			</ResizablePanel>
		</ResizablePanelGroup>
	);
};

const LogsEmptyState = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-2">
			<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-highlight-sky">
				<ScrollTextIcon
					width={20}
					height={20}
					className="text-content-invert"
				/>
			</div>
			<div className="text-center">
				<p className="text-base text-content-primary">No logs yet</p>
				<p className="max-w-56 text-content-secondary text-xs">
					Make changes to the template and view the output logs here
				</p>
			</div>
		</div>
	);
};

type LogProps = { log: ParserLog };
const Log: FC<LogProps> = ({ log }) => {
	const [showTable, setShowTable] = useState(() => false);

	return (
		<Dialog.Root
			modal={true}
			open={showTable}
			onOpenChange={(show) => setShowTable(() => show)}
		>
			<Dialog.Trigger
				className={cn(
					"group grid h-fit min-h-10 w-full grid-cols-8 items-center border-b border-l-4 border-l-content-destructive hover:bg-surface-primary",
					log.level.toLowerCase() === "info" && "border-l-content-link",
					log.level.toLowerCase() === "warning" && "border-l-content-warning",
				)}
			>
				<div className="col-span-2 flex h-full items-start border-r p-2">
					<p className="truncate text-left font-mono text-content-primary text-xs">
						{log.msg}
					</p>
				</div>
				<p className="col-span-6 break-all p-2 text-left font-mono text-content-primary text-xs">
					{JSON.stringify(log)}
				</p>
			</Dialog.Trigger>

			<Dialog.Portal forceMount={true}>
				<AnimatePresence propagate={true}>
					{showTable ? (
						<>
							<Dialog.Overlay asChild={true}>
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="fixed top-0 left-0 z-10 h-full w-full bg-black/50"
								/>
							</Dialog.Overlay>
							<Dialog.Content asChild={true}>
								<motion.div
									initial={{ opacity: 0, transform: "translateX(100px)" }}
									animate={{ opacity: 1, transform: "translateX(0px)" }}
									exit={{ opacity: 0, transform: "translateX(100px)" }}
									className="fixed top-0 right-0 z-20 flex h-full w-full max-w-md flex-col justify-start gap-6 border-l bg-surface-primary p-4"
								>
									<div className="flex items-center justify-between">
										<p className="font-semibold text-2xl text-content-primary">
											Log
										</p>
										<Dialog.Close asChild={true}>
											<Button
												variant="outline"
												size="icon"
												className="float-right"
											>
												<XIcon />
											</Button>
										</Dialog.Close>
									</div>
									<div className="flex w-full flex-col overflow-clip rounded-lg border font-mono text-content-primary text-xs">
										<div className="grid grid-cols-8 border-b bg-surface-secondary">
											<div className="col-span-2 flex min-h-8 items-center border-r px-2 py-1">
												<p className="text-left uppercase">field</p>
											</div>
											<div className="col-span-6 flex min-h-8 items-center px-2 py-1">
												<p className="text-left uppercase">value</p>
											</div>
										</div>
										{Object.entries(log).map(([key, value], index) => {
											const displayValue = JSON.stringify(value);

											return (
												<div
													key={index}
													className="grid grid-cols-8 border-b last:border-b-0"
												>
													<div className="col-span-2 flex min-h-8 items-center border-r px-2 py-1">
														<p className="text-left">{key}</p>
													</div>
													<div className="col-span-6 flex min-h-8 items-center px-2 py-1">
														<p
															className={cn(
																"text-left",
																value === "" && "text-content-secondary italic",
															)}
														>
															{value === ""
																? "<empty string>"
																: displayValue.substring(
																		1,
																		displayValue.length - 1,
																	)}
														</p>
													</div>
												</div>
											);
										})}
									</div>
								</motion.div>
							</Dialog.Content>
						</>
					) : null}
				</AnimatePresence>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

import { Button } from "@/client/components/Button";
import {
	DynamicParameter,
	useValidationSchemaForDynamicParameters,
} from "@/client/components/DynamicParameter";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/client/components/Resizable";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/client/components/Select";
import * as Tabs from "@/client/components/Tabs";
import { useTheme } from "@/client/contexts/theme";
import { outputToDiagnostics, type Diagnostic } from "@/client/diagnostics";
import type {
	ParameterWithSource,
	ParserLog,
	PreviewOutput,
	WorkspaceOwner,
} from "@/gen/types";
import { mockUsers } from "@/owner";
import { cn } from "@/utils/cn";
import type { WasmLoadState } from "@/utils/wasm";
import ReactJsonView from "@microlink/react-json-view";
import * as Dialog from "@radix-ui/react-dialog";
import {
	ActivityIcon,
	BugIcon,
	DownloadIcon,
	ExternalLinkIcon,
	LoaderIcon,
	PlayIcon,
	ScrollTextIcon,
	SearchCodeIcon,
	XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { type FC, type PropsWithChildren, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

type PreviewProps = {
	wasmLoadState: WasmLoadState;
	isDebouncing: boolean;
	onDownloadOutput: () => void;
	output: PreviewOutput | null;
	parameterValues: Record<string, string>;
	setParameterValues: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;
	parameters: ParameterWithSource[];
	onReset: () => void;
	setOwner: (owner: WorkspaceOwner) => void;
};

export const Preview: FC<PreviewProps> = ({
	wasmLoadState,
	isDebouncing,
	output,
	parameterValues,
	setParameterValues,
	parameters,
	onReset,
	setOwner,
}) => {
	const [params] = useSearchParams();
	const isDebug = params.has("debug");
	const [tab, setTab] = useState(() => "preview");
	const [showErrors, setShowErrors] = useState(true);

	const errors = output ? outputToDiagnostics(output) : [];

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

	return (
		<Tabs.Root
			defaultValue="preview"
			asChild={true}
			value={tab}
			onValueChange={(tab) => setTab(() => tab)}
		>
			<ResizablePanel className="relative flex h-full max-h-full flex-col">
				{wasmLoadState !== "loaded" ? (
					<div className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center backdrop-blur-sm">
						{wasmLoadState === "loading" ? <WasmLoading /> : <WasmError />}
					</div>
				) : null}

				<Tabs.List
					className={cn(
						"flex justify-between pr-3",
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
							wasmLoadState !== "loaded" || (showErrors && errors.length > 0)
						}
						className={cn(
							"flex h-full w-full flex-col items-start gap-4 p-5 ",
							(wasmLoadState !== "loaded" ||
								(showErrors && errors.length > 0)) &&
								"pointer-events-none",
							isDebug && "max-h-[calc(100%-48px)]",
						)}
					>
						{
							<div className="flex w-full items-center justify-between">
								<div className="flex items-center justify-center gap-4">
									<p className="font-semibold text-3xl text-content-primary">
										Parameters
									</p>

									<AnimatePresence>
										{isDebouncing && wasmLoadState === "loaded" ? (
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
								<UserSelect setOwner={setOwner} />
							</div>
						}
						{parameters.length === 0 ? (
							<div className="flex h-full w-full items-center justify-center overflow-x-clip rounded-xl border p-4">
								<PreviewEmptyState />
							</div>
						) : (
							<div className="flex h-full w-full flex-col items-center justify-start gap-5 overflow-x-clip overflow-y-scroll rounded-xl border p-6">
								<Form
									parameters={parameters}
									parameterValues={parameterValues}
									setParameterValues={setParameterValues}
								/>
							</div>
						)}
						<div className="flex w-full justify-between gap-3">
							<Button variant="outline" onClick={onReset} className="w-fit">
								Reset form
							</Button>
							<ViewOutput parameters={parameters} />
						</div>
					</div>
				</Tabs.Content>

				<Tabs.Content value="debug" asChild={true}>
					<Debugger output={output} />
				</Tabs.Content>

				<ErrorPane
					errors={errors}
					setShowErrors={setShowErrors}
					showErrors={showErrors}
				/>
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
						Create dynamic forms for Workspaces that change based on user input.
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

type ErrorPaneProps = {
	errors: Diagnostic[];
	showErrors: boolean;
	setShowErrors: React.Dispatch<React.SetStateAction<boolean>>;
};
const ErrorPane: FC<ErrorPaneProps> = ({
	errors,
	setShowErrors,
	showErrors,
}) => {
	const hasErrors = errors.length > 0;

	return (
		<>
			<AnimatePresence propagate={true}>
				{showErrors && hasErrors ? (
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
							setShowErrors(false);
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
							showErrors && "h-auto",
						)}
					>
						<motion.button
							className="flex h-4 min-h-4 w-full items-center justify-center rounded-t-xl bg-border-destructive"
							onClick={() => setShowErrors((curr) => !curr)}
							aria-label={
								showErrors ? "Hide error dialog" : "Show error dialog"
							}
						>
							<div className="h-0.5 w-2/3 max-w-32 rounded-full bg-white/40"></div>
						</motion.button>

						<AnimatePresence propagate={true}>
							{showErrors ? (
								<motion.div
									initial={{ height: 0 }}
									animate={{
										height: "auto",
									}}
									exit={{ height: 0 }}
									className="flex flex-col gap-6 overflow-y-scroll bg-surface-secondary"
								>
									<div className="flex w-full flex-col gap-3 p-6">
										{errors.map((diagnostic, index) => (
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
					Loading WebAssembly module, this should only take a few moments.
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
				There was an error loading the WebAssembly module.
			</p>
		</div>
	);
};

type DebuggerProps = {
	output: PreviewOutput | null;
};
const Debugger: FC<DebuggerProps> = ({ output }) => {
	const { appliedTheme } = useTheme();
	const parserLogs = output?.parser_logs ?? [];

	return (
		<ResizablePanelGroup
			direction="vertical"
			className="h-full w-full bg-surface-primary"
		>
			<ResizablePanel className="flex">
				<div className="h-full w-full overflow-scroll break-all p-4 font-mono text-sm">
					<ReactJsonView
						src={output ?? {}}
						collapsed={1}
						theme={appliedTheme === "dark" ? "brewer" : "rjv-default"}
					/>
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
	const [open, setIsOpen] = useState(() => false);
	const data = Object.entries(log).reduce<Record<string, unknown>>(
		(acc, [key, value]) => {
			acc[key] = value;
			return acc;
		},
		{},
	);

	return (
		<TableDrawer data={data} open={open} onOpenChange={setIsOpen}>
			<button
				onClick={() => setIsOpen(() => true)}
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
			</button>
		</TableDrawer>
	);
};

type FormProps = {
	parameters: ParameterWithSource[];
	parameterValues: Record<string, string>;
	setParameterValues: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;
};

const Form: FC<FormProps> = ({
	parameters,
	parameterValues,
	setParameterValues,
}) => {
	return (
		parameters
			.sort((a, b) => a.order - b.order)
			// Since the form is sourced from constantly changing terraform, we are not sure
			// if the parameters are the "same" as the previous render.
			.map((p) => {
				return (
					<FormElement
						key={p.uuid}
						parameter={p}
						value={parameterValues[p.name]}
						setParameterValues={setParameterValues}
					/>
				);
			})
	);
};

type FormElementProps = {
	parameter: ParameterWithSource;
	value: string | undefined;
	setParameterValues: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;
};
const FormElement: FC<FormElementProps> = React.memo(
	({ parameter, value, setParameterValues }) => {
		const defaultValue =
			parameter.default_value.value !== "??"
				? parameter.default_value.value
				: undefined;

		const onValueChange = (value: string) => {
			setParameterValues((curr) => {
				return { ...curr, [parameter.name]: value };
			});
		};

		return (
			<DynamicParameter
				parameter={parameter}
				value={value ?? defaultValue}
				autofill={false}
				onChange={onValueChange}
				disabled={parameter.styling.disabled}
			/>
		);
	},
);
FormElement.displayName = "FormElement";

type UserSelectProps = {
	setOwner: (owner: WorkspaceOwner) => void;
};
const UserSelect: FC<UserSelectProps> = ({ setOwner }) => {
	return (
		<Select
			defaultValue="admin"
			onValueChange={(value) => {
				const users: Record<string, WorkspaceOwner | undefined> = mockUsers;
				setOwner(users[value] ?? mockUsers.admin);
			}}
		>
			<SelectTrigger className="w-fit min-w-40">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="admin">Administrator</SelectItem>
				<SelectItem value="developer">Developer</SelectItem>
				<SelectItem value="contractor">Contractor</SelectItem>
				<SelectItem value="eu-developer">EU Developer</SelectItem>
				<SelectItem value="sales">Sales</SelectItem>
			</SelectContent>
		</Select>
	);
};

type TableDrawerProps = {
	data: Record<string, unknown>;
	headers?: [string, string];
} & PropsWithChildren &
	Dialog.DialogProps;

const TableDrawer: FC<TableDrawerProps> = ({
	data,
	headers = ["field", "value"],
	children,
	open,
	onOpenChange,
	...rest
}) => {
	return (
		<Dialog.Root {...rest} modal={true} open={open} onOpenChange={onOpenChange}>
			{children}

			<Dialog.Portal forceMount={true}>
				<AnimatePresence propagate={true}>
					{open ? (
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
									className="fixed top-0 right-0 z-20 flex h-full w-full max-w-lg flex-col justify-start gap-6 border-l bg-surface-primary p-4"
								>
									<div className="flex items-center justify-between">
										<Dialog.Title className="font-semibold text-2xl text-content-primary">
											Parameter Values
										</Dialog.Title>
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
									<div className="flex w-full flex-col overflow-y-scroll rounded-lg border font-mono text-content-primary text-xs">
										<div className="grid grid-cols-8 border-b bg-surface-secondary">
											<div className="col-span-2 flex min-h-8 items-center border-r px-2 py-1">
												<p className="text-left uppercase">{headers[0]}</p>
											</div>
											<div className="col-span-6 flex min-h-8 items-center px-2 py-1">
												<p className="text-left uppercase">{headers[1]}</p>
											</div>
										</div>
										{Object.entries(data).map(([key, value], index) => {
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
																"break-all text-left",
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

type ViewOutputProps = {
	parameters: ParameterWithSource[];
	// parameterValues: Record<string, string>;
};
const ViewOutput: FC<ViewOutputProps> = ({ parameters }) => {
	const [isOpen, setIsOpen] = useState(() => false);

	const onView = async () => {
		const invalidParameter = parameters.find((p) => {
			try {
				if (!p.value.valid) {
					return true;
				}

				const schema = useValidationSchemaForDynamicParameters([p]);
				schema.validateSync([{ name: p.name, value: p.value.value }]);

				return false;
			} catch {
				return true;
			}
		});

		if (invalidParameter) {
			const parameterFormElement = document.getElementById(
				invalidParameter.name,
			);
			parameterFormElement?.scrollIntoView({ behavior: "smooth" });
			return;
		}

		setIsOpen(() => true);
	};

	const data = useMemo(
		() =>
			parameters.reduce<Record<string, string>>((acc, p) => {
				acc[p.name] = p.value.value;
				return acc;
			}, {}),
		[parameters],
	);

	return (
		<TableDrawer
			data={data}
			headers={["Parameter", "Value"]}
			open={isOpen}
			onOpenChange={(open) => setIsOpen(() => open)}
		>
			<Button
				variant="default"
				disabled={parameters.length === 0}
				onClick={onView}
			>
				<SearchCodeIcon />
				View output
			</Button>
		</TableDrawer>
	);
};

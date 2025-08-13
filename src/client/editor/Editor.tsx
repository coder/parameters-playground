import { Editor as MonacoEditor } from "@monaco-editor/react";
import {
	CheckIcon,
	ChevronDownIcon,
	CopyIcon,
	ExternalLinkIcon,
	FileJsonIcon,
	NotebookPenIcon,
	PlusIcon,
	UsersIcon,
	ZapIcon,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
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
import { useEditor } from "@/client/contexts/editor";
import { useTheme } from "@/client/contexts/theme";
import { Users } from "@/client/editor/Users";
import { type SnippetFunc, snippets } from "@/client/snippets";
import { examples } from "@/examples";
import type { ParameterWithSource } from "@/gen/types";
import type { User } from "@/user";
import { cn } from "@/utils/cn";

type EditorProps = {
	code: string;
	setCode: React.Dispatch<React.SetStateAction<string>>;
	users: User[];
	setUsers: (owners: User[]) => void;
	parameters: ParameterWithSource[];
};

export const Editor: FC<EditorProps> = ({
	code,
	setCode,
	users,
	setUsers,
	parameters,
}) => {
	const { appliedTheme } = useTheme();
	const editorRef = useEditor();

	const [tab, setTab] = useState(() => "code");

	const [codeCopied, setCodeCopied] = useState(() => false);

	const onCopy = () => {
		navigator.clipboard.writeText(code);
		setCodeCopied(() => true);
	};

	const onAddSnippet = (name: string, snippet: SnippetFunc) => {
		const nameCount = parameters.filter((p) => p.name.startsWith(name)).length;

		const nextInOrder = 1 + Math.max(0, ...parameters.map((p) => p.order));
		const newName = nameCount > 0 ? `${name}-${nameCount}` : name;
		const newSnippet = snippet(newName, nextInOrder);
		setCode(`${code.trimEnd()}\n\n${newSnippet}\n`);
	};

	useEffect(() => {
		if (!codeCopied) {
			return;
		}

		const copyTimeoutId = setTimeout(() => {
			setCodeCopied(() => false);
		}, 1000);

		return () => clearTimeout(copyTimeoutId);
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
							<Tabs.Trigger icon={UsersIcon} label="Users" value="users" />
						</div>

						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger className="flex w-fit min-w-[140px] cursor-pointer items-center justify-between rounded-md border bg-surface-primary px-2 py-1.5 text-content-secondary transition-colors hover:text-content-primary data-[state=open]:text-content-primary">
									<span className="flex items-center justify-center gap-2 text-xs">
										<ZapIcon width={18} height={18} />
										Snippets
									</span>
									<PlusIcon width={18} height={18} />
								</DropdownMenuTrigger>

								<DropdownMenuPortal>
									<DropdownMenuContent align="start">
										{snippets.map(({ name, label, icon: Icon, snippet }) => (
											<DropdownMenuItem
												key={label}
												onClick={() => onAddSnippet(name, snippet)}
											>
												<Icon size={24} />
												{label}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenuPortal>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger className="flex w-fit min-w-[140px] cursor-pointer items-center justify-between rounded-md border bg-surface-primary px-2 py-1.5 text-content-secondary transition-colors hover:text-content-primary data-[state=open]:text-content-primary">
									<span className="flex items-center justify-center gap-2 text-xs">
										<NotebookPenIcon width={18} height={18} />
										Example
									</span>
									<ChevronDownIcon width={18} height={18} />
								</DropdownMenuTrigger>

								<DropdownMenuPortal>
									<DropdownMenuContent>
										{Object.entries(examples)
											.sort(([_slugA, titleA], [_slugB, titleB]) => {
												return titleA.localeCompare(titleB)
											})
											.map(([slug, title]) => {
												const href = `${window.location.origin}/parameters/example/${slug}`;
												return (
													<DropdownMenuItem
														key={slug}
														asChild={true}
													>
														<a href={href} target="_blank" rel="noreferrer">
															<ExternalLinkIcon />
															{title}
															<span className="sr-only">
																{" "}
																(link opens in new tab)
															</span>
														</a>
													</DropdownMenuItem>
												);
											})}
									</DropdownMenuContent>
								</DropdownMenuPortal>
							</DropdownMenu>
						</div>
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

				<Tabs.Content value="users" asChild={true}>
					<Users setUsers={setUsers} users={users} />
				</Tabs.Content>
			</ResizablePanel>
		</Tabs.Root>
	);
};

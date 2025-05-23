import {
	Button,
	Logo,
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/Tooltip";
import { FileJsonIcon, SettingsIcon, SparklesIcon } from "lucide-react";

export const App = () => {
	return (
		<main className="flex h-dvh w-screen flex-col items-center bg-surface-primary">
			{/* NAV BAR */}
			<nav className="flex h-16 w-full justify-between border-b border-b-surface-quaternary px-6 py-2">
				<div className="flex items-center gap-2">
					<Logo className="text-content-primary" height={24} />
					<p className="font-semibold text-content-primary text-xl">
						Playground
					</p>
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
				</div>
			</nav>

			{/* CONTENT */}
			<ResizablePanelGroup direction={"horizontal"}>
				{/* EDITOR */}
				<ResizablePanel className="itesm-start flex flex-col">
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

						<Button variant="outline" size="sm">
							<SparklesIcon /> Format
						</Button>
					</div>
				</ResizablePanel>

				<ResizableHandle className="divide-surface-quaternary" />

				{/* PReVIEW */}
				<ResizablePanel>Two</ResizablePanel>
			</ResizablePanelGroup>
		</main>
	);
};

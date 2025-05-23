import { ResizableHandle, ResizablePanelGroup } from "@/components/Resizable";
import { Editor } from "./Editor";
import { Logo } from "./components/Logo";
import { Preview } from "./Preview";

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
				<Editor />

				<ResizableHandle className="bg-surface-quaternary" />

				{/* PREVIEW */}
				<Preview />
			</ResizablePanelGroup>
		</main>
	);
};

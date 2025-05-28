import { Button } from "@/components/Button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/Resizable";
import { ActivityIcon, ExternalLinkIcon, LoaderIcon } from "lucide-react";
import { useRef, useState, type FC } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useStore } from "@/store";

export const Preview: FC = () => {
	const $isWasmLoaded = useStore((state) => state.isWasmLoaded);

	return (
		<ResizablePanel className="relative">
			{!$isWasmLoaded ? (
				<div className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center backdrop-blur-sm">
					<WasmLoading />
				</div>
			) : null}

			<div aria-hidden={!$isWasmLoaded} className="flex h-full w-full flex-col items-start gap-6 p-8">
				<div className="flex w-full items-center justify-between">
					<p className="font-semibold text-3xl text-content-primary">
						Parameters
					</p>
					<Button variant="destructive">Reset form</Button>
				</div>

				<div className="flex h-full w-full items-center justify-center overflow-x-clip rounded-xl border p-4">
					<div className="flex flex-col items-center justify-center gap-3">
						<div className="flex items-center justify-center rounded-[6px] bg-highlight-sky p-2">
							<ActivityIcon
								className="text-content-invert"
								width={24}
								height={24}
							/>
						</div>

						<div className="flex flex-col items-center gap-2">
							<div className="flex max-w-[258px] flex-col items-center gap-1">
								<p className="text-nowrap text-center font-semibold text-2xl text-content-primary">
									Parameters Playground
								</p>
								<p className="text-center font-medium text-content-secondary text-sm">
									Create dynamic parameters here, I need to figure out a better
									copy.
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
				</div>
			</div>

			<ErrorPane />
		</ResizablePanel>
	);
};

const ErrorPane = () => {
	const $error = useStore((state) => state.error);

	const [errorPanelSize, setErrorPanelSize] = useState(() => 50);
	const errorPanelRef = useRef<ImperativePanelHandle>(null);

	const onCollapseError = () => {
		errorPanelRef.current?.collapse();
	};

	if (!$error) {
		return null;
	}

	return (
		<>
			<div
				className="pointer-events-none absolute top-0 left-0 h-full w-full bg-black"
				style={{ opacity: errorPanelSize / 100 }}
			>
				{/* OVERLAY */}
			</div>

			<ResizablePanelGroup
				direction="vertical"
				className="pointer-events-none absolute top-0 left-0"
			>
				<ResizablePanel aria-hidden className="pointer-events-none">
					{/* EMPTY */}
				</ResizablePanel>
				<ResizableHandle
					onClick={onCollapseError}
					className="flex h-4 min-h-4 w-full items-center justify-center rounded-t-xl bg-[#AA5253]"
					withHandle={true}
				/>
				<ResizablePanel
					ref={errorPanelRef}
					className="bg-surface-secondary"
					collapsible={true}
					collapsedSize={0}
					onResize={(size) => {
						setErrorPanelSize(() => size);
					}}
				></ResizablePanel>
			</ResizablePanelGroup>
		</>
	);
};

const WasmLoading: FC = () => {
	return (
		<div className="flex w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border border-[#38BDF8] bg-surface-tertiary p-4">
			<LoaderIcon className="animate-spin text-content-primary" />
			<div className="text-center">
				<p className="font-semibold text-content-primary text-xl">
					Loading Assets
				</p>
				<p className="text-content-secondary text-sm">
					Add some copy here to explain that this will only take a few moments
				</p>
			</div>
		</div>
	);
};

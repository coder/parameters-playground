import { Button } from "@/components/Button";
import { ResizablePanel } from "@/components/Resizable";
import { ActivityIcon, ExternalLinkIcon } from "lucide-react";
import type { FC } from "react";

export const Preview: FC = () => {
	return (
		<ResizablePanel className="flex flex-col items-start gap-6 p-8">
			<div className="flex w-full items-center justify-between">
				<p className="font-semibold text-3xl text-content-primary">
					Parameters
				</p>
				<Button variant="destructive">Reset form</Button>
			</div>

			<div className="flex h-full w-full items-center justify-center rounded-xl border p-4">
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
								Create dynamic parameters here, I need to figure out a better
								copy.
							</p>
						</div>
						<a
							href="#todo"
							className="flex items-center gap-0.5 text-content-link text-sm"
						>
							Read the docs{" "}
							<span className="inline">
								<ExternalLinkIcon width={16} />
							</span>
						</a>
					</div>
				</div>
			</div>
		</ResizablePanel>
	);
};

import { cn } from "@/utils/cn";
import { forwardRef } from "react";

type StackProps = {
	className?: string;
} & React.HTMLProps<HTMLDivElement>;

export const Stack = forwardRef<HTMLDivElement, StackProps>((props, ref) => {
	const { className, children, ...divProps } = props;

	return (
		<div
			{...divProps}
			ref={ref}
			className={cn("flex flex-col gap-4 flex-wrap max-w-full", className)}
		>
			{children}
		</div>
	);
});

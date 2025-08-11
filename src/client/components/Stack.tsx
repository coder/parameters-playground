import { forwardRef } from "react";
import { cn } from "@/utils/cn";

type StackProps = {
	className?: string;
} & React.HTMLProps<HTMLDivElement>;

export const Stack = forwardRef<HTMLDivElement, StackProps>((props, ref) => {
	const { className, children, ...divProps } = props;

	return (
		<div
			{...divProps}
			ref={ref}
			className={cn("flex max-w-full flex-col flex-wrap gap-4", className)}
		>
			{children}
		</div>
	);
});

import type { FC } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import type { LucideProps } from "lucide-react";
import { cn } from "@/utils/cn";

export const Root: FC<Tabs.TabsProps> = ({ children, ...rest }) => {
	return (
		<Tabs.Root
			{...rest}
		>
			{children}
		</Tabs.Root>
	);
};

export const List: FC<Tabs.TabsListProps> = ({
	className,
	children,
	...rest
}) => {
	return (
		<Tabs.List {...rest} className={cn("flex h-12 w-full border-b", className)}>
			{children}
		</Tabs.List>
	);
};

type TriggerProps = {
	label: string;
	icon: FC<LucideProps>;
} & Tabs.TabsTriggerProps;
export const Trigger: FC<TriggerProps> = ({
	label,
	icon: Icon = () => null,
	className,
	...rest
}) => {
	return (
		<Tabs.Trigger
			{...rest}
			className={cn(
				"flex min-w-[120px] items-center gap-2 border-x border-x-transparent px-4 py-3 text-center text-content-secondary text-sm transition-colors hover:bg-surface-secondary hover:text-content-primary data-[disabled]:cursor-not-allowed data-[state=active]:border-x-border data-[state=active]:bg-surface-secondary data-[state=active]:text-content-primary data-[disabled]:hover:bg-inherit data-[disabled]:hover:text-content-secondary data-[state=active]:last:border-r-transparent data-[state=active]:first:border-l-transparent",
				className,
			)}
		>
			<Icon className="min-w-[18px]" />
			<p className="w-full">{label}</p>
		</Tabs.Trigger>
	);
};

export const Content = Tabs.Content;

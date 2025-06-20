/**
 * Copied from shadc/ui on 02/03/2025
 * @see {@link https://ui.shadcn.com/docs/components/table}
 */

import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/utils/cn";

export const Table = React.forwardRef<
	HTMLTableElement,
	React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
	<div className="relative w-full overflow-auto">
		<table
			ref={ref}
			className={cn(
				"w-full caption-bottom border-separate border-spacing-0 font-medium text-content-secondary text-xs",
				className,
			)}
			{...props}
		/>
	</div>
));

export const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<thead ref={ref} className={cn("[&_td]:border-none", className)} {...props} />
));

export const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody
		ref={ref}
		className={cn(
			"[&>tr:first-of-type>td]:border-t [&>tr>td:first-of-type]:border-l",
			"[&>tr:last-child>td]:border-b [&>tr>td:last-child]:border-r",
			"[&>tr:first-of-type>td:first-of-type]:rounded-tl-md [&>tr:first-of-type>td:last-child]:rounded-tr-md",
			"[&>tr:last-child>td:first-of-type]:rounded-bl-md [&>tr:last-child>td:last-child]:rounded-br-md",
			className,
		)}
		{...props}
	/>
));

const tableRowVariants = cva(
	[
		"border-0 border-b border-solid border-border transition-colors",
		"data-[state=selected]:bg-muted",
	],
	{
		variants: {
			hover: {
				false: null,
				true: cn([
					"cursor-pointer hover:outline focus:outline outline-1 -outline-offset-1 outline-border-hover",
					"first:rounded-t-md last:rounded-b-md",
				]),
			},
		},
		defaultVariants: {
			hover: false,
		},
	},
);

export const TableRow = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLAttributes<HTMLTableRowElement> &
		VariantProps<typeof tableRowVariants>
>(({ className, hover, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn(
			"border-0 border-border border-b border-solid transition-colors",
			"data-[state=selected]:bg-muted",
			tableRowVariants({ hover }),
			className,
		)}
		{...props}
	/>
));

export const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<th
		ref={ref}
		className={cn(
			"p-3 text-left align-middle font-semibold",
			"[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			className,
		)}
		{...props}
	/>
));

export const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<td
		ref={ref}
		className={cn(
			"border-0 border-border border-t border-solid",
			"p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
			className,
		)}
		{...props}
	/>
));


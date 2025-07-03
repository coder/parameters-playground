/**
 * Copied from shadc/ui on 04/16/2025
 * @see {@link https://ui.shadcn.com/docs/components/slider}
 */
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/utils/cn";

export const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		className={cn(
			"relative flex h-1.5 w-full items-center",
			className,
			"touch-none select-none",
		)}
		{...props}
	>
		<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-surface-secondary data-[disabled]:opacity-40">
			<SliderPrimitive.Range className="absolute h-full bg-content-primary" />
		</SliderPrimitive.Track>
		<SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-surface-invert-secondary border-solid bg-surface-primary shadow transition-colors hover:border-content-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-content-primary focus-visible:ring-offset-surface-primary disabled:pointer-events-none data-[disabled]:border-border data-[disabled]:opacity-100" />
		<SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-surface-invert-secondary border-solid bg-surface-primary shadow transition-colors hover:border-content-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-content-primary focus-visible:ring-offset-surface-primary disabled:pointer-events-none data-[disabled]:border-border data-[disabled]:opacity-100" />
	</SliderPrimitive.Root>
));

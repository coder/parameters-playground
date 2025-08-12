/**
 * @file Defines hooks for created debounced versions of functions and arbitrary
 * values.
 *
 * It is not safe to call a general-purpose debounce utility inside a React
 * render. It will work on the initial render, but the memory reference for the
 * value will change on re-renders. Most debounce functions create a "stateful"
 * version of a function by leveraging closure; but by calling it repeatedly,
 * you create multiple "pockets" of state, rather than a centralized one.
 *
 * Debounce utilities can make sense if they can be called directly outside the
 * component or in a useEffect call, though.
 */
import { useEffect, useState } from "react";

/**
 * Takes any value, and returns out a debounced version of it.
 */
export function useDebouncedValue<T = unknown>(
	value: T,
	debounceTimeMs: number,
): [T, boolean] {
	const [debouncedValue, setDebouncedValue] = useState(value);
	const [isDebouncing, setIsDebouncing] = useState(false);

	useEffect(() => {
		setIsDebouncing(() => true);
		const timeoutId = window.setTimeout(() => {
			setDebouncedValue(value);
			setIsDebouncing(() => false);
		}, debounceTimeMs);

		return () => window.clearTimeout(timeoutId);
	}, [value, debounceTimeMs]);

	return [debouncedValue, isDebouncing];
}

import { ChevronsUpDown, PlusIcon, XIcon } from "lucide-react";
import { type FC, useRef, useState } from "react";
import { Button } from "@/client/components/Button";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/client/components/Popover";
import { Badge } from "./Badge";

type Option = { value: string; label: string; group?: string };

type MultiSelectComboBoxProps = {
	options: Option[];
	value?: string[];
	defaultValue?: string[];
	canAddNew?: boolean;
	badge?: "default" | "warning" | "destructive";
};

export const MultiSelectComboBox: FC<MultiSelectComboBoxProps> = ({
	options,
	defaultValue,
	...props
}) => {
	const triggerRef = useRef<HTMLButtonElement>(null);

	const [open, setOpen] = useState(false);
	const [value, setValue] = useState<string[]>(props.value ?? []);

	const inputRef = useRef<HTMLInputElement | null>(null);
	const [searchValue, setSearchValue] = useState("");

	const onToggleValue = (value: string) => {
		setValue((curr) => {
			const newValue = [...curr];

			const existingIndex = newValue.findIndex((v) => v === value);
			if (existingIndex >= 0) {
				newValue.splice(existingIndex, 1);
			} else {
				newValue.push(value);
			}

			return newValue;
		});
	};

	const filteredOptions = options.filter(
		(o) =>
			!value.some((value) => value === o.value) &&
			(o.label.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
				o.value.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())),
	);

	return (
		<Popover
			open={open}
			onOpenChange={(isOpen) => {
				if (isOpen) {
					inputRef.current?.focus();
				} else {
					setSearchValue("");
				}
				setOpen(isOpen);
			}}
		>
			<PopoverTrigger asChild ref={triggerRef}>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="h-fit w-[300px] justify-between"
				>
					<div className="flex flex-wrap gap-2">
						{value.length > 0 ? (
							value.map((v) => (
								<Badge asChild={true}>
									<button
										key={v}
										onClick={(e) => {
											e.stopPropagation();
											onToggleValue(v);
										}}
									>
										{options.find((o) => o.value === v)?.label ?? v}
										<XIcon width={1} />
									</button>
								</Badge>
							))
						) : (
							<span className="text-content-secondary">Select something</span>
						)}
					</div>
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="flex w-full flex-col gap-2 p-2"
				align="start"
				style={{ width: triggerRef.current?.clientWidth }}
			>
				<input
					ref={inputRef}
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					className="w-full rounded-md border bg-surface-primary px-2 py-1 text-sm"
					placeholder="Search"
				/>

				<div className="flex flex-col items-start">
					{filteredOptions.length > 0
						? filteredOptions
								.filter((f) => !value.some((value) => value === f.value))
								.map((framework) => (
									<button
										className="w-full rounded-md px-2 py-1 text-left hover:bg-surface-secondary"
										type="button"
										onClick={() => {
											onToggleValue(framework.value);
										}}
										key={framework.value}
									>
										{framework.label}
									</button>
								))
						: null}

					{filteredOptions.length === 0 && searchValue === "" ? (
						<p className="text-content-secondary text-center px-2">No values</p>
					) : null}

					{searchValue !== "" ? (
						<Button
							size="sm"
							className="w-full h-8"
							variant="outline"
							onClick={() => {
								setValue((curr) => [...curr, searchValue]);
								setSearchValue("");
							}}
						>
							Add {searchValue}
						</Button>
					) : null}
				</div>
			</PopoverContent>
		</Popover>
	);
};

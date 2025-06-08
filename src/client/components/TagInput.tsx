import { type FC, useId, useMemo } from "react";

type TagInputProps = {
	label: string;
	id?: string;
	values: string[];
	onChange: (values: string[]) => void;
};

export const TagInput: FC<TagInputProps> = ({
	label,
	id,
	values,
	onChange,
}) => {
	const baseId = useId();

	const itemIds = useMemo(() => {
		return Array.from(
			{ length: values.length },
			(_, index) => `${baseId}-item-${index}`,
		);
	}, [baseId, values.length]);

	return (
		<div>
			<label className="focus-within:-top-px focus-within:-left-px relative flex min-h-10 flex-wrap gap-2 rounded-md border border-border border-solid px-1.5 py-1.5 focus-within:border-2 focus-within:border-content-link">
				{values.map((value, index) => (
					<button
						key={itemIds[index]}
						className="h-7 rounded-md bg-surface-secondary text-content-secondary"
						onClick={() => {
							onChange(values.filter((oldValue) => oldValue !== value));
						}}
					/>
				))}
				<input
					id={id}
					aria-label={label}
					className="flex-grow border-none bg-transparent p-0 text-inherit focus:outline-none"
					onKeyDown={(event) => {
						if (event.key === ",") {
							event.preventDefault();
							const newValue = event.currentTarget.value;
							onChange([...values, newValue]);
							event.currentTarget.value = "";
							return;
						}

						if (event.key === "Backspace" && event.currentTarget.value === "") {
							event.preventDefault();

							if (values.length === 0) {
								return;
							}

							const lastValue = values[values.length - 1];
							onChange(values.slice(0, -1));
							event.currentTarget.value = lastValue;
						}
					}}
					onBlur={(event) => {
						if (event.currentTarget.value !== "") {
							const newValue = event.currentTarget.value;
							onChange([...values, newValue]);
							event.currentTarget.value = "";
						}
					}}
				/>
			</label>

			<p className="text-content-secondary text-xs">
				Type "," to separate the values
			</p>
		</div>
	);
};

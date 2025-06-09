import { Badge } from "@/client/components/Badge";

import { Checkbox } from "@/client/components/Checkbox";
import { Input } from "@/client/components/Input";
import { Label } from "@/client/components/Label";
import { MemoizedMarkdown } from "@/client/components/Markdown";
import {
	MultiSelectCombobox,
	type Option,
} from "@/client/components/MultiSelectCombobox";
import { RadioGroup, RadioGroupItem } from "@/client/components/RadioGroup";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/client/components/Select";
import { Slider } from "@/client/components/Slider";
import { Switch } from "@/client/components/Switch";
import { TagInput } from "@/client/components/TagInput";
import { Textarea } from "@/client/components/Textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/client/components/Tooltip";
import { useDebouncedValue } from "@/client/hooks/debounce";
import { useEffectEvent } from "@/client/hooks/hookPolyfills";
import type { NullHCLString, Parameter, ParameterOption } from "@/gen/types";
import {
	CircleAlert,
	Info,
	LinkIcon,
	Settings,
	TriangleAlert,
} from "lucide-react";
import { type FC, useEffect, useId, useRef, useState } from "react";
import * as Yup from "yup";

interface WorkspaceBuildParameter {
	readonly name: string;
	readonly value: string;
}

type AutofillSource = "user_history" | "url" | "active_build";

type AutofillBuildParameter = {
	source: AutofillSource;
} & WorkspaceBuildParameter;

interface DynamicParameterProps {
	parameter: Parameter;
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	isPreset?: boolean;
	autofill: boolean;
}

export const DynamicParameter: FC<DynamicParameterProps> = ({
	parameter,
	value,
	onChange,
	disabled,
	isPreset,
	autofill = false,
}) => {
	const id = useId();

	return (
		<div
			className="flex w-full flex-col gap-2"
			data-testid={`parameter-field-${parameter.name}`}
		>
			<ParameterLabel
				id={id}
				parameter={parameter}
				isPreset={isPreset}
				autofill={autofill}
			/>
			<div className="max-w-lg">
				{parameter.form_type === "input" ||
				parameter.form_type === "textarea" ? (
					<DebouncedParameterField
						id={id}
						parameter={parameter}
						value={value}
						onChange={onChange}
						disabled={disabled}
						isPreset={isPreset}
					/>
				) : (
					<ParameterField
						id={id}
						parameter={parameter}
						value={value}
						onChange={onChange}
						disabled={disabled}
					/>
				)}
			</div>
			{parameter.form_type !== "error" && (
				<ParameterDiagnostics diagnostics={parameter.diagnostics} />
			)}
		</div>
	);
};

interface ParameterLabelProps {
	parameter: Parameter;
	isPreset?: boolean;
	autofill: boolean;
	id: string;
}

const ParameterLabel: FC<ParameterLabelProps> = ({
	parameter,
	isPreset,
	autofill,
	id,
}) => {
	const displayName = parameter.display_name
		? parameter.display_name
		: parameter.name;
	const hasRequiredDiagnostic = parameter.diagnostics?.find(
		(d) => d?.extra?.code === "required",
	);

	return (
		<div className="flex items-start gap-2">
			{
				// {parameter.icon && (
				// 				<ExternalImage
				// 					className="w-5 h-5 mt-0.5 object-contain"
				// 					alt="Parameter icon"
				// 					src={parameter.icon}
				// 				/>
				// 			)}
			}
			<div className="flex w-full flex-col gap-1">
				<Label
					htmlFor={id}
					className="flex flex-wrap gap-2 font-medium text-content-primary text-sm"
				>
					<span className="flex">
						{displayName}
						{parameter.required && (
							<span className="text-content-destructive">*</span>
						)}
					</span>
					{!parameter.mutable && (
						<TooltipProvider delayDuration={100}>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="flex items-center">
										<Badge size="sm" variant="warning" border="none">
											<TriangleAlert />
											Immutable
										</Badge>
									</span>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									This value cannot be modified after the workspace has been
									created.
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					{isPreset && (
						<TooltipProvider delayDuration={100}>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="flex items-center">
										<Badge size="sm">
											<Settings />
											Preset
										</Badge>
									</span>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									Preset parameters cannot be modified.
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					{autofill && (
						<TooltipProvider delayDuration={100}>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="flex items-center">
										<Badge size="sm">
											<LinkIcon />
											URL Autofill
										</Badge>
									</span>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									Autofilled from the URL
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					{hasRequiredDiagnostic && (
						<TooltipProvider delayDuration={100}>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="flex items-center">
										<Badge size="sm" variant="destructive" border="none">
											Required
										</Badge>
									</span>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									{hasRequiredDiagnostic.summary || "Required parameter"}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</Label>

				{Boolean(parameter.description) && (
					<div className="text-content-secondary">
						<MemoizedMarkdown className="text-xs">
							{parameter.description}
						</MemoizedMarkdown>
					</div>
				)}
			</div>
		</div>
	);
};

interface DebouncedParameterFieldProps {
	parameter: Parameter;
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	id: string;
	isPreset?: boolean;
}

const DebouncedParameterField: FC<DebouncedParameterFieldProps> = ({
	parameter,
	value,
	onChange,
	disabled,
	id,
	isPreset,
}) => {
	const [localValue, setLocalValue] = useState(
		value !== undefined ? value : validValue(parameter.value),
	);
	const [debouncedLocalValue] = useDebouncedValue(localValue, 500);
	const onChangeEvent = useEffectEvent(onChange);
	// prevDebouncedValueRef is to prevent calling the onChangeEvent on the initial render
	const prevDebouncedValueRef = useRef<string | undefined>(undefined);
	const prevValueRef = useRef(value);

	// This is necessary in the case of fields being set by preset parameters
	useEffect(() => {
		if (isPreset && value !== undefined && value !== prevValueRef.current) {
			setLocalValue(value);
			prevValueRef.current = value;
		}
	}, [value, isPreset]);

	useEffect(() => {
		// Only call onChangeEvent if debouncedLocalValue is different from the previously committed value
		// and it's not the initial undefined state.
		if (
			prevDebouncedValueRef.current !== undefined &&
			prevDebouncedValueRef.current !== debouncedLocalValue
		) {
			onChangeEvent(debouncedLocalValue);
		}

		// Update the ref to the current debounced value for the next comparison
		prevDebouncedValueRef.current = debouncedLocalValue;
	}, [debouncedLocalValue, onChangeEvent]);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const resizeTextarea = useEffectEvent(() => {
		if (textareaRef.current) {
			const textarea = textareaRef.current;
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	});

	useEffect(() => {
		resizeTextarea();
	}, [resizeTextarea]);

	switch (parameter.form_type) {
		case "textarea": {
			return (
				<Textarea
					ref={textareaRef}
					id={id}
					className="max-h-[500px] overflow-y-auto"
					value={localValue}
					onChange={(e) => {
						const target = e.currentTarget;
						target.style.height = "auto";
						target.style.height = `${target.scrollHeight}px`;

						setLocalValue(e.target.value);
					}}
					disabled={disabled}
					placeholder={parameter.styling?.placeholder ?? undefined}
					required={parameter.required}
				/>
			);
		}

		case "input": {
			const inputType = parameter.type === "number" ? "number" : "text";
			const inputProps: Record<string, unknown> = {};

			if (parameter.type === "number") {
				const validations = parameter.validations[0] || {};
				const { validation_min, validation_max } = validations;

				if (validation_min !== null) {
					inputProps.min = validation_min;
				}

				if (validation_max !== null) {
					inputProps.max = validation_max;
				}
			}

			return (
				<Input
					id={id}
					type={inputType}
					value={localValue}
					className="text-content-primary"
					onChange={(e) => {
						setLocalValue(e.target.value);
					}}
					disabled={disabled}
					required={parameter.required}
					placeholder={parameter.styling?.placeholder}
					{...inputProps}
				/>
			);
		}
	}
};

interface ParameterFieldProps {
	parameter: Parameter;
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	id: string;
}

const ParameterField: FC<ParameterFieldProps> = ({
	parameter,
	value,
	onChange,
	disabled,
	id,
}) => {
	switch (parameter.form_type) {
		case "dropdown":
			return (
				<Select
					onValueChange={onChange}
					value={value}
					disabled={disabled}
					required={parameter.required}
				>
					<SelectTrigger id={id}>
						<SelectValue
							placeholder={parameter.styling?.placeholder || "Select option"}
						/>
					</SelectTrigger>
					<SelectContent>
						{parameter.options.map((option) => (
							<SelectItem key={option.value.value} value={option.value.value}>
								<OptionDisplay option={option} />
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			);

		case "multi-select": {
			const parsedValues = parseStringArrayValue(value ?? "");

			if (parsedValues.error) {
				// Diagnostics on parameter already handle this case, do not duplicate error message
				// Reset user's values to an empty array. This would overwrite any default values
				parsedValues.values = [];
			}

			// Map parameter options to MultiSelectCombobox options format
			const options: Option[] = parameter.options.map((opt) => ({
				value: opt.value.value,
				label: opt.name,
				disable: false,
			}));

			const optionMap = new Map(
				parameter.options.map((opt) => [opt.value.value, opt.name]),
			);

			const selectedOptions: Option[] = parsedValues.values.map((val) => {
				return {
					value: val,
					label: optionMap.get(val) || val,
					disable: false,
				};
			});

			return (
				<MultiSelectCombobox
					inputProps={{
						id: id,
					}}
					options={options}
					defaultOptions={selectedOptions}
					onChange={(newValues) => {
						const values = newValues.map((option) => option.value);
						onChange(JSON.stringify(values));
					}}
					hidePlaceholderWhenSelected
					placeholder={parameter.styling?.placeholder || "Select option"}
					emptyIndicator={
						<p className="text-center text-content-primary text-md">
							No results found
						</p>
					}
					disabled={disabled}
				/>
			);
		}

		case "tag-select": {
			const parsedValues = parseStringArrayValue(value ?? "");

			if (parsedValues.error) {
				// Diagnostics on parameter already handle this case, do not duplicate error message
				// Reset user's values to an empty array. This would overwrite any default values
				parsedValues.values = [];
			}

			return (
				<TagInput
					id={id}
					label={parameter.display_name || parameter.name}
					values={parsedValues.values}
					onChange={(values) => {
						onChange(JSON.stringify(values));
					}}
				/>
			);
		}

		case "switch":
			return (
				<Switch
					id={id}
					checked={value === "true"}
					onCheckedChange={(checked) => {
						onChange(checked ? "true" : "false");
					}}
					disabled={disabled}
				/>
			);

		case "radio":
			return (
				<RadioGroup
					onValueChange={onChange}
					disabled={disabled}
					value={value}
					className="relative"
				>
					{parameter.options.map((option) => (
						<div
							key={option.value.value}
							className="flex items-center space-x-2"
						>
							<RadioGroupItem
								id={`${id}-${option.value.value}`}
								value={option.value.value}
							/>
							<Label
								htmlFor={`${id}-${option.value.value}`}
								className="cursor-pointer text-content-primary"
							>
								<OptionDisplay option={option} />
							</Label>
						</div>
					))}
				</RadioGroup>
			);

		case "checkbox":
			return (
				<div className="flex items-center space-x-2">
					<Checkbox
						id={id}
						checked={value === "true"}
						onCheckedChange={(checked) => {
							onChange(checked ? "true" : "false");
						}}
						disabled={disabled}
					/>
					<Label htmlFor={id}>{parameter.styling?.label}</Label>
				</div>
			);

		case "slider":
			return (
				<div className="flex flex-row items-baseline gap-3">
					<Slider
						id={id}
						className="mt-2"
						value={[Number.isFinite(Number(value)) ? Number(value) : 0]}
						onValueChange={([value]) => {
							onChange(value.toString());
						}}
						min={parameter.validations[0]?.validation_min ?? 0}
						max={parameter.validations[0]?.validation_max ?? 100}
						disabled={disabled}
					/>
					<span className="w-4 font-medium text-content-secondary">
						{Number.isFinite(Number(value)) ? value : "0"}
					</span>
				</div>
			);
		case "error":
			return <Diagnostics diagnostics={parameter.diagnostics} />;
	}
};

type ParsedValues = {
	values: string[];
	error: string;
};

const parseStringArrayValue = (value: string): ParsedValues => {
	const parsedValues: ParsedValues = {
		values: [],
		error: "",
	};

	if (value) {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) {
				parsedValues.values = parsed;
			}
		} catch (e) {
			parsedValues.error = `Error parsing parameter of type list(string), ${e}`;
		}
	}

	return parsedValues;
};

interface OptionDisplayProps {
	option: ParameterOption;
}

const OptionDisplay: FC<OptionDisplayProps> = ({ option }) => {
	return (
		<div className="flex items-center gap-2">
			<span>{option.name}</span>
			{option.description && (
				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Info className="h-3.5 w-3.5 text-content-secondary" />
						</TooltipTrigger>
						<TooltipContent side="right" sideOffset={10}>
							{option.description}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
};

interface ParameterDiagnosticsProps {
	diagnostics: Parameter["diagnostics"];
}

const ParameterDiagnostics: FC<ParameterDiagnosticsProps> = ({
	diagnostics,
}) => {
	return (
		<>
			{diagnostics.map((diagnostic, index) => {
				if (diagnostic.extra?.code === "required") {
					return null;
				}
				return (
					<div
						key={`parameter-diagnostic-${diagnostic.summary}-${index}`}
						className={`px-1 text-xs ${
							diagnostic.severity === "error"
								? "text-content-destructive"
								: "text-content-warning"
						}`}
					>
						<p className="font-medium">{diagnostic.summary}</p>
						{diagnostic.detail && <p className="m-0">{diagnostic.detail}</p>}
					</div>
				);
			})}
		</>
	);
};

export const getInitialParameterValues = (
	params: Parameter[],
	autofillParams?: AutofillBuildParameter[],
): WorkspaceBuildParameter[] => {
	return params.map((parameter) => {
		// Short-circuit for ephemeral parameters, which are always reset to
		// the template-defined default.
		if (parameter.ephemeral) {
			return {
				name: parameter.name,
				value: validValue(parameter.value),
			};
		}

		const autofillParam = autofillParams?.find(
			({ name }) => name === parameter.name,
		);

		const useAutofill =
			autofillParam?.value && isValidParameterOption(parameter, autofillParam);

		return {
			name: parameter.name,
			value: useAutofill ? autofillParam.value : validValue(parameter.value),
		};
	});
};

const validValue = (value: NullHCLString) => {
	return value.valid ? value.value : "";
};

const isValidParameterOption = (
	previewParam: Parameter,
	buildParam: WorkspaceBuildParameter,
) => {
	// multi-select is the only list(string) type with options
	if (previewParam.form_type === "multi-select") {
		let values: string[] = [];
		try {
			const parsed = JSON.parse(buildParam.value);
			if (Array.isArray(parsed)) {
				values = parsed;
			}
		} catch (e) {
			return false;
		}

		if (previewParam.options.length > 0) {
			const validValues = previewParam.options.map(
				(option) => option.value.value,
			);
			return values.some((value) => validValues.includes(value));
		}
		return false;
	}

	// For parameters with options (dropdown, radio)
	if (previewParam.options.length > 0) {
		const validValues = previewParam.options.map(
			(option) => option.value.value,
		);
		return validValues.includes(buildParam.value);
	}

	// For parameters without options (input,textarea,switch,checkbox,tag-select)
	return true;
};

export const useValidationSchemaForDynamicParameters = (
	parameters?: Parameter[],
	lastBuildParameters?: WorkspaceBuildParameter[],
): Yup.AnySchema => {
	if (!parameters) {
		return Yup.object();
	}

	return Yup.array()
		.of(
			Yup.object().shape({
				name: Yup.string().required(),
				value: Yup.string()
					.test("verify with template", (val, ctx) => {
						const name = ctx.parent.name;
						const parameter = parameters.find(
							(parameter) => parameter.name === name,
						);
						if (parameter) {
							switch (parameter.type) {
								case "number": {
									const minValidation = parameter.validations.find(
										(v) => v.validation_min !== null,
									);
									const maxValidation = parameter.validations.find(
										(v) => v.validation_max !== null,
									);

									if (
										minValidation &&
										minValidation.validation_min !== null &&
										!maxValidation &&
										Number(val) < minValidation.validation_min
									) {
										return ctx.createError({
											path: ctx.path,
											message:
												parameterError(parameter, val) ??
												`Value must be greater than ${minValidation.validation_min}.`,
										});
									}

									if (
										!minValidation &&
										maxValidation &&
										maxValidation.validation_max !== null &&
										Number(val) > maxValidation.validation_max
									) {
										return ctx.createError({
											path: ctx.path,
											message:
												parameterError(parameter, val) ??
												`Value must be less than ${maxValidation.validation_max}.`,
										});
									}

									if (
										minValidation &&
										minValidation.validation_min !== null &&
										maxValidation &&
										maxValidation.validation_max !== null &&
										(Number(val) < minValidation.validation_min ||
											Number(val) > maxValidation.validation_max)
									) {
										return ctx.createError({
											path: ctx.path,
											message:
												parameterError(parameter, val) ??
												`Value must be between ${minValidation.validation_min} and ${maxValidation.validation_max}.`,
										});
									}

									const monotonic = parameter.validations.find(
										(v) =>
											v.validation_monotonic !== null &&
											v.validation_monotonic !== "",
									);

									if (monotonic && lastBuildParameters) {
										const lastBuildParameter = lastBuildParameters.find(
											(last: { name: string }) => last.name === name,
										);
										if (lastBuildParameter) {
											switch (monotonic.validation_monotonic) {
												case "increasing":
													if (Number(lastBuildParameter.value) > Number(val)) {
														return ctx.createError({
															path: ctx.path,
															message: `Value must only ever increase (last value was ${lastBuildParameter.value})`,
														});
													}
													break;
												case "decreasing":
													if (Number(lastBuildParameter.value) < Number(val)) {
														return ctx.createError({
															path: ctx.path,
															message: `Value must only ever decrease (last value was ${lastBuildParameter.value})`,
														});
													}
													break;
											}
										}
									}
									break;
								}
								case "string": {
									const regex = parameter.validations.find(
										(v) =>
											v.validation_regex !== null && v.validation_regex !== "",
									);
									if (!regex || !regex.validation_regex) {
										return true;
									}

									if (val && !new RegExp(regex.validation_regex).test(val)) {
										return ctx.createError({
											path: ctx.path,
											message: parameterError(parameter, val),
										});
									}
									break;
								}
							}
						}
						return true;
					}),
			}),
		)
		.required();
};

const parameterError = (
	parameter: Parameter,
	value?: string,
): string | undefined => {
	const validation_error = parameter.validations.find(
		(v) => v.validation_error !== null,
	);
	const minValidation = parameter.validations.find(
		(v) => v.validation_min !== null,
	);
	const maxValidation = parameter.validations.find(
		(v) => v.validation_max !== null,
	);

	if (!validation_error || !value) {
		return;
	}

	const r = new Map<string, string>([
		[
			"{min}",
			minValidation ? (minValidation.validation_min?.toString() ?? "") : "",
		],
		[
			"{max}",
			maxValidation ? (maxValidation.validation_max?.toString() ?? "") : "",
		],
		["{value}", value],
	]);
	return validation_error.validation_error.replace(
		/{min}|{max}|{value}/g,
		(match) => r.get(match) || "",
	);
};

interface DiagnosticsProps {
	diagnostics: Parameter["diagnostics"];
}

// Displays a diagnostic with a border, icon and background color
const Diagnostics: FC<DiagnosticsProps> = ({ diagnostics }) => {
	return (
		<div className="flex flex-col gap-4">
			{diagnostics.map((diagnostic, index) => (
				<div
					key={`diagnostic-${diagnostic.summary}-${index}`}
					className={`flex flex-col rounded-md border border-solid px-3.5 py-3.5 font-semibold text-xs ${
						diagnostic.severity === "error"
							? "border-border-destructive bg-content-destructive/15 text-content-primary"
							: "border-border-warning bg-content-warning/15 text-content-primary"
					}`}
				>
					<div className="flex flex-row items-start">
						{diagnostic.severity === "error" && (
							<CircleAlert
								className="me-2 inline-flex size-icon-sm shrink-0 text-content-destructive"
								aria-hidden="true"
							/>
						)}
						{diagnostic.severity === "warning" && (
							<TriangleAlert
								className="me-2 inline-flex size-icon-sm shrink-0 text-content-warning"
								aria-hidden="true"
							/>
						)}
						<div className="flex flex-col gap-3">
							<p className="m-0">{diagnostic.summary}</p>
							{diagnostic.detail && <p className="m-0">{diagnostic.detail}</p>}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

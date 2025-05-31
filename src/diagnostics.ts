import type { FriendlyDiagnostic, Parameter, PreviewOutput } from "./gen/types";

type FriendlyDiagnosticWithoutKind = Omit<FriendlyDiagnostic, "extra">;

export type ParameterDiagnostic = {
	kind: "parameter";
	parameterName: string;
} & FriendlyDiagnosticWithoutKind;

export type TopLevelDiagnostic = {
	kind: "top-level";
} & FriendlyDiagnosticWithoutKind;

export type InternalDiagnostic = {
	kind: "internal";
} & FriendlyDiagnosticWithoutKind;

export type Diagnostic =
	| ParameterDiagnostic
	| TopLevelDiagnostic
	| InternalDiagnostic;

export const outputToDiagnostics = (output: PreviewOutput): Diagnostic[] => {
	const parameterDiags = (output.output?.Parameters ?? []).flatMap(
		parameterToDiagnostics,
	);

	const topLevelDiags: TopLevelDiagnostic[] = output.diags
		.filter((d) => d !== null)
		.map((d) => ({
			kind: "top-level",
			...d,
		}));

	return [...topLevelDiags, ...parameterDiags];
};

const parameterToDiagnostics = (parameter: Parameter): ParameterDiagnostic[] =>
	parameter.diagnostics
		.filter((d) => d !== null)
		.map((d) => ({
			kind: "parameter",
			parameterName: parameter.name,
			...d,
		}));

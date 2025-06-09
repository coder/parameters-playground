import type {
	FriendlyDiagnostic,
	ParserLog,
	PreviewOutput,
} from "@/gen/types";

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
	const topLevelDiags: TopLevelDiagnostic[] = output.diags
		.filter((d) => d !== null)
		.map((d) => ({
			kind: "top-level",
			...d,
		}));
	const diagsFromLogs = logsToDiagnostics(output.parser_logs ?? []);

	return [...diagsFromLogs, ...topLevelDiags];
};

const logsToDiagnostics = (logs: ParserLog[]): TopLevelDiagnostic[] =>
	logs
		// Non-error level logs seem to either be redundant with given diagnostics or
		// not useful so for now we filter them out
		.filter((log) => log.level === "ERROR")
		.map((log) => ({
			kind: "top-level",
			severity: log.level,
			summary: log.msg,
			detail: log.err,
		}));

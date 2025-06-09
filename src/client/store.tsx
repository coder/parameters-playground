import { create } from "zustand";
import type { Diagnostic } from "@/client/diagnostics";
import type { Parameter } from "@/gen/types";

const defaultCode = `terraform {
  required_providers {
    coder = {
      source = "coder/coder"
    }
  }
}`;

type FormState = Record<string, string>;

type WasmState = "loaded" | "loading" | "error";

type ErrorsState = {
	diagnostics: Diagnostic[];
	show: boolean;
};
const defaultErrorsState: ErrorsState = {
	diagnostics: [],
	show: true,
};

type State = {
	code: string;
	parameters: Parameter[];
	form: FormState;
	wasmState: WasmState;
	errors: ErrorsState;
	setCode: (code: string) => void;
	setError: (diagnostics: Diagnostic[]) => void;
	toggleShowError: (open?: boolean) => void;
	setWasmState: (wasmState: WasmState) => void;
	setParameters: (parameters: Parameter[]) => void;
	setFormState: (key: string, value: string) => void;
	resetForm: () => void;
};

export const useStore = create<State>()((set) => ({
	code: window.CODE ?? defaultCode,
	parameters: [],
	wasmState: "loading",
	form: {},
	errors: defaultErrorsState,
	setCode: (code) => set((_) => ({ code })),
	setError: (data) =>
		set((state) => {
			const errors = state.errors ?? defaultErrorsState;
			return {
				errors: { ...errors, diagnostics: data },
			};
		}),
	toggleShowError: (open) =>
		set((state) => {
			const errors = state.errors ?? defaultErrorsState;
			return {
				errors: {
					...errors,
					show: open !== undefined ? open : !errors.show,
				},
			};
		}),
	setWasmState: (wasmState) => set((_) => ({ wasmState })),
	setParameters: (parameters) => set((_) => ({ parameters })),
	setFormState: (key, value) =>
		set((state) => {
			const form = { ...state.form };
			form[key] = value;

			return { form };
		}),
	resetForm: () => set(() => ({ form: {} })),
}));

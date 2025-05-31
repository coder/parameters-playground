import { create } from "zustand";
import type { Diagnostic } from "@/diagnostics";

const defaultCode = `terraform {
  required_providers {
    coder = {
      source = "coder/coder"
    }
  }
}`;

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
	wasmState: WasmState;
	errors: ErrorsState;
	setCode: (code: string) => void;
	setError: (diagnostics: Diagnostic[]) => void;
	toggleShowError: (open?: boolean) => void;
	setWasmState: (wasmState: WasmState) => void;
};

export const useStore = create<State>()((set) => ({
	code: defaultCode,
	wasmState: "loading",
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
}));

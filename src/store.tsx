import { create } from "zustand";

const defaultCode = `terraform {
  required_providers {
    coder = {
      source = "coder/coder"
    }
  }
}`;

type WasmState = "loaded" | "loading" | "error";

type State = {
	code: string;
	wasmState: WasmState;
	error?: {
		message?: string;
		show: boolean;
	};
	setCode: (code: string) => void;
	setError: (error: string) => void;
	toggleShowError: () => void;
	setWasmState: (wasmState: WasmState) => void;
};

export const useStore = create<State>()((set) => ({
	code: defaultCode,
	wasmState: "loading",
	// error: {
	// 	message: "wibble: wobble",
	// 	show: false,
	// },
	setCode: (code) => set((_) => ({ code })),
	setError: (message) =>
		set((state) => {
			// If there is currently no error, then we want to show this new error
			const error = state.error ?? { show: true };

			return {
				error: { ...error, message },
			};
		}),
	toggleShowError: () =>
		set((state) => {
			return {
				error: {
					show: !(state.error?.show ?? true),
					message: state.error?.message ?? "",
				},
			};
		}),
	setWasmState: (wasmState) => set((_) => ({ wasmState })),
}));

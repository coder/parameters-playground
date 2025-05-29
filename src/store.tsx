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
		message: string;
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
	error: {
		message: "wibble: wobble",
		show: true,
	},
	setCode: (code) => set((_) => ({ code })),
	setError: (message) =>
		set((state) => ({ error: { message, show: state.error?.show ?? false } })),
	toggleShowError: () =>
		set((state) => ({
			error: { show: !state.error?.show, message: state.error?.message ?? "" },
		})),
	setWasmState: (wasmState) => set((_) => ({ wasmState })),
}));

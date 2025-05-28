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
	error?: string;
	setCode: (code: string) => void;
	setError: (error: string) => void;
	setWasmState: (wasmState: WasmState) => void;
};

export const useStore = create<State>()((set) => ({
	code: defaultCode,
	wasmState: "loading",
	setCode: (code) => set((_) => ({ code })),
	setError: (error) => set((_) => ({ error })),
	setWasmState: (wasmState) => set((_) => ({ wasmState })),
}));

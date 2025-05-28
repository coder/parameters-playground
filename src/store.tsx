import { create } from "zustand";

const defaultCode = `terraform {
  required_providers {
    coder = {
      source = "coder/coder"
    }
  }
}`;

type State = {
	code: string;
	isWasmLoaded: boolean;
	error?: string;
	setCode: (code: string) => void;
	setError: (error: string) => void;
	setIsWasmLoaded: (isWasmLoaded: boolean) => void;
};

export const useStore = create<State>()((set) => ({
	code: defaultCode,
	isWasmLoaded: false,
	setCode: (code) => set((_) => ({ code })),
	setError: (error) => set((_) => ({ error })),
	setIsWasmLoaded: (isWasmLoaded) => set((_) => ({ isWasmLoaded })),
}));

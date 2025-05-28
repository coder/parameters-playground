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
	error?: string;
	setCode: (code: string) => void;
	setError: (error: string) => void;
};

export const useStore = create<State>()((set) => ({
	code: defaultCode,
	setCode: (code) => set((_) => ({ code })),
	setError: (error) => set((_) => ({ error })),
}));


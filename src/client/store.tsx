import type { Diagnostic } from "@/client/diagnostics";
import type { editor } from "monaco-editor";
import { create } from "zustand";
import { defaultCode } from "./snippets";
import { mockUsers } from "@/owner";

type ErrorsState = {
	diagnostics: Diagnostic[];
	show: boolean;
};
const defaultErrorsState: ErrorsState = {
	diagnostics: [],
	show: true,
};

type State = {
	editor: editor.IStandaloneCodeEditor | null;
	errors: ErrorsState;
	setError: (diagnostics: Diagnostic[]) => void;
	toggleShowError: (open?: boolean) => void;
	setEditor: (editor: editor.IStandaloneCodeEditor) => void;
};

export const useStore = create<State>()((set) => ({
	code: window.CODE ?? defaultCode,
	editor: null,
	owner: mockUsers.admin,
	errors: defaultErrorsState,
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
	setEditor: (editor) => set(() => ({ editor })),
}));

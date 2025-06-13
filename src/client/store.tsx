import type { Diagnostic } from "@/client/diagnostics";
import type { WorkspaceOwner } from "@/gen/types";
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
	owner: WorkspaceOwner;
	errors: ErrorsState;
	setError: (diagnostics: Diagnostic[]) => void;
	toggleShowError: (open?: boolean) => void;
	setEditor: (editor: editor.IStandaloneCodeEditor) => void;
	setWorkspaceOwner: (owner: WorkspaceOwner) => void;
};

export const useStore = create<State>()((set) => ({
	_force: 0,
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
	setWorkspaceOwner: (owner) =>
		set((state) => ({
			...state,
			owner,
			form: {},
		})),
}));

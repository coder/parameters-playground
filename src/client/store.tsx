import type { Diagnostic } from "@/client/diagnostics";
import type { ParameterWithSource, WorkspaceOwner } from "@/gen/types";
import type { editor } from "monaco-editor";
import { create } from "zustand";
import { defaultCode } from "./snippets";
import { mockUsers } from "@/owner";

export type FormState = Record<string, string>;

type ErrorsState = {
	diagnostics: Diagnostic[];
	show: boolean;
};
const defaultErrorsState: ErrorsState = {
	diagnostics: [],
	show: true,
};

type State = {
	_force: number;
	editor: editor.IStandaloneCodeEditor | null;
	parameters: ParameterWithSource[];
	form: FormState;
	owner: WorkspaceOwner;
	errors: ErrorsState;
	setError: (diagnostics: Diagnostic[]) => void;
	toggleShowError: (open?: boolean) => void;
	setParameters: (parameters: ParameterWithSource[]) => void;
	setFormState: (key: string, value: string) => void;
	setEditor: (editor: editor.IStandaloneCodeEditor) => void;
	setWorkspaceOwner: (owner: WorkspaceOwner) => void;
	resetForm: () => void;
};

export const useStore = create<State>()((set) => ({
	_force: 0,
	code: window.CODE ?? defaultCode,
	editor: null,
	parameters: [],
	wasmState: "loading",
	owner: mockUsers.admin,
	form: {},
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
	setParameters: (parameters) => set((_) => ({ parameters })),
	setFormState: (key, value) =>
		set((state) => {
			const form = { ...state.form };
			form[key] = value;

			return { form };
		}),
	resetForm: () =>
		set((state) => ({
			form: {},
			_force: state._force + 1,
		})),
	setEditor: (editor) => set(() => ({ editor })),
	setWorkspaceOwner: (owner) =>
		set((state) => ({
			...state,
			owner,
			_force: state._force + 1,
			form: {},
			parameters: [...state.parameters],
		})),
}));

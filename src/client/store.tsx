import type { editor } from "monaco-editor";
import { create } from "zustand";

type State = {
	editor: editor.IStandaloneCodeEditor | null;
};

export const useStore = create<State>()(() => ({
	editor: null,
}));

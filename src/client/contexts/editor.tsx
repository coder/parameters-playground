import type { editor as monaco } from "monaco-editor";
import {
	type FC,
	type PropsWithChildren,
	createContext,
	useContext,
	useRef,
} from "react";

type EditorContext =
	React.RefObject<monaco.IStandaloneCodeEditor | null> | null;

const EditorContext = createContext<EditorContext>(null);

export const EditorProvider: FC<PropsWithChildren> = ({ children }) => {
	const editor = useRef<monaco.IStandaloneCodeEditor>(null);

	return (
		<EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
	);
};

export const useEditor = () => {
	const editor = useContext(EditorContext);

	if (!editor) {
		throw new Error("useEditor must eb used within an EditorProvider");
	}

	return editor;
};

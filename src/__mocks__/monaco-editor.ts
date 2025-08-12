import { vi } from "vitest";

const editor = {
  defineTheme: vi.fn(),
  create: vi.fn(() => ({
    dispose: vi.fn(),
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    onDidChangeModelContent: vi.fn(),
    getModel: vi.fn(),
    setModel: vi.fn(),
    layout: vi.fn(),
  })),
};

const monaco = {
  editor,
  languages: {
    register: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
    setLanguageConfiguration: vi.fn(),
  },
};

export default monaco;

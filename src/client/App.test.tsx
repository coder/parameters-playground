import type { EditorProps } from "@monaco-editor/react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { FC } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/client/App";
import { EditorProvider } from "@/client/contexts/editor";
import { ThemeProvider } from "@/client/contexts/theme";
import attachGPUExample from "@/examples/code/attach-gpu.tf?raw";
import defaultExample from "@/examples/code/default.tf?raw";
import { initWasm } from "@/utils/wasm";

vi.mock("@/utils/wasm", async () => {
	const { getDynamicParametersOutput } = await import("@/utils/wasm");
	return {
		initWasm: vi
			.fn<typeof initWasm>(async () => {
				window.go_preview = vi.fn(async () => {
					return JSON.stringify({});
				});

				return "loaded";
			})
			.mockResolvedValue("loaded"),
		getDynamicParametersOutput: vi.fn(getDynamicParametersOutput),
	};
});

vi.mock("@monaco-editor/react", () => ({
	Editor: ({ value, onChange, ...props }: EditorProps) => (
		<textarea
			data-testid="monaco-editor"
			value={value}
			onChange={(e) => {
				onChange?.(e.target.value, {
					changes: [],
					eol: "\n",
					versionId: 1,
					isUndoing: false,
					isRedoing: false,
					isFlush: false,
					isEolChange: false,
				});
			}}
			{...props}
		/>
	),
}));

const router = createBrowserRouter([
	{
		path: "*",
		Component: App,
	},
]);

const TestApp: FC = () => {
	return (
		<ThemeProvider>
			<TooltipProvider>
				<EditorProvider>
					<RouterProvider router={router} />
				</EditorProvider>
			</TooltipProvider>
		</ThemeProvider>
	);
};

describe("App - Initial State Setup", () => {
	beforeEach(() => {
		delete window.CODE;
		delete window.USERS;
		delete window.go_preview;
		vi.clearAllMocks();
	});
	afterEach(() => {
		cleanup();
	});

	it("should show the loading modal while the wasm module is loading, and not show it once it has been loaded", async () => {
		render(<TestApp />);

		await waitFor(() => {
			expect(screen.getByText("Loading assets"));
		});

		await waitFor(async () => {
			expect(initWasm).toHaveBeenCalled();
		});

		expect(screen.queryByTestId("wasm-loading-modal")).toBeNull();
		expect(screen.queryByTestId("wasm-error-modal")).toBeNull();
	});

	it("should call initWasm", async () => {
		render(<TestApp />);

		await waitFor(() => {
			expect(initWasm).toHaveBeenCalled();
		});
	});

	it("should use the default example if `window.CODE` is not defined", async () => {
		render(<TestApp />);

		expect(screen.findByDisplayValue(defaultExample));
	});

	it("should use the value of `window.CODE` if it is defined", async () => {
		window.CODE = attachGPUExample;
		render(<TestApp />);

		expect(screen.findByDisplayValue(attachGPUExample));
	});
});

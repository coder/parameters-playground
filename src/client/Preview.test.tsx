import { afterEach, describe, expect, it } from "vitest";
import { Preview } from "@/client/Preview";
import {
	cleanup,
	getByLabelText,
	queryAllByLabelText,
	render,
} from "@testing-library/react";
import type { FC } from "react";
import { mockUsers } from "@/user";
import { ThemeProvider } from "@/client/contexts/theme";
import { TooltipProvider } from "@/client/components/Tooltip";
import { EditorProvider } from "@/client/contexts/editor";
import {
	defaultExampleParameters,
	formTypesExampleParameters,
} from "@/client/test-data/preview";
import { createBrowserRouter, RouterProvider } from "react-router";
import { PanelGroup } from "react-resizable-panels";
import type { ParameterWithSource } from "@/gen/types";

type TestAppProps = {
	parameters: ParameterWithSource[];
};

const TestPreview: FC<TestAppProps> = ({ parameters }) => {
	return (
		<PanelGroup direction="horizontal">
			<Preview
				wasmLoadState="loaded"
				isDebouncing={false}
				onDownloadOutput={() => null}
				parameterValues={{}}
				setParameterValues={() => null}
				output={null}
				parameters={parameters}
				onReset={() => null}
				users={mockUsers}
				currentUser={mockUsers[0]}
				setUsers={() => null}
			/>
		</PanelGroup>
	);
};

const router = (parameters: ParameterWithSource[]) =>
	createBrowserRouter([
		{
			path: "*",
			Component: () => <TestPreview parameters={parameters} />,
		},
	]);

const TestApp: FC<TestAppProps> = ({ parameters }) => {
	return (
		<ThemeProvider>
			<TooltipProvider>
				<EditorProvider>
					<RouterProvider router={router(parameters)} />
				</EditorProvider>
			</TooltipProvider>
		</ThemeProvider>
	);
};

describe("Preview - Rendering", () => {
	afterEach(() => {
		cleanup();
	});

	it("should render the default example as expected", async () => {
		const page = render(<TestApp parameters={defaultExampleParameters} />);

		getByLabelText(page.container, "Pick your next parameter!*Required");

		getByLabelText(
			page.container,
			"Use imaginary experimental features?Immutable",
		);
	});

	it("should render the form type example as expected", async () => {
		const page = render(<TestApp parameters={formTypesExampleParameters} />);

		const formTypeSelects = queryAllByLabelText(
			page.container,
			"How do you want to format the options of the next parameter?Immutable",
		);
		expect(formTypeSelects).length(4);

		expect(formTypeSelects[0].innerText).toBe("Radio Selector");

		const radioGroup = getByLabelText(
			page.container,
			"Selecting a single value from a list of options.Immutable",
		);
		expect(getByLabelText(radioGroup, "Alpha").getAttribute("data-state")).toBe(
			"checked",
		);
		expect(getByLabelText(radioGroup, "Bravo").getAttribute("data-state")).toBe(
			"unchecked",
		);
		expect(
			getByLabelText(radioGroup, "Charlie").getAttribute("data-state"),
		).toBe("unchecked");

		expect(formTypeSelects[1].innerText).toBe("Raw input");

		const numberInput = getByLabelText(
			page.container,
			"What is your favorite number?Immutable",
		);
		expect(numberInput).toBeInstanceOf(HTMLInputElement);
		expect(numberInput.getAttribute("value")).toBe("7");

		expect(formTypeSelects[2].innerText).toBe("Radio");

		const doYouAgreeWithMeRadio = getByLabelText(
			page.container,
			"Do you agree with me?Immutable",
		);
		expect(
			getByLabelText(doYouAgreeWithMeRadio, "Yes").getAttribute("data-state"),
		).toBe("checked");
		expect(
			getByLabelText(doYouAgreeWithMeRadio, "No").getAttribute("data-state"),
		).toBe("unchecked");

		expect(formTypeSelects[3].innerText).toBe("Multi-Select");

		const checkbox = getByLabelText(
			page.container,
			"Did you like this demo?Immutable",
		);
		expect(checkbox.getAttribute("data-state")).toBe("unchecked");
	});
});

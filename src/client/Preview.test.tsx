import {
	cleanup,
	findByTestId,
	getByLabelText,
	queryAllByLabelText,
	render,
} from "@testing-library/react";
import type { FC } from "react";
import { PanelGroup } from "react-resizable-panels";
import { createBrowserRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { TooltipProvider } from "@/client/components/Tooltip";
import { EditorProvider } from "@/client/contexts/editor";
import { ThemeProvider } from "@/client/contexts/theme";
import { Preview } from "@/client/Preview";
import type { ParameterWithSource } from "@/gen/types";
import {
	defaultExampleParameters,
	defaultExampleParamterValues,
	formTypesExampleParameters,
} from "@/test-data/preview";
import { mockUsers } from "@/user";

type TestAppProps = {
	parameters: ParameterWithSource[];
	parameterValues?: Record<string, string>;
};

const TestPreview: FC<TestAppProps> = ({
	parameters,
	parameterValues = {},
}) => {
	return (
		<PanelGroup direction="horizontal">
			<Preview
				wasmLoadState="loaded"
				isDebouncing={false}
				onDownloadOutput={() => null}
				parameterValues={parameterValues}
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

const router = (parameters: ParameterWithSource[], parameterValues = {}) =>
	createBrowserRouter([
		{
			path: "*",
			Component: () => (
				<TestPreview
					parameters={parameters}
					parameterValues={parameterValues}
				/>
			),
		},
	]);

const TestApp: FC<TestAppProps> = ({ parameters, parameterValues }) => {
	return (
		<ThemeProvider>
			<TooltipProvider>
				<EditorProvider>
					<RouterProvider router={router(parameters, parameterValues)} />
				</EditorProvider>
			</TooltipProvider>
		</ThemeProvider>
	);
};

describe("Preview - Rendering", () => {
	afterEach(() => {
		cleanup();
	});

	it("should render the empty state when no parameters are present", async () => {
		const page = render(<TestApp parameters={[]} />);

		expect(findByTestId(page.container, "preview-empty-state"));
	});

	it("should render the default example as expected", async () => {
		const page = render(<TestApp parameters={defaultExampleParameters} />);

		getByLabelText(page.container, "Pick your next parameter!*Required");

		getByLabelText(
			page.container,
			"Use imaginary experimental features?Immutable",
		);
	});

	it("should render the form type example as with the expected default values", async () => {
		const page = render(<TestApp parameters={formTypesExampleParameters} />);

		const formTypeSelects = queryAllByLabelText(
			page.container,
			"How do you want to format the options of the next parameter?Immutable",
		);
		expect(formTypeSelects).toHaveLength(4);

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

	it("should render form elements with set values", async () => {
		const page = render(
			<TestApp 
				parameters={formTypesExampleParameters}
				parameterValues={defaultExampleParamterValues}
			/>
		);

		const formTypeSelects = queryAllByLabelText(
			page.container,
			"How do you want to format the options of the next parameter?Immutable",
		);

		expect(formTypeSelects[0].textContent).toBe("Radio Selector");

		const singleRadioGroup = getByLabelText(
			page.container,
			"Selecting a single value from a list of options.Immutable"
		);
		expect(getByLabelText(singleRadioGroup, "Alpha").getAttribute("data-state")).toBe(
			"unchecked"
		);
		expect(getByLabelText(singleRadioGroup, "Bravo").getAttribute("data-state")).toBe(
			"checked"
		);
		expect(getByLabelText(singleRadioGroup, "Charlie").getAttribute("data-state")).toBe(
			"unchecked"
		);

		const numberInput = getByLabelText(
			page.container,
			"What is your favorite number?Immutable"
		) as HTMLInputElement;
		expect(numberInput.value).toBe("48");

		const booleanRadioGroup = getByLabelText(
			page.container,
			"Do you agree with me?Immutable"
		);
		expect(getByLabelText(booleanRadioGroup, "Yes").getAttribute("data-state")).toBe(
			"unchecked"
		);
		expect(getByLabelText(booleanRadioGroup, "No").getAttribute("data-state")).toBe(
			"checked"
		);

		const likeItCheckbox = getByLabelText(
			page.container,
			"Did you like this demo?Immutable"
		);
		expect(likeItCheckbox.getAttribute("data-state")).toBe("checked");
	});
});

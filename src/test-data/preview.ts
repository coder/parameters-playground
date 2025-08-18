import type { ParameterWithSource } from "@/gen/types";

export const defaultExampleParameters: ParameterWithSource[] = [
	{
		name: "dropdown_picker",
		display_name: "Pick your next parameter!",
		description: "",
		type: "string",
		form_type: "dropdown",
		styling: {},
		mutable: true,
		default_value: {
			value: "??",
			valid: false,
		},
		icon: "",
		options: [
			{
				name: "IDE multi-select",
				description: "",
				value: {
					value: "ide_picker",
					valid: true,
				},
				icon: "",
			},
			{
				name: "Large text entry",
				description: "",
				value: {
					value: "text_area",
					valid: true,
				},
				icon: "",
			},
			{
				name: "CPU slider",
				description: "",
				value: {
					value: "cpu_slider",
					valid: true,
				},
				icon: "",
			},
		],
		validations: [],
		required: true,
		order: 0,
		ephemeral: false,
		value: {
			value: "data.coder_parameter.dropdown_picker.value",
			valid: false,
		},
		diagnostics: [
			{
				severity: "error",
				summary: "Required parameter not provided",
				detail: "parameter value is null",
				extra: {
					code: "required",
					Wrapped: null,
				},
			},
		],
		uuid: "e71ced83-9f02-4209-9970-74a826f37e60",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 46,
				Column: 1,
				Byte: 1024,
			},
			End: {
				Line: 46,
				Column: 5,
				Byte: 1028,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 46,
				Column: 1,
				Byte: 1024,
			},
			End: {
				Line: 46,
				Column: 41,
				Byte: 1064,
			},
		},
	},
	{
		name: "admin_only",
		display_name: "Use imaginary experimental features?",
		description:
			"This option is only available to those in the 'admin' group. You can hide it by changing your user data. \n\n _This does not actually enable experimental features._",
		type: "bool",
		form_type: "checkbox",
		styling: {},
		mutable: false,
		default_value: {
			value: "false",
			valid: true,
		},
		icon: "",
		options: [],
		validations: [],
		required: false,
		order: 5,
		ephemeral: false,
		value: {
			value: "false",
			valid: true,
		},
		diagnostics: [],
		uuid: "52a295a7-4645-4876-9e97-6b0db0411007",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 131,
				Column: 1,
				Byte: 2970,
			},
			End: {
				Line: 131,
				Column: 5,
				Byte: 2974,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 131,
				Column: 1,
				Byte: 2970,
			},
			End: {
				Line: 131,
				Column: 36,
				Byte: 3005,
			},
		},
	},
];

export const formTypesExampleParameters: ParameterWithSource[] = [
	{
		name: "single_select",
		display_name:
			"How do you want to format the options of the next parameter?",
		description: "The next parameter supports a single value.",
		type: "string",
		form_type: "dropdown",
		styling: {},
		mutable: false,
		default_value: {
			value: "radio",
			valid: true,
		},
		icon: "",
		options: [
			{
				name: "Radio Selector",
				description: "Radio selections.",
				value: {
					value: "radio",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Dropdown Selector",
				description: "Dropdown selections.",
				value: {
					value: "dropdown",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Raw Input",
				description: "Input whatever you want.",
				value: {
					value: "input",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Multiline input",
				description: "A larger text area.",
				value: {
					value: "textarea",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
		],
		validations: [],
		required: false,
		order: 10,
		ephemeral: false,
		value: {
			value: "radio",
			valid: true,
		},
		diagnostics: [],
		uuid: "34269313-6069-4720-83f7-8b5b6931f050",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 34,
				Column: 1,
				Byte: 655,
			},
			End: {
				Line: 34,
				Column: 5,
				Byte: 659,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 34,
				Column: 1,
				Byte: 655,
			},
			End: {
				Line: 34,
				Column: 39,
				Byte: 693,
			},
		},
	},
	{
		name: "single",
		display_name: "Selecting a single value from a list of options.",
		description:
			"Change the formatting of this parameter with the param above.",
		type: "string",
		form_type: "radio",
		styling: {},
		mutable: false,
		default_value: {
			value: "alpha-value",
			valid: true,
		},
		icon: "/emojis/0031-fe0f-20e3.png",
		options: [
			{
				name: "Alpha",
				description: "This is option one",
				value: {
					value: "alpha-value",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Bravo",
				description: "This is option two",
				value: {
					value: "bravo-value",
					valid: true,
				},
				icon: "/emojis/0032-fe0f-20e3.png",
			},
			{
				name: "Charlie",
				description: "This is option three",
				value: {
					value: "charlie-value",
					valid: true,
				},
				icon: "/emojis/0033-fe0f-20e3.png",
			},
		],
		validations: [],
		required: false,
		order: 11,
		ephemeral: false,
		value: {
			value: "alpha-value",
			valid: true,
		},
		diagnostics: [],
		uuid: "3cb3eee0-d348-4ba6-b25b-cbc6150f607b",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 72,
				Column: 1,
				Byte: 1639,
			},
			End: {
				Line: 72,
				Column: 5,
				Byte: 1643,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 72,
				Column: 1,
				Byte: 1639,
			},
			End: {
				Line: 72,
				Column: 32,
				Byte: 1670,
			},
		},
	},
	{
		name: "number_format",
		display_name:
			"How do you want to format the options of the next parameter?",
		description: "The next parameter supports numerical values.",
		type: "string",
		form_type: "dropdown",
		styling: {},
		mutable: false,
		default_value: {
			value: "input",
			valid: true,
		},
		icon: "",
		options: [
			{
				name: "Slider",
				description: "Slider.",
				value: {
					value: "slider",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Raw input",
				description: "Type in a number.",
				value: {
					value: "input",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
		],
		validations: [],
		required: false,
		order: 20,
		ephemeral: false,
		value: {
			value: "input",
			valid: true,
		},
		diagnostics: [],
		uuid: "4248ca2c-cb54-474b-919a-2e6660df1d46",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 93,
				Column: 1,
				Byte: 2401,
			},
			End: {
				Line: 93,
				Column: 5,
				Byte: 2405,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 93,
				Column: 1,
				Byte: 2401,
			},
			End: {
				Line: 93,
				Column: 39,
				Byte: 2439,
			},
		},
	},
	{
		name: "number",
		display_name: "What is your favorite number?",
		description:
			"Change the formatting of this parameter with the param above.",
		type: "number",
		form_type: "input",
		styling: {},
		mutable: false,
		default_value: {
			value: "7",
			valid: true,
		},
		icon: "/emojis/0031-fe0f-20e3.png",
		options: [],
		validations: [
			{
				validation_error: "Value {value} is not between {min} and {max}",
				validation_regex: null,
				validation_min: 0,
				validation_max: 100,
				validation_monotonic: null,
			},
		],
		required: false,
		order: 21,
		ephemeral: false,
		value: {
			value: "7",
			valid: true,
		},
		diagnostics: [],
		uuid: "5666c3b9-d306-41ce-9f8a-0e6fa5adb443",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 117,
				Column: 1,
				Byte: 3024,
			},
			End: {
				Line: 117,
				Column: 5,
				Byte: 3028,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 117,
				Column: 1,
				Byte: 3024,
			},
			End: {
				Line: 117,
				Column: 32,
				Byte: 3055,
			},
		},
	},
	{
		name: "boolean_format",
		display_name:
			"How do you want to format the options of the next parameter?",
		description: "The next parameter supports boolean values.",
		type: "string",
		form_type: "dropdown",
		styling: {},
		mutable: false,
		default_value: {
			value: "radio",
			valid: true,
		},
		icon: "",
		options: [
			{
				name: "Radio",
				description: "Radio.",
				value: {
					value: "radio",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Switch",
				description: "Switch.",
				value: {
					value: "switch",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Checkbox",
				description: "Checkbox.",
				value: {
					value: "checkbox",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
		],
		validations: [],
		required: false,
		order: 30,
		ephemeral: false,
		value: {
			value: "radio",
			valid: true,
		},
		diagnostics: [],
		uuid: "f267334d-0b2c-49c8-86cc-b6eacf26e62d",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 134,
				Column: 1,
				Byte: 3495,
			},
			End: {
				Line: 134,
				Column: 5,
				Byte: 3499,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 134,
				Column: 1,
				Byte: 3495,
			},
			End: {
				Line: 134,
				Column: 40,
				Byte: 3534,
			},
		},
	},
	{
		name: "boolean",
		display_name: "Do you agree with me?",
		description: "Selecting true is the best choice.",
		type: "bool",
		form_type: "radio",
		styling: {},
		mutable: false,
		default_value: {
			value: "true",
			valid: true,
		},
		icon: "/emojis/0031-fe0f-20e3.png",
		options: [
			{
				name: "Yes",
				description: "Yes, I agree to the terms.",
				value: {
					value: "true",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "No",
				description: "No, I do not agree to the terms.",
				value: {
					value: "false",
					valid: true,
				},
				icon: "/emojis/0032-fe0f-20e3.png",
			},
		],
		validations: [],
		required: false,
		order: 31,
		ephemeral: false,
		value: {
			value: "true",
			valid: true,
		},
		diagnostics: [],
		uuid: "25a49436-6692-4cde-bb48-628726960f88",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 182,
				Column: 1,
				Byte: 4618,
			},
			End: {
				Line: 182,
				Column: 5,
				Byte: 4622,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 182,
				Column: 1,
				Byte: 4618,
			},
			End: {
				Line: 182,
				Column: 33,
				Byte: 4650,
			},
		},
	},
	{
		name: "list_format",
		display_name:
			"How do you want to format the options of the next parameter?",
		description: "The next parameter supports lists of values.",
		type: "string",
		form_type: "dropdown",
		styling: {},
		mutable: false,
		default_value: {
			value: "multi-select",
			valid: true,
		},
		icon: "",
		options: [
			{
				name: "Multi-Select",
				description: "Select multiple.",
				value: {
					value: "multi-select",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Radio",
				description: "Radio.",
				value: {
					value: "radio",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Tag Select",
				description: "Tag select.",
				value: {
					value: "tag-select",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
		],
		validations: [],
		required: false,
		order: 40,
		ephemeral: false,
		value: {
			value: "multi-select",
			valid: true,
		},
		diagnostics: [],
		uuid: "6e9693e9-efa3-417a-9d81-26f786934f8c",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 203,
				Column: 1,
				Byte: 5249,
			},
			End: {
				Line: 203,
				Column: 5,
				Byte: 5253,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 203,
				Column: 1,
				Byte: 5249,
			},
			End: {
				Line: 203,
				Column: 37,
				Byte: 5285,
			},
		},
	},
	{
		name: "list",
		display_name: "What colors are the best?",
		description: "Select a few if you want.",
		type: "list(string)",
		form_type: "multi-select",
		styling: {},
		mutable: false,
		default_value: {
			value: '["blue","green"]',
			valid: true,
		},
		icon: "/emojis/0031-fe0f-20e3.png",
		options: [
			{
				name: "Red",
				description: "The color of blood.",
				value: {
					value: "red",
					valid: true,
				},
				icon: "/emojis/0031-fe0f-20e3.png",
			},
			{
				name: "Orange",
				description: "The color of oranges.",
				value: {
					value: "orange",
					valid: true,
				},
				icon: "/emojis/0032-fe0f-20e3.png",
			},
			{
				name: "Yellow",
				description: "The color of the sun.",
				value: {
					value: "yellow",
					valid: true,
				},
				icon: "/emojis/0033-fe0f-20e3.png",
			},
			{
				name: "Green",
				description: "The color of grass.",
				value: {
					value: "green",
					valid: true,
				},
				icon: "/emojis/0034-fe0f-20e3.png",
			},
			{
				name: "Blue",
				description: "The color of the sky.",
				value: {
					value: "blue",
					valid: true,
				},
				icon: "/emojis/0035-fe0f-20e3.png",
			},
			{
				name: "Purple",
				description: "The color of royalty.",
				value: {
					value: "purple",
					valid: true,
				},
				icon: "/emojis/0036-fe0f-20e3.png",
			},
		],
		validations: [],
		required: false,
		order: 41,
		ephemeral: false,
		value: {
			value: '["blue","green"]',
			valid: true,
		},
		diagnostics: [],
		uuid: "dd78528e-4859-4d79-9428-d69f8c30aee7",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 296,
				Column: 1,
				Byte: 7585,
			},
			End: {
				Line: 296,
				Column: 5,
				Byte: 7589,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 296,
				Column: 1,
				Byte: 7585,
			},
			End: {
				Line: 296,
				Column: 30,
				Byte: 7614,
			},
		},
	},
	{
		name: "like_it",
		display_name: "Did you like this demo?",
		description: "Please check!",
		type: "bool",
		form_type: "checkbox",
		styling: {},
		mutable: false,
		default_value: {
			value: "false",
			valid: true,
		},
		icon: "",
		options: [],
		validations: [],
		required: false,
		order: 50,
		ephemeral: false,
		value: {
			value: "false",
			valid: true,
		},
		diagnostics: [],
		uuid: "22974a00-41c6-4c5b-8231-1b3ed7b85d4f",
		type_range: {
			Filename: "main.tf",
			Start: {
				Line: 319,
				Column: 1,
				Byte: 8330,
			},
			End: {
				Line: 319,
				Column: 5,
				Byte: 8334,
			},
		},
		def_range: {
			Filename: "main.tf",
			Start: {
				Line: 319,
				Column: 1,
				Byte: 8330,
			},
			End: {
				Line: 319,
				Column: 33,
				Byte: 8362,
			},
		},
	},
];

export const defaultExampleParamterValues: Record<string, string> = {
	single_select: "radio",
	single: "bravo-value",
	number_format: "input",
	number: "48",
	boolean_format: "radio",
	boolean: "false",
	list_format: "radio",
	list: JSON.stringify(["red"]),
	like_it: "true",
	satisfaction: "38",
};

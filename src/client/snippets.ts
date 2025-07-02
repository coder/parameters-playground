import {
	LetterTextIcon,
	RadioIcon,
	Rows3Icon,
	Settings2Icon,
	SquareMousePointerIcon,
	TagIcon,
	TextCursorInputIcon,
	ToggleLeftIcon,
} from "lucide-react";

export const defaultCode = `terraform {
  required_providers {
    coder = {
      source = "coder/coder"
      version = "2.5.3"
    }
  }
}`;

export type SnippetFunc = (name?: string, order?: number) => string;
type Snippet = {
	name: string;
	label: string;
	icon: typeof RadioIcon;
	snippet: SnippetFunc;
};

export const input: SnippetFunc = (
	name = "input",
	order = 1,
) => `data "coder_parameter" "text-input" {
  name         = "${name}"
  display_name = "A text input"
  description  = "This parameter can be used to input text."
  order        = ${order}

  styling   = jsonencode({
    placeholder = "A placeholder that will appear if the input value is empty"
  })

  form_type = "input"
  type      = "string"
  default   = "An input value"
}`;

export const textarea: SnippetFunc = (
	name = "textarea",
	order = 1,
) => `data "coder_parameter" "textarea" {
  name         = "${name}"
  display_name = "A textarea input"
  description  = "This parameter can be used to input multiple lines of text"
  order        = ${order}

  styling   = jsonencode({
    placeholder = "A placeholder that will appear if the input value is empty"
  })

  form_type = "textarea"
  type      = "string"
  default   = "An input value"
}`;

export const radio: SnippetFunc = (
	name = "radio",
	order = 1,
) => `data "coder_parameter" "radio" {
  name         = "${name}"
  display_name = "A radio input"
  description  = "This parameter supports selecting a single value out of a list of options"
  order        = ${order}

  type      = "string"
  form_type = "radio"
  default   = "option-1"

  option {
    name        = "Option 1"
    value       = "option-1"
    description = "A description for Option 1"
  }

  option {
    name        = "Option 2"
    value       = "option-2"
    description = "A description for Option 2"
  }

  option {
    name        = "Option 3"
    value       = "option-3"
    description = "A description for Option 3"
  }

  option {
    name        = "Option 4"
    value       = "option-4"
    description = "A description for Option 4"
  }
}`;

export const dropdown: SnippetFunc = (
	name = "dropdown",
	order = 1,
) => `data "coder_parameter" "dropdown" {
  name         = "${name}"
  display_name = "A dropdown input"
  description  = "This parameter supports selecting a single value out of a list of options. Especially useful when you have a lot of options."
  order        = ${order}

  styling   = jsonencode({
    placeholder = "A placeholder that will appear if the input value is empty"
  })

  type      = "string"
  form_type = "dropdown"
  default   = "option-1"

  option {
    name        = "Option 1"
    value       = "option-1"
    description = "A description for Option 1"
  }

  option {
    name        = "Option 2"
    value       = "option-2"
    description = "A description for Option 2"
  }

  option {
    name        = "Option 3"
    value       = "option-3"
    description = "A description for Option 3"
  }

  option {
    name        = "Option 4"
    value       = "option-4"
    description = "A description for Option 4"
  }
}`;

export const multiSelect: SnippetFunc = (
	name = "multi-select",
	order = 1,
) => `data "coder_parameter" "multi-select" {
  name         = "${name}"
  display_name = "A multi-select input"
  description  = "This parameter supports selecting multiple values from a list of options"
  order        = ${order}

  type         = "list(string)"
  form_type    = "multi-select"

  option {
    name        = "Option 1"
    value       = "option-1"
    description = "A description for Option 1"
  }

  option {
    name        = "Option 2"
    value       = "option-2"
    description = "A description for Option 2"
  }

  option {
    name        = "Option 3"
    value       = "option-3"
    description = "A description for Option 3"
  }

  option {
    name        = "Option 4"
    value       = "option-4"
    description = "A description for Option 4"
  }
}`;

export const tagSelect: SnippetFunc = (
	name = "tag-select",
	order = 1,
) => `data "coder_parameter" "tag-select" {
  name         = "${name}"
  display_name = "A tag-select input"
  description  = "This parameter supports selecting multiple user inputed values at once"
  order        = ${order}

  type         = "list(string)"
  form_type    = "tag-select"
}`;

export const switchInput: SnippetFunc = (
	name = "switch",
	order = 1,
) => `data "coder_parameter" "switch" {
  name         = "${name}"
  display_name = "A switch input"
  description  = "This parameter can be toggled between true and false"
  order        = ${order}

  type         = "bool"
  form_type    = "switch"
  default      = true
}`;

export const slider: SnippetFunc = (
	name = "slider",
	order = 1,
) => `data "coder_parameter" "slider" {
  name         = "${name}"
  display_name = "A slider input"
  description  = "This parameter supports selecting a number within a given range"
  type         = "number"
  form_type    = "slider"
  default      = 6
  order        = ${order}

  validation {
    min = 1
    max = 10
  }
}`;

export const snippets: Snippet[] = [
	{
		name: "text-input",
		label: "Text Input",
		icon: TextCursorInputIcon,
		snippet: input,
	},
	{
		name: "textarea",
		label: "Textarea",
		icon: LetterTextIcon,
		snippet: textarea,
	},
	{
		name: "radio",
		label: "Radio",
		icon: RadioIcon,
		snippet: radio,
	},
	{
		name: "switch",
		label: "Multi-select",
		icon: SquareMousePointerIcon,
		snippet: multiSelect,
	},
	{
		name: "tag-select",
		label: "Tag-select",
		icon: TagIcon,
		snippet: tagSelect,
	},
	{
		name: "switch",
		label: "Switch",
		icon: ToggleLeftIcon,
		snippet: switchInput,
	},
	{
		name: "dropdown",
		label: "Dropdown",
		icon: Rows3Icon,
		snippet: dropdown,
	},
	{
		name: "slider",
		label: "Slider",
		icon: Settings2Icon,
		snippet: slider,
	},
];

export const checkerModule = `
variable "solutions" {
  type = map(list(string))
}
variable "guess" {
  type = list(string)
}
locals {
# [for connection, solution in local.solutions : connection if (length(setintersection(solution, jsondecode(data.coder_parameter.rows["yellow"].value))) == 4)]
  diff = [for connection, solution in var.solutions : {
    connection = connection
    distance = 4 - length(setintersection(solution, var.guess))
  }]
  solved = [for diff in local.diff : diff.connection if diff.distance == 0]
  one_away = [for diff in local.diff : diff.connection if diff.distance == 1]
  description = length(local.one_away) == 1 && length(var.guess) == 4 ? "One away..." : (
      length(local.solved) == 1 ? "Solved!" : (
      "Select 4 words that share a common connection."
    )
  )
}
output "out" {
  value = local.one_away
}
output "title" {
  value = length(local.solved) == 1 ? "\${local.solved[0]}" : "??"
}
output "description" {
  value = local.description
}
output "solved" {
  value = length(local.solved) == 1 ? true : false
}
`;

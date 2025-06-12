export const defaultCode = `terraform {
  required_providers {
    coder = {
      source = "coder/coder"
      version = "2.5.3"
    }
  }
}`;

export const textInput = `data "coder_parameter" "project-name" {
  display_name = "An input"
  name         = "an-input"
  description  = "What is the name of your project?"
  order        = 4

  form_type = "input"
  type      = "string"
  default   = "An input value"
}`;

export const radio = `data "coder_parameter" "radio" {
  name         = "radio"
  display_name = "An example of a radio input"
  description  = "The next parameter supports a single value."
  type         = "string"
  form_type    = "radio"
  order        = 1
  default      = "option-1"

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

export const multiSelect = `data "coder_parameter" "multi-select" {
  name         = "multi-select"
  display_name = "An example of a multi-select"
  description  = "The next parameter supports multiple values."
  type         = "list(string)"
  form_type    = "multi-select"
  order        = 1

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

export const switchInput = `data "coder_parameter" "switch" {
  name         = "switch"
  display_name = "An example of a switch"
  description  = "The next parameter can be on or off"
  type         = "bool"
  form_type    = "switch"
  defalt       = true
  order        = 1
}`

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

terraform {
  required_providers {
    coder = {
      source = "coder/coder"
      version = "2.5.3"
    }
  }
}

data "coder_workspace_owner" "me" {}
data "coder_workspace" "me" {}


locals {
  roles = [for r in data.coder_workspace_owner.me.rbac_roles: r.name]
  isAdmin = contains(data.coder_workspace_owner.me.groups, "admin")
}


data "coder_parameter" "admin" {
  count        = local.isAdmin ? 1 : 0
  name         = "admin"
  display_name = "!! Administrator Only !!"
  description  = <<EOM
Welcome to your advanced settings!

EOM

  type         = "string"
  form_type    = "input"
  default       = "c2104aa19e17cd54287f8e0e770952fba194a4b32ff2ac891ffd900249873dbf"
  order        = 10
}

data "coder_parameter" "see_player" {
  name         = "see_player"
  display_name = "See the player"
  type         = "bool"
  form_type    = "switch"
  default       = false
  order        = 2
}

data "coder_parameter" "player" {
  count        = data.coder_parameter.see_player.value ? 1 : 0
  name         = "player"
  display_name = "Dynamic parameters knows who you are!"
  description  = <<EOM
### Dynamic parameters knows who you are!

| Username  |   |
|-----------|---|
| Full Name | ${data.coder_workspace_owner.me.full_name}   |
| Email  | ${data.coder_workspace_owner.me.email}          |
| Groups    | ${join(",", data.coder_workspace_owner.me.groups)}      |
| Roles     | ${join(",", local.roles)}  |

EOM

  type         = "string"
  form_type    = "input"
  styling      = jsonencode({
    "disabled":true
  })
  default       = "You can disable input?!"
  order        = 3

  options {
    value = data.coder_workspace_owner.me.full_name
    name = data.coder_workspace_owner.me.full_name
  }
}

locals {
  ides = {
    "developer": ["VSCode", "Goland", "Cursor"]
    "contractor": ["Code-Server"]
    "admin": ["VSCode", "Goland", "Cursor", "WireShark"]
  }
}

data "coder_parameter" "multi-select" {
  name         = "multi-select"
  display_name = "Select your Coding Tools"
  description  = "Different user see different tooling options"
  type         = "list(string)"
  form_type    = "multi-select"
  order        = 4

  dynamic "option" {
    for_each = local.ides[data.coder_workspace_owner.me.groups[0]]
    content {
      name = option.value
      value = option.value
    }
  }
}


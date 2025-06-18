export default `locals {
  coder_git_repos = [
    "coder/coder", "coder/code-server", "coder/weno", "coder/preview"
  ]
  
  coder_ml_git_repos = [
    "coder/ml-nexus", "coder/models"
  ]
  
  ml_framework_options = [
    "None",  # Some users may install their own
    "PyTorch", "TensorFlow", "JAX"
  ]
}

# Repo Picker
data "coder_parameter" "git_repo" {
  name        = "Git Repo"
  description = "Select the repository to clone into your workspace."
  type        = "string"
  form_type   = "dropdown"

  dynamic "option" {
    for_each = concat(local.coder_git_repos, local.coder_ml_git_repos)
    content {
      name  = option.value
      value = option.value
    }
  }
}

data "coder_parameter" "ml_framework" {
  # Show this parameter iff git_repo is one of the ML repos
  count = contains(
    local.coder_ml_git_repos,
    try(data.coder_parameter.git_repo.value, "")
  ) ? 1 : 0

  name        = "ML Framework"
  description = "Select the primary ML framework for this project."
  type        = "string"
  form_type   = "dropdown"


  dynamic "option" {
    for_each = local.ml_framework_options
    content {
      value = replace(lower(option.value), " ", "")   # e.g. "pytorch"
      name  = option.value                            # e.g. "PyTorch"
    }
  }
}

# Now, the ML framework selected by users working on ML projects
# can be referenced during provisioning with:
#
# data.coder_parameter.ml_framework.value
#` 

package apitypes

import (
	"time"

	"github.com/hashicorp/hcl/v2"

	"github.com/coder/preview/types"
)

type ParameterFormType string

const (
	ParameterFormTypeDefault     ParameterFormType = ""
	ParameterFormTypeRadio       ParameterFormType = "radio"
	ParameterFormTypeSlider      ParameterFormType = "slider"
	ParameterFormTypeInput       ParameterFormType = "input"
	ParameterFormTypeDropdown    ParameterFormType = "dropdown"
	ParameterFormTypeCheckbox    ParameterFormType = "checkbox"
	ParameterFormTypeSwitch      ParameterFormType = "switch"
	ParameterFormTypeMultiSelect ParameterFormType = "multi-select"
	ParameterFormTypeTagSelect   ParameterFormType = "tag-select"
	ParameterFormTypeTextArea    ParameterFormType = "textarea"
	ParameterFormTypeError       ParameterFormType = "error"
)

type OptionType string

const (
	OptionTypeString     OptionType = "string"
	OptionTypeNumber     OptionType = "number"
	OptionTypeBoolean    OptionType = "bool"
	OptionTypeListString OptionType = "list(string)"
)

type PreviewOutput struct {
	Output *Output           `json:"output"`
	Diags  types.Diagnostics `json:"diags"`
	// ParserLogs are trivy logs that occur during parsing the
	// Terraform files. This is useful for debugging issues with the
	// invalid terraform syntax.
	ParserLogs []ParserLog `json:"parser_logs,omitempty"`
}

type Output struct {
	Parameters []ParameterWithSource `json:"parameters"`
	Files      map[string]*hcl.File  `json:"files"`
}

type ParserLog struct {
	Time    time.Time `json:"time"`
	Level   string    `json:"level"`
	Message string    `json:"msg"`
	Prefix  string    `json:"prefix"`
	Module  string    `json:"root"`
	Err     string    `json:"err"`
}

type NullHCLString = types.NullHCLString

type FriendlyDiagnostic = types.FriendlyDiagnostic

type ParameterWithSource struct {
	types.Parameter
	TypeRange hcl.Range `json:"type_range"`
}

func WithSource(p []types.Parameter) []ParameterWithSource {
	result := make([]ParameterWithSource, 0, len(p))
	for _, param := range p {
		src := ParameterWithSource{
			Parameter: param,
		}

		if param.Source != nil {
			src.TypeRange = param.Source.HCLBlock().TypeRange
		}

		result = append(result, src)
	}
	return result
}

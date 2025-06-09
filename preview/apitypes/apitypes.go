package apitypes

import (
	"time"

	"github.com/coder/preview"
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
	Output *preview.Output   `json:"output"`
	Diags  types.Diagnostics `json:"diags"`
	// ParserLogs are trivy logs that occur during parsing the
	// Terraform files. This is useful for debugging issues with the
	// invalid terraform syntax.
	ParserLogs []ParserLog `json:"parser_logs,omitempty"`
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

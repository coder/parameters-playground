package apitypes

import (
	"github.com/coder/preview"
	"github.com/coder/preview/types"
)

type PreviewOutput struct {
	Output *preview.Output   `json:"output"`
	Diags  types.Diagnostics `json:"diags"`
	// ParserLogs are trivy logs that occur during parsing the
	// Terraform files. This is useful for debugging issues with the
	// invalid terraform syntax.
	ParserLogs string `json:"parser_logs,omitempty"`
}

type NullHCLString = types.NullHCLString

type FriendlyDiagnostic = types.FriendlyDiagnostic

package apitypes

import (
	"time"

	"github.com/coder/preview"
	"github.com/coder/preview/types"
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

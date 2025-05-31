//go:build js && wasm

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/fs"
	"log/slog"
	"path/filepath"
	"sync"
	"syscall/js"
	"time"

	"github.com/hashicorp/hcl/v2"
	"github.com/spf13/afero"

	"github.com/coder/preview"
	"github.com/coder/preview/types"

	"github.com/coder/parameters-playground/preview/apitypes"
)

func main() {
	// Create a channel to keep the Go program alive
	done := make(chan struct{})

	// Expose the Go function `fibonacciSum` to JavaScript
	js.Global().Set("go_preview", js.FuncOf(tfpreview))
	js.Global()

	// Block the program from exiting
	<-done
}

func tfpreview(this js.Value, p []js.Value) (output any) {
	l := NewLogger()
	defer func() {
		// Return a panic as a diagnostic if one occurs.
		if r := recover(); r != nil {
			data, _ := json.Marshal(apitypes.PreviewOutput{
				Output:     nil,
				ParserLogs: l.entries,
				Diags: types.Diagnostics{
					{
						Severity: hcl.DiagError,
						Summary:  "A panic occurred",
						Detail:   fmt.Sprintf("%v", r),
						Extra:    types.DiagnosticExtra{},
					},
				},
			})

			output = js.ValueOf(string(data))
		}
	}()

	tf, err := fileTreeFS(p[0])
	if err != nil {
		return err
	}

	handler := slog.NewJSONHandler(l, nil)
	logger := slog.New(handler)
	pOutput, diags := preview.Preview(context.Background(), preview.Input{
		PlanJSONPath:    "",
		PlanJSON:        nil,
		ParameterValues: nil,
		Owner:           types.WorkspaceOwner{},
		Logger:          logger,
	}, tf)

	data, _ := json.Marshal(apitypes.PreviewOutput{
		Output:     pOutput,
		Diags:      types.Diagnostics(diags),
		ParserLogs: l.entries,
	})

	return js.ValueOf(string(data))
}

func fileTreeFS(value js.Value) (fs.FS, error) {
	data := js.Global().Get("JSON").Call("stringify", value).String()
	var filetree map[string]any
	if err := json.Unmarshal([]byte(data), &filetree); err != nil {
		return nil, err
	}

	mem := afero.NewMemMapFs()
	loadTree(mem, filetree)

	return afero.NewIOFS(mem), nil
}

func loadTree(mem afero.Fs, fileTree map[string]any, path ...string) {
	dir := filepath.Join(path...)
	err := mem.MkdirAll(dir, 0755)
	if err != nil {
		fmt.Printf("error creating directory %q: %v\n", dir, err)
	}
	for k, v := range fileTree {
		switch vv := v.(type) {
		case string:
			fn := filepath.Join(dir, k)
			f, err := mem.Create(fn)
			if err != nil {
				fmt.Printf("error creating file %q: %v\n", fn, err)
				continue
			}
			_, _ = f.WriteString(vv)
			f.Close()
		case map[string]any:
			loadTree(mem, vv, append(path, k)...)
		default:
			fmt.Printf("unknown type %T for %q\n", v, k)
		}
	}
}

type Logger struct {
	mu      sync.Mutex
	entries []apitypes.ParserLog
}

func NewLogger() *Logger {
	return &Logger{
		entries: make([]apitypes.ParserLog, 0),
	}
}

func (l *Logger) Write(p []byte) (n int, err error) {
	var entry apitypes.ParserLog
	if err := json.Unmarshal(p, &entry); err != nil {
		entry = apitypes.ParserLog{
			Time:    time.Now(),
			Level:   "unknown",
			Message: string(p),
		}
	}

	l.mu.Lock()
	l.entries = append(l.entries, entry)
	l.mu.Unlock()

	return len(p), nil
}

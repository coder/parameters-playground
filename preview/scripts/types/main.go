package main

import (
	"fmt"
	"log"

	"github.com/coder/guts"
	"github.com/coder/guts/bindings"
	"github.com/coder/guts/config"
	"golang.org/x/xerrors"
)

func main() {
	gen, err := guts.NewGolangParser()
	if err != nil {
		log.Fatalf("new convert: %v", err)
	}

	err = gen.IncludeGenerate("github.com/coder/parameters-playground/preview/apitypes")
	if err != nil {
		log.Fatalf("include generate: %v", err)
	}

	referencePackages := map[string]string{
		"github.com/coder/preview":                              "Output",
		"github.com/coder/preview/types":                        "FriendlyDiagnostic",
		"github.com/hashicorp/hcl/v2":                           "File",
		"github.com/hashicorp/hcl/v2/hclwrite":                  "Expression",
		"github.com/zclconf/go-cty/cty":                         "Value",
		"github.com/aquasecurity/trivy/pkg/iac/terraform":       "Block",
		"github.com/coder/terraform-provider-coder/v2/provider": "ParameterFormType",
		"github.com/zclconf/go-cty/cty/function":                "Function"}

	for pkg, prefix := range referencePackages {
		err = gen.IncludeReference(pkg, prefix)
		if err != nil {
			log.Fatalf("include reference package %q: %v", pkg, err)
		}
	}

	// err = gen.IncludeReference("github.com/coder/preview/types", "FriendlyDiagnostic")
	// if err != nil {
	// 	log.Fatalf("include reference package %q: %v", "github.com/coder/preview/types", err)
	// }

	err = typeMappings(gen)
	if err != nil {
		log.Fatalf("type mappings: %v", err)
	}

	ts, err := gen.ToTypescript()
	ts.ApplyMutations(config.ExportTypes)

	if err != nil {
		log.Fatalf("to typescript: %v", err)
	}

	fmt.Println(ts.Serialize())
}

func typeMappings(gen *guts.GoParser) error {
	gen.IncludeCustomDeclaration(config.StandardMappings())

	gen.IncludeCustomDeclaration(map[string]guts.TypeOverride{
		"github.com/coder/coder/v2/codersdk.NullTime": config.OverrideNullable(config.OverrideLiteral(bindings.KeywordString)),
		// opt.Bool can return 'null' if unset
		"tailscale.com/types/opt.Bool": config.OverrideNullable(config.OverrideLiteral(bindings.KeywordBoolean)),
		// hcl diagnostics should be cast to `preview.FriendlyDiagnostic`
		"github.com/hashicorp/hcl/v2.Diagnostic": func() bindings.ExpressionType {
			return bindings.Reference(bindings.Identifier{
				Name:    "FriendlyDiagnostic",
				Package: nil,
				Prefix:  "",
			})
		},
		"github.com/coder/preview/types.HCLString": func() bindings.ExpressionType {
			return bindings.Reference(bindings.Identifier{
				Name:    "NullHCLString",
				Package: nil,
				Prefix:  "",
			})
		},
	})

	err := gen.IncludeCustom(map[string]string{
		// Serpent fields should be converted to their primitive types
		"github.com/coder/serpent.Regexp":         "string",
		"github.com/coder/serpent.StringArray":    "string",
		"github.com/coder/serpent.String":         "string",
		"github.com/coder/serpent.YAMLConfigPath": "string",
		"github.com/coder/serpent.Strings":        "[]string",
		"github.com/coder/serpent.Int64":          "int64",
		"github.com/coder/serpent.Bool":           "bool",
		"github.com/coder/serpent.Duration":       "int64",
		"github.com/coder/serpent.URL":            "string",
		"github.com/coder/serpent.HostPort":       "string",
		"encoding/json.RawMessage":                "map[string]string",
	})
	if err != nil {
		return xerrors.Errorf("include custom: %w", err)
	}

	return nil
}

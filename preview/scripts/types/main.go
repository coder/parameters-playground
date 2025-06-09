package main

import (
	"fmt"
	"log"

	"github.com/coder/guts"
	"github.com/coder/guts/bindings"
	"github.com/coder/guts/config"
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
		"github.com/coder/preview":                              "",
		"github.com/coder/preview/types":                        "",
		"github.com/hashicorp/hcl/v2":                           "",
		"github.com/hashicorp/hcl/v2/hclwrite":                  "",
		"github.com/zclconf/go-cty/cty":                         "",
		"github.com/aquasecurity/trivy/pkg/iac/terraform":       "",
		"github.com/coder/terraform-provider-coder/v2/provider": "",
		"github.com/zclconf/go-cty/cty/function":                ""}

	for pkg, prefix := range referencePackages {
		err = gen.IncludeReference(pkg, prefix)
		if err != nil {
			log.Fatalf("include reference package %q: %v", pkg, err)
		}
	}

	err = typeMappings(gen)
	if err != nil {
		log.Fatalf("type mappings: %v", err)
	}

	ts, err := gen.ToTypescript()
	ts.ApplyMutations(
		config.ExportTypes,
		config.NullUnionSlices,
		config.SimplifyOmitEmpty,
		config.EnumAsTypes,
	)

	if err != nil {
		log.Fatalf("to typescript: %v", err)
	}

	output, err := ts.Serialize()
	if err != nil {
		log.Fatalf("serialize: %v", err)
	}
	_, _ = fmt.Println(output)
}

func typeMappings(gen *guts.GoParser) error {
	gen.IncludeCustomDeclaration(config.StandardMappings())

	gen.IncludeCustomDeclaration(map[string]guts.TypeOverride{
		// opt.Bool can return 'null' if unset
		"tailscale.com/types/opt.Bool": config.OverrideNullable(config.OverrideLiteral(bindings.KeywordBoolean)),
		// Replace the hcl packag's Diagnostic with preview's FriendlyDiagnostic.
		// This is needed because when the preview package's re-exported Diagnostic
		// type is marshalled it's converted into FriendlyDiagnostic.
		"github.com/hashicorp/hcl/v2.Diagnostic": func() bindings.ExpressionType {
			return bindings.Reference(bindings.Identifier{
				Name:    "FriendlyDiagnostic",
				Package: nil,
				Prefix:  "",
			})
		},
		"github.com/hashicorp/hcl/v2.Body": func() bindings.ExpressionType {
			return bindings.Reference(bindings.Identifier{
				Name:    "unknown",
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

	return nil
}

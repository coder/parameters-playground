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
		"github.com/coder/preview":                              "Output",
		"github.com/coder/preview/types":                        "Paramater",
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

	err = typeMappings(gen)
	if err != nil {
		log.Fatalf("type mappings: %v", err)
	}

	ts, err := gen.ToTypescript()
	ts.ApplyMutations(config.ExportTypes)

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
		"github.com/coder/coder/v2/codersdk.NullTime": config.OverrideNullable(config.OverrideLiteral(bindings.KeywordString)),
		// opt.Bool can return 'null' if unset
		"tailscale.com/types/opt.Bool": config.OverrideNullable(config.OverrideLiteral(bindings.KeywordBoolean)),
		"github.com/hashicorp/hcl/v2.Diagnostic": func() bindings.ExpressionType {
			return bindings.Reference(bindings.Identifier{
				Name:    "unknown",
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

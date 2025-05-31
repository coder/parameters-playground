package main

import (
	"fmt"
	"log"

	"github.com/coder/guts"
	"github.com/coder/guts/config"
)

func main() {
	gen, err := guts.NewGolangParser()
	if err != nil {
		log.Fatalf("new convert: %v", err)
	}

	err = gen.IncludeGenerateWithPrefix("github.com/coder/parameters-playground/preview/apitypes", "PreviewOutput")
	if err != nil {
		log.Fatalf("include generate: %v", err)
	}

	referencePackages := map[string]string{
		"github.com/coder/preview":                              "Output",
		"github.com/coder/preview/types":                        "Diagnostics",
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
	// err = gen.IncludeReference("github.com/hashicorp/hcl/v2", "Expression")
	// if err != nil {
	// 	log.Fatalf("include reference package %q: %v", "github.com/hashicorp/hcl/v2", "FileExpression")
	// }

	ts, err := gen.ToTypescript()
	ts.ApplyMutations(config.ExportTypes)

	if err != nil {
		log.Fatalf("to typescript: %v", err)
	}

	fmt.Println(ts.Serialize())
}

import type { ExampleSlug } from "@/examples";
import attachGpuExample from "@/examples/code/attach-gpu.tf?raw";
import basicGovExample from "@/examples/code/basic-governance.tf?raw";
import formTypesExample from "@/examples/code/form-types.tf?raw";

const codeExamples: Record<ExampleSlug, string> = {
	"attach-gpu": attachGpuExample,
	"basic-governance": basicGovExample,
	"form-types": formTypesExample,
};

// Re-export the record with a more generalized type so that we can get type
// enforcement to require that all of the possible example slugs have code
// associated with them, but not be as strict when trying to fetch the code on
// the server where it's fine if someone uses the wrong slug.
export const examples: Record<string, string> = codeExamples;

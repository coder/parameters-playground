/**
 * The code in the `src/examples` folder is split up such that client does not
 * need to import all of the examples at runtime. The other benefit is this
 * allows us store the example code in `.tf` files and use vite's raw imports
 * to load the code. Trying to do this on the client causes errors due to the
 * MIME type, and would require some custom middleware to fix. 
 */

export type ExampleSlug = "attach-gpu" | "basic-governance" | "form-types";

export type Example = {
	title: string;
	slug: ExampleSlug;
};

export const examples: Record<ExampleSlug, string> = {
	"basic-governance": "Basic Governance",
	"attach-gpu": "Attach GPU",
	"form-types": "Form Types"
}


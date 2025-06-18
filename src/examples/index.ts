import repoExample from "@/examples/repo";

type Example = {
	title: string;
	slug: string;
	code: string;
};

export const examples: Example[] = [
	{
		title: "Example 1",
		slug: "example-1",
		code: "// Example 1",
	},
	{
		title: "Example 2",
		slug: "example-2",
		code: "// Example 2",
	},
	{
		title: "Example 3",
		slug: "example-3",
		code: "// Example 3",
	},
	{
		title: "Attach GPU",
		slug: "attach-gpu",
		code: repoExample,
	},
];

import * as v from "valibot";

export const OwnerSchema = v.object({
	id: v.nullish(v.pipe(v.string()), "cc915c5a-5709-4e32-b442-9000caabd9dd"),
	name: v.string(),
	full_name: v.string(),
	email: v.string(),
	groups: v.array(v.string()),
	rbac_roles: v.array(
		v.object({
			name: v.string(),
			org_id: v.string(),
		}),
	),
	ssh_public_key: v.nullish(v.string(), ""),
	login_type: v.nullish(v.string(), "password"),
});

export type Owner = v.InferOutput<typeof OwnerSchema>;

export const baseMockUser: Owner = {
	id: "8d36e355-e775-4c49-9b8d-ac042ed50440",
	name: "coder",
	full_name: "Coder",
	email: "coder@coder.com",
	ssh_public_key: "",
	groups: ["Everyone"],
	login_type: "password",
	rbac_roles: [
		{ name: "member", org_id: "" },
		{
			name: "organization-member",
			org_id: "09942665-ba1b-4661-be9f-36bf9f738c83",
		},
	],
} satisfies Owner;

export type User =
	| "admin"
	| "developer"
	| "contractor"
	| "eu-developer"
	| "sales";

export const mockUsers: Record<User, Owner> = {
	admin: {
		...baseMockUser,
		name: "admin",
		full_name: "Admin",
		email: "admin@coder.com",
		groups: ["admin"],
		rbac_roles: [
			...baseMockUser.rbac_roles,
			{
				name: "owner",
				org_id: "",
			},
			{
				name: "organization-admin",
				org_id: "09942665-ba1b-4661-be9f-36bf9f738c83",
			},
		],
	},
	developer: {
		...baseMockUser,
		name: "developer",
		full_name: "Developer",
		email: "dev@coder.com",
		groups: ["developer"],
	},
	contractor: {
		...baseMockUser,
		name: "contractor",
		full_name: "Contractor",
		email: "contractor@coder.com",
		groups: ["contractor"],
	},
	"eu-developer": {
		...baseMockUser,
		name: "eu-developer",
		full_name: "EU Developer",
		email: "eu.dev@coder.com",
		groups: ["developer", "eu-helsinki"],
	},
	sales: {
		...baseMockUser,
		name: "sales",
		full_name: "Sales",
		email: "sales@coder.com",
		groups: ["sales"],
	},
};

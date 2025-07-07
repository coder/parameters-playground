import * as v from "valibot";
import type { WorkspaceOwner } from "@/gen/types";

export const OwnerSchema = v.object({
	id: v.string(),
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
	ssh_public_key: v.string(),
	login_type: v.string(),
}) satisfies v.GenericSchema<WorkspaceOwner>;

export type Owner = v.InferOutput<typeof OwnerSchema>;

export const emptyUser: Owner = {
	id: "54e265e8-43b2-46a7-9d1c-b612d63f57b7",
	name: "",
	full_name: "",
	email: "",
	ssh_public_key: "",
	groups: [],
	login_type: "",
	rbac_roles: [],
};

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

export const mockUsers: Owner[] = [
	{
		...baseMockUser,
		id: "f7090396-a12b-4477-b56a-eeee60d7fffa",
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
	{
		...baseMockUser,
		id: "7310a8dd-6919-43f1-a4e2-b5dd97a51a39",
		name: "developer",
		full_name: "Developer",
		email: "dev@coder.com",
		groups: ["developer"],
	},
	{
		...baseMockUser,
		id: "5d75db13-c70d-489c-b78d-aacee4fae043",
		name: "contractor",
		full_name: "Contractor",
		email: "contractor@coder.com",
		groups: ["contractor"],
	},
	{
		...baseMockUser,
		id: "2f07b3a1-119f-4ed4-a50d-0055b4bf4fcd",
		name: "eu-developer",
		full_name: "EU Developer",
		email: "eu.dev@coder.com",
		groups: ["developer", "eu-helsinki"],
	},
	{
		...baseMockUser,
		id: "23f45ca8-a2df-4ee5-801b-4cc8f1c0000f",
		name: "sales",
		full_name: "Sales",
		email: "sales@coder.com",
		groups: ["sales"],
	},
];

import type { WorkspaceOwner } from "./gen/types";

const BaseMockUser: WorkspaceOwner = {
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
};

export type User = "admin" | "developer" | "contractor" | "eu-developer";

export const mockUsers: Record<User, WorkspaceOwner> = {
	admin: {
		...BaseMockUser,
		name: "admin",
		full_name: "Admin",
		email: "admin@coder.com",
		groups: ["admin"],
	},
	developer: {
		...BaseMockUser,
		name: "developer",
		full_name: "Developer",
		email: "dev@coder.com",
		groups: ["developer"],
	},
	contractor: {
		...BaseMockUser,
		name: "contractor",
		full_name: "Contractor",
		email: "contractor@coder.com",
		groups: ["contractor"],
	},
	"eu-developer": {
		...BaseMockUser,
		name: "eu-developer",
		full_name: "EU Developer",
		email: "eu.dev@coder.com",
		groups: ["developer", "eu-helsinki"],
	},
};

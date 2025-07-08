/** biome-ignore-all lint/correctness/noChildrenProp: below
 * Tanstack Form uses the children prop which lets us keep the component flat
 * rather than having to define separate wrappers using hooks.
 */

import { useForm } from "@tanstack/react-form";
import {
	DownloadIcon,
	Ellipsis,
	PencilIcon,
	PlusIcon,
	TrashIcon,
	UploadIcon,
	XIcon,
} from "lucide-react";
import { type FC, useRef, useState } from "react";
import type { InferInput } from "valibot";
import * as v from "valibot";
import { Button } from "@/client/components/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "@/client/components/DropdownMenu";
import { Input } from "@/client/components/Input";
import { Label } from "@/client/components/Label";
import { TagInput } from "@/client/components/TagInput";
import { emptyUser, type User, UserSchema } from "@/user";
import { downloadData } from "../utils";

const UserFormSchema = v.object({
	users: v.array(UserSchema),
});
type UserForm = v.InferInput<typeof UserFormSchema>;

type UserFormProps = {
	user: User;
	onSave: (user: User) => void;
	onDelete: () => void;
};
const UserForm: FC<UserFormProps> = ({ user, onSave, onDelete }) => {
	const [isEditing, setIsEditing] = useState(user.name === "");

	const defaultValues: InferInput<typeof UserSchema> = user;
	const form = useForm({
		defaultValues,
		validators: {
			onChange: UserSchema,
		},
		onSubmitInvalid: () => {
			// TODO
		},
		onSubmit: ({ value }) => {
			setIsEditing(false);
			const owner = v.parse(UserSchema, value);
			onSave(owner);
		},
	});

	if (!isEditing) {
		return (
			<div className="flex w-full items-center justify-between rounded-lg border px-4 py-3">
				<div className="flex flex-col">
					<p className="text-content-primary">{user.full_name}</p>
					<p className="text-content-secondary text-xs">
						{[
							user.email,
							...user.groups,
							...user.rbac_roles.map(({ name }) => name),
						].join(" • ")}
					</p>
				</div>
				<Button variant="subtle" size="icon" onClick={() => setIsEditing(true)}>
					<PencilIcon />
				</Button>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col gap-5 rounded-lg border p-5">
			<div className="flex w-full items-center justify-between">
				<h2 className="font-semibold text-content-primary text-xl">
					User Data
				</h2>
				<div className="flex gap-1">
					<Button
						size="icon"
						variant="subtle"
						onClick={(e) => {
							e.preventDefault();
							onDelete();
						}}
					>
						<TrashIcon />
					</Button>
					<Button
						size="icon"
						variant="outline"
						onClick={(e) => {
							e.preventDefault();
							setIsEditing(false);
						}}
					>
						<XIcon />
					</Button>
				</div>
			</div>
			<form
				className="flex w-full flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="flex gap-3">
					<form.Field name="name">
						{(field) => {
							return (
								<div className="flex w-full flex-col gap-2">
									<Label>Username</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="alice.coder"
									/>
									{field.state.meta.isTouched && !field.state.meta.isValid ? (
										<em>{field.state.meta.errors.join(", ")}</em>
									) : null}
									{field.state.meta.isValidating ? "Validating..." : null}{" "}
								</div>
							);
						}}
					</form.Field>
					<form.Field
						name="full_name"
						children={(field) => {
							return (
								<div className="flex w-full flex-col gap-2">
									<Label>Full name</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Alice Coder"
									/>
								</div>
							);
						}}
					/>
				</div>
				<form.Field
					name="email"
					children={(field) => {
						return (
							<div className="flex w-full flex-col gap-2">
								<Label>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="alice@coder.com"
								/>
							</div>
						);
					}}
				/>
				<form.Field
					name="groups"
					children={(field) => {
						return (
							<div className="flex w-full flex-col gap-2">
								<Label>Groups</Label>
								<TagInput
									label="groups"
									values={field.state.value}
									onChange={(v) => field.handleChange(v)}
								/>
							</div>
						);
					}}
				/>
				<div className="flex flex-col gap-3">
					<p>RBAC Roles</p>
					<form.Field name="rbac_roles">
						{(field) => {
							return field.state.value.map((_, index) => {
								return (
									<div key={index} className="flex items-center gap-4">
										<form.Field name={`rbac_roles[${index}].name`}>
											{(subField) => (
												<Input
													value={subField.state.value}
													placeholder="Role name"
													onChange={(e) => {
														subField.handleChange(e.target.value);
													}}
												/>
											)}
										</form.Field>
										<form.Field name={`rbac_roles[${index}].org_id`}>
											{(subField) => (
												<Input
													value={subField.state.value}
													placeholder="Organization ID"
													onChange={(e) => {
														subField.handleChange(e.target.value);
													}}
												/>
											)}
										</form.Field>
										<Button
											variant="outline"
											size="icon"
											onClick={() => {
												field.removeValue(index);
											}}
										>
											<TrashIcon />
										</Button>
									</div>
								);
							});
						}}
					</form.Field>
					<Button
						size="sm"
						variant="outline"
						onClick={() =>
							form.setFieldValue("rbac_roles", (curr) => [
								...curr,
								{ name: "", org_id: "" },
							])
						}
					>
						<PlusIcon />
						Add Roles
					</Button>
				</div>
				<Button type="submit" onClick={() => form.handleSubmit()}>
					Save
				</Button>
			</form>
		</div>
	);
};

type UsersProps = {
	users: User[];
	setUsers: (owners: User[]) => void;
};
export const Users: FC<UsersProps> = ({ users, setUsers }) => {
	const uploadInputRef = useRef<HTMLInputElement | null>(null);

	const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		e.target.files = null;
		if (!file) {
			return;
		}

		const parsedUsers = v.safeParse(
			v.array(UserSchema),
			JSON.parse(new TextDecoder().decode(await file.bytes())),
		);

		if (parsedUsers.success) {
			setUsers(parsedUsers.output);
		} else {
			// TODO: Show an error
		}
	};

	const defaultValues: UserForm = {
		users,
	};
	const form = useForm({
		defaultValues,
		validators: {
			onChange: UserFormSchema,
		},
		onSubmit: ({ value }) => {
			setUsers(value.users);
		},
	});

	return (
		<div className="flex w-full flex-col gap-4 p-6">
			<input
				ref={uploadInputRef}
				onChange={onUpload}
				className="hidden"
				type="file"
				multiple={false}
			/>
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-3xl text-content-primary">Users</h1>
				<DropdownMenu>
					<DropdownMenuTrigger asChild={true}>
						<Button variant="outline" size="icon-lg">
							<Ellipsis />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuPortal>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => uploadInputRef.current?.click()}>
								<UploadIcon />
								Upload
							</DropdownMenuItem>
							<DropdownMenuItem
								disabled={form.state.errors.length > 0}
								onClick={() => {
									downloadData(form.state.values.users, "users.json");
								}}
							>
								<DownloadIcon />
								Download
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenuPortal>
				</DropdownMenu>
			</div>
			<form.Field name="users" mode="array">
				{(field) => {
					return (
						<div className=" flex flex-col gap-3">
							{field.state.value.map((_, index) => (
								<form.Field key={index} name={`users[${index}]`}>
									{(subField) => (
										<UserForm
											user={subField.state.value}
											key={window.crypto.randomUUID()}
											onSave={(owner) => {
												subField.handleChange(owner);
												form.handleSubmit();
											}}
											onDelete={() => {
												field.removeValue(index);
												form.handleSubmit();
											}}
										/>
									)}
								</form.Field>
							))}
						</div>
					);
				}}
			</form.Field>
			<Button onClick={() => form.pushFieldValue("users", emptyUser)}>
				<PlusIcon />
				Add a user
			</Button>
		</div>
	);
};

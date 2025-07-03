/** biome-ignore-all lint/correctness/noChildrenProp: below
 * Tanstack Form uses the children prop which lets us keep the component flat
 * rather than having to define separate wrappers using hooks.
 */

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useForm } from "@tanstack/react-form";
import {
	DownloadIcon,
	Ellipsis,
	PlusIcon,
	TrashIcon,
	UploadIcon,
} from "lucide-react";
import type { FC } from "react";
import type { InferInput } from "valibot";
import { Button } from "@/client/components/Button";
import { Input } from "@/client/components/Input";
import { Label } from "@/client/components/Label";
import { TagInput } from "@/client/components/TagInput";
import { OwnerSchema } from "@/owner";

const UserForm: FC = () => {
	const defaultValues: InferInput<typeof OwnerSchema> = {
		name: "",
		email: "",
		full_name: "",
		id: "",
		ssh_public_key: "",
		rbac_roles: [{ name: "", org_id: "" }],
		groups: [],
		login_type: "password",
	};
	const form = useForm({
		defaultValues,
		validators: {
			onChange: OwnerSchema,
		},
		onSubmitInvalid: () => {
			// TODO
		},
		onSubmit: () => {
			// TODO
		},
	});

	return (
		<div className="flex w-full flex-col gap-5 rounded-lg border p-5">
			<div className="flex w-full items-center justify-between">
				<h2 className="font-semibold text-content-primary text-xl">
					User Data
				</h2>
				<Button size="icon" variant="outline">
					<TrashIcon />
				</Button>
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

export const Users: FC = () => {
	return (
		<div className="flex w-full flex-col gap-4 p-6">
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
							<DropdownMenuItem>
								<UploadIcon />
								Upload
							</DropdownMenuItem>
							<DropdownMenuItem>
								<DownloadIcon />
								Download
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenuPortal>
				</DropdownMenu>
			</div>
			<div className="">
				<UserForm />
			</div>
			<Button variant="outline">
				<PlusIcon />
				Add a user
			</Button>
		</div>
	);
};

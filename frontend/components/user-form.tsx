"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/lib/features/user-api";
import { useGetRolesQuery } from "@/lib/features/role-api";
import type { User } from "@/lib/features/user-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, PlusCircle, Save, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(5, "Valid phone number is required"),
  email: z.email("Valid email is required"),
  role_id:  z.number({ error: "Role is required" }),
  is_team_member: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface UserFormProps {
  editingUser?: (User & { role_id?: number }) | null;
  onCancelEdit?: () => void;
}

export function UserForm({ editingUser, onCancelEdit }: UserFormProps) {
  const { data: roles, isLoading: isLoadingRoles } = useGetRolesQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const form = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      role_id: undefined,
      is_team_member: false,
    },
  });

  useEffect(() => {
    if (editingUser && roles) {
      const role = roles.find(r => r.role_name === editingUser.role_name);
      form.reset({
        name: editingUser.name,
        phone: editingUser.phone,
        email: editingUser.email,
        role_id: role?.role_id,
        is_team_member: editingUser.is_team_member,
      });
    } else {
      form.reset({
        name: "",
        phone: "",
        email: "",
        role_id: undefined,
        is_team_member: false,
      });
    }
  }, [editingUser, form, roles]);

  async function onSubmit(data: FormData) {
    try {
      if (editingUser) {
        await updateUser({
          
          id: editingUser.user_id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          role_id: data.role_id,
          is_team_member: data.is_team_member,
        }).unwrap();
        toast.success('User updated successfully!', {
          style: {
            '--normal-bg':
              'color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))',
            '--normal-text': 'light-dark(var(--color-green-600), var(--color-green-400))',
            '--normal-border': 'light-dark(var(--color-green-600), var(--color-green-400))'
          } as React.CSSProperties
        })
        onCancelEdit?.();
      } else {
        await createUser({
          name: data.name,
          phone: data.phone,
          email: data.email,
          role_id: data.role_id,
          is_team_member: data.is_team_member,
        }).unwrap();
        toast.success('User created successfully!', {
          style: {
            '--normal-bg':
              'color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))',
            '--normal-text': 'light-dark(var(--color-green-600), var(--color-green-400))',
            '--normal-border': 'light-dark(var(--color-green-600), var(--color-green-400))'
          } as React.CSSProperties
        })
      }
      form.reset();
    } catch (error: any) {
      const msg = error?.data?.message || "An unexpected error occurred"
       toast.error(msg, {
          style: {
            '--normal-bg': 'color-mix(in oklab, var(--destructive) 10%, var(--background))',
            '--normal-text': 'var(--destructive)',
            '--normal-border': 'var(--destructive)'
          } as React.CSSProperties, closeButton: true
        })
    }
  }

  const isLoading = isCreating || isUpdating;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingUser ? "Edit User" : "Create New User"}</CardTitle>
        <CardDescription>
          {editingUser
            ? "Update the user information below"
            : "Add a new user to the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      value={field.value?.toString()}
                      disabled={isLoadingRoles}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem
                            key={role.role_id}
                            value={role.role_id.toString()}
                          >
                            {role.role_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_team_member"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Team Member</FormLabel>
                    <FormDescription>
                      Mark this user as a team member
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : editingUser ? (
                  <>
                    <Save className="mr-2 size-4" />
                    Update User
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 size-4" />
                    Create User
                  </>
                )}
              </Button>
              {editingUser && (
                <Button type="button" variant="outline" onClick={onCancelEdit}>
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

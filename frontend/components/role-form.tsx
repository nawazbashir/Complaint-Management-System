"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "@/lib/features/role-api";
import type { Role } from "@/lib/features/role-api";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, PlusCircle, Save, X } from "lucide-react";

const formSchema = z.object({
  role_name: z
    .string()
    .min(1, "Role name is required")
    .regex(/^[a-zA-Z\s]+$/, "Only alphabetic characters allowed"),
});

type FormData = z.infer<typeof formSchema>;

interface RoleFormProps {
  editingRole?: Role | null;
  onCancelEdit?: () => void;
}

export function RoleForm({ editingRole, onCancelEdit }: RoleFormProps) {
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role_name: "",
    },
  });

  useEffect(() => {
    if (editingRole) {
      form.reset({
        role_name: editingRole.role_name,
      });
    } else {
      form.reset({
        role_name: "",
      });
    }
  }, [editingRole, form]);

  async function onSubmit(data: FormData) {
    try {
      if (editingRole) {
        await updateRole({
          id: editingRole.role_id,
          role_name: data.role_name.trim().toUpperCase(),
        }).unwrap();
        toast.success("Role updated successfully!", {
          style: {
            "--normal-bg":
              "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
            "--normal-text":
              "light-dark(var(--color-green-600), var(--color-green-400))",
            "--normal-border":
              "light-dark(var(--color-green-600), var(--color-green-400))",
          } as React.CSSProperties,
        });
        onCancelEdit?.();
      } else {
        await createRole({
          role_name: data.role_name.trim().toUpperCase(),
        }).unwrap();
        toast.success("Role created successfully!", {
          style: {
            "--normal-bg":
              "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
            "--normal-text":
              "light-dark(var(--color-green-600), var(--color-green-400))",
            "--normal-border":
              "light-dark(var(--color-green-600), var(--color-green-400))",
          } as React.CSSProperties,
        });
      }
      form.reset();
    } catch (error: any) {
      const msg = error?.data?.message || "An unexpected error occurred";
      toast.error(msg, {
        style: {
          "--normal-bg":
            "color-mix(in oklab, var(--destructive) 10%, var(--background))",
          "--normal-text": "var(--destructive)",
          "--normal-border": "var(--destructive)",
        } as React.CSSProperties,
        closeButton: true,
      });
    }
  }

  const isLoading = isCreating || isUpdating;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingRole ? "Edit Role" : "Create New Role"}</CardTitle>
        <CardDescription>
          {editingRole
            ? "Update the role information below"
            : "Add a new role to the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter role name" {...field} />
                  </FormControl>
                  <FormMessage />
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
                ) : editingRole ? (
                  <>
                    <Save className="mr-2 size-4" />
                    Update Role
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 size-4" />
                    Create Role
                  </>
                )}
              </Button>
              {editingRole && (
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

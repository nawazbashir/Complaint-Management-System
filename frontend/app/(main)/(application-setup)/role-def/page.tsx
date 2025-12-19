"use client"

import { useState } from "react"
import { RoleForm } from "@/components/role-form"
import { useGetRolesQuery, useDeleteRoleMutation } from "@/lib/features/role-api"
import { createColumns, type Role } from "./columns"
import { DataTable } from "./data-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, List } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function RoleDefPage() {
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const { data: roles, isLoading, isError, refetch } = useGetRolesQuery()
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation()

  async function handleDelete() {
    if (!deletingRole) return
    try {
      await deleteRole(deletingRole.role_id).unwrap()
      setDeletingRole(null)
    } catch (error) {
      console.error("Failed to delete role:", error)
    }
  }

  const columns = createColumns(
    (role) => setEditingRole(role),
    (role) => setDeletingRole(role),
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Definition</h1>
          <p className="text-muted-foreground">Manage user roles for your application</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Definition</h1>
          <p className="text-muted-foreground">Manage user roles for your application</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="size-12 text-destructive mb-4" />
            <p className="text-lg font-medium text-destructive">Failed to load roles</p>
            <p className="text-sm text-muted-foreground mb-4">Please check if the backend server is running</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Role Definition</h1>
        <p className="text-muted-foreground">Manage user roles for your application</p>
      </div>

      <RoleForm editingRole={editingRole} onCancelEdit={() => setEditingRole(null)} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="size-5" />
            Roles List
          </CardTitle>
          <CardDescription>
            {roles?.length ?? 0} role{(roles?.length ?? 0) !== 1 && "s"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roles && roles.length > 0 ? (
            <DataTable columns={columns} data={roles} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="size-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No roles found</p>
              <p className="text-sm text-muted-foreground">Create your first role using the form above</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingRole?.role_name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

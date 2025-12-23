"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Save, X, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateComplaintMutation, useUpdateComplaintMutation, type Complaint } from "@/lib/features/complaint-api"
import { useGetIssuesQuery } from "@/lib/features/issue-api"
import { useGetDepartmentsQuery } from "@/lib/features/department-api"

const complaintSchema = z.object({
  department_id: z.number({ error: "Department is required" }),
  issue_id: z.number({ error: "Issue is required" }),
  complaint_detail: z.string().min(1, "Complaint detail is required").max(1000, "Max 1000 characters"),
  status: z.string().optional(),
})

type ComplaintFormValues = z.infer<typeof complaintSchema>

interface ComplaintFormProps {
  editingComplaint: (Complaint & { department_id?: number; issue_id?: number }) | null
  onCancelEdit: () => void
}

export function ComplaintForm({ editingComplaint, onCancelEdit }: ComplaintFormProps) {
  const [createComplaint, { isLoading: isCreating }] = useCreateComplaintMutation()
  const [updateComplaint, { isLoading: isUpdating }] = useUpdateComplaintMutation()
  const { data: issues } = useGetIssuesQuery()
  const { data: departments } = useGetDepartmentsQuery()

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      department_id: undefined,
      issue_id: undefined,
      complaint_detail: "",
      status: "Pending",
    },
  })

  useEffect(() => {
    if (editingComplaint && departments && issues) {
      const dept = departments.find(d => d.deptt_name === editingComplaint.deptt_name);
      const issue = issues.find(i => i.issue_type === editingComplaint.issue_type);
      form.reset({
        department_id: dept?.deptt_id,
        issue_id: issue?.issue_id,
        complaint_detail: editingComplaint.complaint_detail,
        status: editingComplaint.status,
      });
    } else if (!editingComplaint) {
      form.reset({
        department_id: undefined,
        issue_id: undefined,
        complaint_detail: "",
        status: "Pending",
      });
    }
  }, [editingComplaint, departments, issues, form])

  async function onSubmit(values: ComplaintFormValues) {
    try {
      if (editingComplaint) {
        await updateComplaint({
          id: editingComplaint.complaint_id,
          ...values,
        }).unwrap()
        onCancelEdit()
      } else {
        await createComplaint(values).unwrap()
        form.reset()
      }
    } catch (error) {
      console.error("Failed to save complaint:", error)
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          {editingComplaint ? "Edit Complaint" : "Create Complaint"}
        </CardTitle>
        <CardDescription>
          {editingComplaint ? "Update the complaint details below" : "Fill in the details to create a new complaint"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.deptt_id} value={dept.deptt_id.toString()}>
                            {dept.deptt_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issue_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Type</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {issues?.map((issue) => (
                          <SelectItem key={issue.issue_id} value={issue.issue_id.toString()}>
                            {issue.issue_type}
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
              name="complaint_detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complaint Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter complaint details..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {editingComplaint && (<FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="sm:max-w-[200px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />)}
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : editingComplaint ? (
                  <Save className="mr-2 size-4" />
                ) : (
                  <Plus className="mr-2 size-4" />
                )}
                {editingComplaint ? "Update Complaint" : "Create Complaint"}
              </Button>
              {editingComplaint && (
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
  )
}

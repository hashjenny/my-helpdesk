import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { CreateTicketInput } from "@helpdesk/shared"
import { createTicketSchema } from "@helpdesk/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CreateTicketFormProps {
  onSubmit: (data: CreateTicketInput) => void
  onCancel: () => void
  isPending: boolean
}

export function CreateTicketForm({ onSubmit, onCancel, isPending }: CreateTicketFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema) as Resolver<CreateTicketInput>,
    defaultValues: {
      subject: "",
      body: "",
      category: "GENERAL",
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              placeholder="Brief description of the issue"
              {...register("subject")}
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Description</Label>
            <textarea
              id="body"
              className="flex min-h-32 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Detailed description..."
              {...register("body")}
              aria-invalid={!!errors.body}
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              {...register("category")}
            >
              <option value="GENERAL">General</option>
              <option value="TECHNICAL">Technical</option>
              <option value="REFUND">Refund</option>
            </select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Ticket"}
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              onCancel()
              reset()
            }}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

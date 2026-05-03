import { useForm, type Resolver, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { polishTicketResponse } from "@/lib/api/tickets"
import { useAuth } from "@/hooks/useAuth"

const replySchema = z.object({
  body: z.string().min(1, "Reply cannot be empty"),
})

type ReplyFormData = z.infer<typeof replySchema>

interface ReplyFormProps {
  ticketId: string
  onSubmit: (body: string) => void
  isPending: boolean
}

export function ReplyForm({ ticketId, onSubmit, isPending }: ReplyFormProps) {
  const { session } = useAuth()
  const token = session?.session?.token ?? ""

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema) as Resolver<ReplyFormData>,
    defaultValues: { body: "" },
  })

  const currentBody = useWatch({ control, name: "body" })

  const polishMutation = useMutation({
    mutationFn: (body: string) => polishTicketResponse(ticketId, body, token),
    onSuccess: (data) => {
      reset({ body: data.polished })
    },
    onError: (err: Error) => alert(err.message),
  })

  const onFormSubmit = (data: ReplyFormData) => {
    onSubmit(data.body)
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Response</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reply">Your Response</Label>
            <textarea
              id="reply"
              className="flex min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Type your response..."
              {...register("body")}
              aria-invalid={!!errors.body}
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => currentBody && polishMutation.mutate(currentBody)}
              disabled={!currentBody?.trim() || polishMutation.isPending}
            >
              {polishMutation.isPending ? "Polishing..." : "Polish with AI"}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Send Response"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

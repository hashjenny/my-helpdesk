import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const replySchema = z.object({
  body: z.string().min(1, "Reply cannot be empty"),
})

type ReplyFormData = z.infer<typeof replySchema>

interface ReplyFormProps {
  onSubmit: (body: string) => void
  isPending: boolean
}

export function ReplyForm({ onSubmit, isPending }: ReplyFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema) as Resolver<ReplyFormData>,
    defaultValues: { body: "" },
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
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending..." : "Send Response"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

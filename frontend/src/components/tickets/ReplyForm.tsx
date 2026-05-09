import { useEffect } from "react"
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
  defaultValue?: string
}

export function ReplyForm({ ticketId, onSubmit, isPending, defaultValue }: ReplyFormProps) {
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
    defaultValues: { body: defaultValue ?? "" },
  })

  useEffect(() => {
    if (defaultValue !== undefined) {
      reset({ body: defaultValue })
    }
  }, [defaultValue, reset])

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
    <Card className="border-amber-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-mono">&gt;</span>
          <CardTitle className="text-sm font-mono text-amber-400/80 uppercase tracking-wider">
            add response
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reply" className="text-amber-400/70 font-mono text-xs uppercase">
              &gt; your response
            </Label>
            <textarea
              id="reply"
              className="flex min-h-24 w-full rounded border border-amber-500/30 bg-[oklch(0.08_0_0)] px-3 py-2 font-mono text-sm text-amber-400 transition-all duration-200 outline-none placeholder:text-amber-500/30 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 resize-none"
              placeholder="type your response..."
              {...register("body")}
              aria-invalid={!!errors.body}
            />
            {errors.body && (
              <p className="text-red-400 font-mono text-xs">! {errors.body.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => currentBody && polishMutation.mutate(currentBody)}
              disabled={!currentBody?.trim() || polishMutation.isPending}
              className="font-mono"
            >
              {polishMutation.isPending ? "[ polishing... ]" : "[ polish with ai ]"}
            </Button>
            <Button type="submit" disabled={isPending} className="font-mono">
              {isPending ? "[ sending... ]" : "[ send response ]"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

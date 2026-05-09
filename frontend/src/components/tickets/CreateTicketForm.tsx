import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { CreateTicketInput } from "@helpdesk/shared"
import { createTicketSchema } from "@helpdesk/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
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
    <Card className="border-amber-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-mono">&gt;</span>
          <CardTitle className="text-sm font-mono text-amber-400/80 uppercase tracking-wider">
            create ticket
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-amber-400/70 font-mono text-xs uppercase">
              &gt; subject
            </Label>
            <Input
              id="subject"
              type="text"
              placeholder="Brief description of the issue"
              {...register("subject")}
              className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono placeholder:text-amber-500/30"
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p className="text-red-400 font-mono text-xs">! {errors.subject.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="body" className="text-amber-400/70 font-mono text-xs uppercase">
              &gt; description
            </Label>
            <textarea
              id="body"
              className="flex min-h-32 w-full rounded border border-amber-500/30 bg-[oklch(0.08_0_0)] px-3 py-2 font-mono text-sm text-amber-400 transition-all duration-200 outline-none placeholder:text-amber-500/30 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 resize-none"
              placeholder="Detailed description..."
              {...register("body")}
              aria-invalid={!!errors.body}
            />
            {errors.body && (
              <p className="text-red-400 font-mono text-xs">! {errors.body.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-amber-400/70 font-mono text-xs uppercase">
              &gt; category
            </Label>
            <Select
              id="category"
              {...register("category")}
            >
              <option value="GENERAL">General</option>
              <option value="TECHNICAL">Technical</option>
              <option value="REFUND">Refund</option>
            </Select>
            {errors.category && (
              <p className="text-red-400 font-mono text-xs">! {errors.category.message}</p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="font-mono"
            >
              {isPending ? "[ creating... ]" : "[ create ]"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onCancel()
                reset()
              }}
              className="font-mono"
            >
              [ cancel ]
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

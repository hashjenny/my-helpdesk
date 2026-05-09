import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createUserSchema, type CreateUserInput, type UserRole } from "@helpdesk/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = createUserSchema.extend({
  role: z.enum(["AGENT", "ADMIN"]),
})

interface FormData {
  email: string
  password: string
  name: string
  role: UserRole
}

interface CreateUserFormProps {
  onSubmit: (data: CreateUserInput) => void
  onCancel: () => void
  isPending: boolean
}

export function CreateUserForm({ onSubmit, onCancel, isPending }: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as Resolver<FormData>,
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "AGENT",
    },
  })

  return (
    <Card className="border-amber-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-mono">&gt;</span>
          <CardTitle className="text-sm font-mono text-amber-400/80 uppercase tracking-wider">
            add agent
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-name" className="text-amber-400/70 font-mono text-xs uppercase">
                &gt; name
              </Label>
              <Input
                id="form-name"
                type="text"
                placeholder="Name"
                {...register("name")}
                className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono placeholder:text-amber-500/30"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-red-400 font-mono text-xs">! {errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-email" className="text-amber-400/70 font-mono text-xs uppercase">
                &gt; email
              </Label>
              <Input
                id="form-email"
                type="email"
                placeholder="Email"
                {...register("email")}
                className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono placeholder:text-amber-500/30"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-red-400 font-mono text-xs">! {errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-password" className="text-amber-400/70 font-mono text-xs uppercase">
                &gt; password
              </Label>
              <Input
                id="form-password"
                type="password"
                placeholder="Password"
                {...register("password")}
                className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono placeholder:text-amber-500/30"
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-red-400 font-mono text-xs">! {errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-role" className="text-amber-400/70 font-mono text-xs uppercase">
                &gt; role
              </Label>
              <Select
                id="form-role"
                {...register("role")}
              >
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </Select>
              {errors.role && (
                <p className="text-red-400 font-mono text-xs">! {errors.role.message}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="font-mono">
              {isPending ? "[ creating... ]" : "[ create ]"}
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              onCancel()
              reset()
            }} className="font-mono">
              [ cancel ]
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

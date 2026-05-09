import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signUp } from "../lib/auth-client"
import { getErrorMessage } from "@/lib/get-error-message"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export function Register() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setError("")
    setLoading(true)

    try {
      await signUp.email(
        { email: data.email, password: data.password, name: data.name },
        {
          onRequest: () => setLoading(true),
          onSuccess: () => {
            window.location.href = "/"
          },
          onError: (ctx) => {
            const errorMessage = typeof ctx.error === 'string' ? ctx.error : ctx.error?.message || "Sign up failed"
            setError(errorMessage)
            setLoading(false)
          },
        }
      )
    } catch (err: unknown) {
      setError(getErrorMessage(err, "An unexpected error occurred"))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-500 font-mono text-lg">&gt;</span>
            <span className="text-amber-400/80 font-mono text-lg">register</span>
            <span className="text-amber-500/40 font-mono text-lg cursor-blink">_</span>
          </div>
          <p className="text-amber-500/40 font-mono text-xs">
            // create new user account
          </p>
        </div>

        <Card className="border-amber-500/30 bg-[oklch(0.11_0_0)]">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-500/50 bg-red-500/10"
                >
                  <span className="text-red-400 font-mono text-sm">
                    <span className="text-red-500">error:</span> {error}
                  </span>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-amber-400/70 font-mono text-xs uppercase">
                  &gt; name
                </Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  {...register("name")}
                  className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono placeholder:text-amber-500/30 focus:border-amber-500/60 focus:ring-amber-500/20"
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-red-400 font-mono text-xs">
                    ! {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-400/70 font-mono text-xs uppercase">
                  &gt; email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono placeholder:text-amber-500/30 focus:border-amber-500/60 focus:ring-amber-500/20"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-red-400 font-mono text-xs">
                    ! {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-400/70 font-mono text-xs uppercase">
                  &gt; password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono placeholder:text-amber-500/30 focus:border-amber-500/60 focus:ring-amber-500/20"
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-red-400 font-mono text-xs">
                    ! {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-amber-400/70 font-mono text-xs uppercase">
                  &gt; confirm
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono placeholder:text-amber-500/30 focus:border-amber-500/60 focus:ring-amber-500/20"
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 font-mono text-xs">
                    ! {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/70 font-mono uppercase tracking-wider"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">creating</span>
                    <span className="text-amber-500/60">...</span>
                  </span>
                ) : (
                  "[ create ]"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-amber-500/20 text-center">
              <p className="text-amber-500/40 font-mono text-xs">
                have account?{" "}
                <Link
                  to="/login"
                  className="text-amber-400/70 hover:text-amber-400 hover:underline"
                >
                  login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            to="/"
            className="text-amber-500/30 hover:text-amber-500/60 font-mono text-xs transition-colors"
          >
            ← back to system
          </Link>
        </div>
      </div>
    </div>
  )
}

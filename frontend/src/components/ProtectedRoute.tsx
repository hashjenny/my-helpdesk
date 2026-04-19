import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

type Role = "ADMIN" | "AGENT"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, isPending } = useAuth()

  if (isPending) {
    return <div className="p-4">Loading session...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles) {
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!allowedRoles.includes(userRole as Role)) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

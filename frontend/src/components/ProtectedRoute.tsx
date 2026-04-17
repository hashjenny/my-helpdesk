import { Navigate } from "react-router-dom"
import { useSession } from "../lib/auth-client"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <div className="p-4">Loading session...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
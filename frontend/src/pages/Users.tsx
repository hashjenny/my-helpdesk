import { useSession } from "../lib/auth-client"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  role?: string
}

export function Users() {
  const { data: session } = useSession()

  const isAdmin = (session?.user as unknown as User)?.role === "ADMIN"

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Access denied. Admin only.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Users</h1>
    </div>
  )
}

import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"

export function UserBadge() {
  const { session, signOut } = useAuth()

  if (!session?.user) return null

  const displayName = session.user.name || session.user.email || "User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
          {initials}
        </div>
        <span className="text-foreground font-medium hidden sm:inline">
          {displayName}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => signOut()}>
        Sign Out
      </Button>
    </div>
  )
}

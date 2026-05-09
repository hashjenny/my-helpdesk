import { useAuth } from "@/hooks/useAuth"
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
        <div className="w-8 h-8 rounded border border-amber-500/50 bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-xs font-semibold">
          {initials}
        </div>
        <span className="text-amber-400/80 font-mono text-sm hidden sm:inline">
          {displayName}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut()}
        className="text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 font-mono text-xs"
      >
        [exit]
      </Button>
    </div>
  )
}

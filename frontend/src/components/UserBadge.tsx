import { useSession, signOut } from "../lib/auth-client"

export function UserBadge() {
  const { data: session } = useSession()

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
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
          {initials}
        </div>
        <span className="text-gray-700 font-medium hidden sm:inline">
          {displayName}
        </span>
      </div>
      <button
        onClick={() => signOut()}
        className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        Sign Out
      </button>
    </div>
  )
}
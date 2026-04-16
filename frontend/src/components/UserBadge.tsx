import { useSession, signOut } from "../lib/auth-client"

export function UserBadge() {
  const { data: session } = useSession()

  if (!session?.user) return null

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <span>{session.user.name || session.user.email}</span>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
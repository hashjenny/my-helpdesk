import type { ReactNode } from "react"
import { useSession as useBetterAuthSession, signOut as betterAuthSignOut } from "../lib/auth-client"
import { AuthContext } from "@/context/auth-context"

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useBetterAuthSession()

  return (
    <AuthContext.Provider value={{ session, isPending, signOut: betterAuthSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

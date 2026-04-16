import { createContext, useContext } from "react"
import { useSession, signOut } from "../lib/auth-client"
import type { Session } from "better-auth"

interface AuthContextType {
  session: { data: { user: Session["user"] } | null } | undefined
  isPending: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()

  return (
    <AuthContext.Provider value={{ session, isPending, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
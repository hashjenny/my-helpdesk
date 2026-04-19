import { createContext, useContext } from "react"
import { useSession as useBetterAuthSession, signOut as betterAuthSignOut } from "../lib/auth-client"

interface User {
  id: string
  name: string
  email?: string
  image?: string | null
  emailVerified?: boolean
  role?: string
}

interface SessionRecord {
  id: string
  expiresAt: Date
  token: string
}

interface AuthContextType {
  session: { user: User; session: SessionRecord } | null
  isPending: boolean
  signOut: () => Promise<unknown>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useBetterAuthSession()

  return (
    <AuthContext.Provider value={{ session, isPending, signOut: betterAuthSignOut }}>
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

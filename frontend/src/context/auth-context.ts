import { createContext } from "react"

export interface User {
  id: string
  name: string
  email?: string
  image?: string | null
  emailVerified?: boolean
  role?: string
}

export interface SessionRecord {
  id: string
  expiresAt: Date
  token: string
}

export interface AuthContextType {
  session: { user: User; session: SessionRecord } | null
  isPending: boolean
  signOut: () => Promise<unknown>
}

export const AuthContext = createContext<AuthContextType | null>(null)
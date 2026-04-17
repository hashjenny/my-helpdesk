import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  credentials: {
    includeCredentials: true,
  },
})

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001"

export const { signIn, signUp, signOut, useSession } = authClient
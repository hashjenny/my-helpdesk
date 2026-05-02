import { createAuthClient } from "better-auth/react"

const SESSION_KEY = "helpdesk_session"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  sessionKey: SESSION_KEY,
})

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001"

export const { signIn, signUp, signOut, useSession } = authClient

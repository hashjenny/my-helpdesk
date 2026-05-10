import { createAuthClient } from "better-auth/react"

const SESSION_KEY = "helpdesk_session"
const DEFAULT_API_BASE = import.meta.env.PROD ? window.location.origin : "http://localhost:3001"
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE

export const authClient = createAuthClient({
  baseURL: API_URL,
  sessionKey: SESSION_KEY,
})

export const API_BASE = API_URL

export const { signIn, signUp, signOut, useSession } = authClient

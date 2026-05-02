import express from "express"
import cors from "cors"
import rateLimit from "express-rate-limit"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./auth.js"
import usersRouter from "./routes/users.js"

const app = express()

// Rate limiting for auth endpoints (disabled in non-production)
const authLimiter = process.env.NODE_ENV === "production"
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
    })
  : (_req: express.Request, res: express.Response, next: express.NextFunction) => next()

// CORS configuration with proper fallback
const trustedOriginsFromEnv = process.env.TRUSTED_ORIGINS
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean) ?? []
const trustedOrigins = trustedOriginsFromEnv.length > 0
  ? trustedOriginsFromEnv
  : (process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"])

app.use(cors({
  origin: trustedOrigins,
  credentials: true,
}))

// Apply rate limiter to auth routes
app.all("/api/auth/*splat", authLimiter, toNodeHandler(auth))

// JSON body parser for other routes
app.use(express.json())

// User routes
app.use("/api/users", usersRouter)

// Test route
app.get("/api/test", (_req, res) => res.json({ message: "test" }))

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }))

// Error handler - don't leak internal details
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(500).json({ error: "An internal error occurred" })
})

const PORT = Number(process.env.PORT) || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

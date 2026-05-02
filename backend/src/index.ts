import express from "express"
import cors from "cors"
import rateLimit from "express-rate-limit"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./auth.js"
import usersRouter from "./routes/users.js"
import ticketsRouter from "./routes/tickets.js"
import emailRouter from "./routes/email.js"

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

// CORS configuration - support "localhost" as a special keyword
const trustedOriginsFromEnv = process.env.TRUSTED_ORIGINS
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean) ?? []
const defaultTrustedOrigins = process.env.NODE_ENV === "production"
  ? []
  : ["http://localhost:5173"]

const trustedOrigins = trustedOriginsFromEnv.length > 0
  ? trustedOriginsFromEnv.includes("localhost")
    ? [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
      ]
    : trustedOriginsFromEnv
  : defaultTrustedOrigins

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

// Ticket routes
app.use("/api/tickets", ticketsRouter)

// Email webhook routes
app.use("/api/webhooks", emailRouter)

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

import express from "express"
import cors from "cors"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./auth"
import usersRouter from "./routes/users"

const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

// Auth routes - must be before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth))

// JSON body parser for other routes
app.use(express.json())

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(500).json({ error: err.message || "Internal server error" })
})

// User routes
app.use("/api/users", usersRouter)

// Test route
app.get("/api/test", (_req, res) => res.json({ message: "test" }))

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }))

const PORT = Number(process.env.PORT) || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
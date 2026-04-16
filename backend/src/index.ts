import express from "express"
import cors from "cors"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./auth"

const app = express()

app.use(cors())

// Auth routes - must be before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth))

// JSON body parser for other routes
app.use(express.json())

// Test route
app.get("/api/test", (req, res) => res.json({ message: "test" }))

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }))

const PORT = Number(process.env.PORT) || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
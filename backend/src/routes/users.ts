import { Router } from "express"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { requireAuth, requireRole } from "../middleware/session"
import { Role } from "../types/role"

const router = Router()
const prisma = new PrismaClient()

// GET /users - List all agents (admin only)
router.get("/", requireAuth, requireRole(Role.ADMIN), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
    res.json(users)
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// POST /users - Create a new agent (admin only)
router.post("/", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const { email, password, name, role } = req.body

  if (!email || !password || !name) {
    res.status(400).json({ error: "Email, password, and name are required" })
    return
  }

  const userRole = role === Role.ADMIN ? Role.ADMIN : Role.AGENT

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: userRole,
        accounts: {
          create: {
            accountId: email,
            providerId: "credential",
            password: hashedPassword,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })
    res.status(201).json(user)
  } catch (error) {
    if ((error as any).code === "P2002") {
      res.status(400).json({ error: "Email already exists" })
      return
    }
    res.status(500).json({ error: "Failed to create user" })
  }
})

// DELETE /users/:id - Delete a user (admin only)
router.delete("/:id", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const id = req.params.id as string

  if (id === req.user?.id) {
    res.status(400).json({ error: "Cannot delete yourself" })
    return
  }

  try {
    await prisma.user.delete({ where: { id } })
    res.status(204).send()
  } catch (_error) {
    res.status(500).json({ error: "Failed to delete user" })
  }
})

// GET /users/me - Get current user
router.get("/me", requireAuth, async (req, res) => {
  res.json(req.user)
})

export default router
import { Router } from "express"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { z } from "zod"
import { requireAuth, requireRole } from "../middleware/session"
import { Role } from "../types/role"

const router = Router()
const prisma = new PrismaClient()

const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  role: z.enum(["AGENT", "ADMIN"]).optional(),
})

const changePasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
})

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
  const result = createUserSchema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message })
    return
  }

  const { email, password, name, role } = result.data
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

// PATCH /users/:id/password - Change user password and invalidate sessions (admin only)
router.patch("/:id/password", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const id = req.params.id as string

  const result = changePasswordSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message })
    return
  }

  const { newPassword } = result.data

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Get the account for this user
    const account = await prisma.account.findFirst({
      where: { userId: id, providerId: "credential" },
    })

    if (!account) {
      res.status(404).json({ error: "Account not found" })
      return
    }

    // Update password and increment passwordVersion, then delete all sessions
    await prisma.$transaction([
      prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword },
      }),
      prisma.user.update({
        where: { id },
        data: { passwordVersion: { increment: 1 } },
      }),
      prisma.session.deleteMany({
        where: { userId: id },
      }),
    ])

    res.json({ message: "Password changed and sessions invalidated" })
  } catch (_error) {
    res.status(500).json({ error: "Failed to change password" })
  }
})

export default router
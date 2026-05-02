import { Router } from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma.js"
import { requireAuth, requireRole } from "../middleware/session.js"
import { createUserSchema, updateUserSchema, changePasswordSchema, isUserRole, Role } from "shared"

const router = Router()

// GET /users - List all agents (admin only)
router.get("/", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10))
    const skip = (page - 1) * limit
    const search = req.query.search as string | undefined
    const role = req.query.role as string | undefined

    const where: any = { deletedAt: null }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (role && isUserRole(role)) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// POST /users - Create a new agent (admin only)
router.post("/", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const result = createUserSchema.safeParse(req.body)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message ?? "Validation failed"
    res.status(400).json({ error: errorMessage })
    return
  }

  const { email, password, name, role } = result.data
  const userRole = role ?? Role.AGENT

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          name,
          role: userRole,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      })

      await tx.account.create({
        data: {
          accountId: createdUser.id,
          providerId: "credential",
          userId: createdUser.id,
          password: hashedPassword,
        },
      })

      return createdUser
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

// DELETE /users/:id - Soft delete a user (admin only)
router.delete("/:id", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const id = req.params.id as string

  if (id === req.user?.id) {
    res.status(400).json({ error: "Cannot delete yourself" })
    return
  }

  // Prevent deleting admins
  const userToDelete = await prisma.user.findUnique({
    where: { id },
    select: { role: true, deletedAt: true },
  })

  if (!userToDelete || userToDelete.deletedAt) {
    res.status(404).json({ error: "User not found" })
    return
  }

  if (userToDelete.role === Role.ADMIN) {
    res.status(400).json({ error: "Cannot delete an admin user" })
    return
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      // Delete all sessions for this user to force logout
      prisma.session.deleteMany({
        where: { userId: id },
      }),
    ])
    res.status(204).send()
  } catch (_error) {
    res.status(500).json({ error: "Failed to delete user" })
  }
})

// PATCH /users/:id - Update user (admin only)
router.patch("/:id", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  const id = req.params.id as string

  if (id === req.user?.id) {
    res.status(400).json({ error: "Cannot modify your own role" })
    return
  }

  const result = updateUserSchema.safeParse(req.body)
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message ?? "Validation failed"
    res.status(400).json({ error: errorMessage })
    return
  }

  const { name, role, password } = result.data

  if (!name && !role && !password) {
    res.status(400).json({ error: "No fields to update" })
    return
  }

  try {
    // If password is being changed, use the separate password endpoint logic
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      const account = await prisma.account.findFirst({
        where: { userId: id, providerId: "credential" },
      })

      if (account) {
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
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })
    res.json(user)
  } catch (_error) {
    res.status(500).json({ error: "Failed to update user" })
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
    const errorMessage = result.error.errors[0]?.message ?? "Validation failed"
    res.status(400).json({ error: errorMessage })
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

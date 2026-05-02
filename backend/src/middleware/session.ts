import type { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma.js"
import { Role, type UserRole } from "shared"

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionToken = req.headers.authorization?.replace("Bearer ", "")

  if (!sessionToken) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  if (!session.user) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  // Check if user is soft deleted
  if ((session.user as any).deletedAt) {
    // Delete the session and return unauthorized
    await prisma.session.delete({ where: { id: session.id } })
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  req.user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRole,
  }
  next()
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    next()
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
        role: UserRole
      }
    }
  }
}

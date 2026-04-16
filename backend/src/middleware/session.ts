import type { Request, Response, NextFunction } from "express"
import { auth } from "../auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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

  req.user = session.user
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    if (!roles.includes(req.user.role)) {
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
        role: string
      }
    }
  }
}
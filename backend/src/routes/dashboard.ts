import { Router } from "express"
import { requireAuth } from "../middleware/session.js"
import { prisma } from "../lib/prisma.js"

const router = Router()

// GET /api/dashboard/stats - Ticket counts by status and category
router.get("/stats", requireAuth, async (_req, res) => {
  try {
    const [total, byStatus, byCategory] = await Promise.all([
      prisma.ticket.count({ where: { deletedAt: null } }),
      prisma.ticket.groupBy({
        by: ["status"],
        _count: { status: true },
        where: { deletedAt: null },
      }),
      prisma.ticket.groupBy({
        by: ["category"],
        _count: { category: true },
        where: { deletedAt: null },
      }),
    ])

    const statusMap: Record<string, number> = {}
    for (const row of byStatus) {
      statusMap[row.status] = row._count.status
    }

    const categoryMap: Record<string, number> = {}
    for (const row of byCategory) {
      categoryMap[row.category] = row._count.category
    }

    res.json({
      total,
      byStatus: {
        OPEN: statusMap["OPEN"] ?? 0,
        RESOLVED: statusMap["RESOLVED"] ?? 0,
        CLOSED: statusMap["CLOSED"] ?? 0,
      },
      byCategory: {
        GENERAL: categoryMap["GENERAL"] ?? 0,
        TECHNICAL: categoryMap["TECHNICAL"] ?? 0,
        REFUND: categoryMap["REFUND"] ?? 0,
      },
    })
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" })
  }
})

// GET /api/dashboard/recent - 10 most recent tickets
router.get("/recent", requireAuth, async (_req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        subject: true,
        status: true,
        category: true,
        createdAt: true,
        supportEmail: true,
      },
    })
    res.json({ tickets })
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch recent tickets" })
  }
})

export default router
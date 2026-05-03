import { Router } from "express"
import { requireAuth, requireRole } from "../middleware/session.js"
import { ticketService } from "../services/ticketService.js"
import { aiService } from "../services/aiService.js"
import { prisma } from "../lib/prisma.js"
import { sendEmail } from "../lib/resend.js"
import {
  createTicketSchema,
  updateTicketSchema,
  createTicketResponseSchema,
  TicketStatus,
  TicketCategory,
  Role,
} from "@helpdesk/shared"

const router = Router()

// Simple HTML escaping for user-controlled input in email templates
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Authorization helper: agents can only access tickets assigned to them
function checkTicketAccess(ticket: { assignedTo: string | null }, user: { id: string; role: string } | undefined): boolean {
  if (!user) return false
  if (user.role !== "AGENT") return true
  return ticket.assignedTo === user.id
}

// GET /api/tickets - List tickets
router.get("/", requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10))
    const status = req.query.status as string | undefined
    const category = req.query.category as string | undefined
    const search = req.query.search as string | undefined
    const sortBy = (req.query.sortBy as string) || "createdAt"
    const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc"

    // Validate status/category if provided
    if (status && !TicketStatus.includes(status as any)) {
      res.status(400).json({ error: "Invalid status" })
      return
    }
    if (category && !TicketCategory.includes(category as any)) {
      res.status(400).json({ error: "Invalid category" })
      return
    }

    // Validate sortBy
    const validSortFields = ["createdAt", "updatedAt", "subject", "status", "category"]
    if (!validSortFields.includes(sortBy)) {
      res.status(400).json({ error: "Invalid sortBy field" })
      return
    }

    const userId = req.user?.id
    const userRole = req.user?.role

    const result = await ticketService.list({ page, limit, status, category, search, sortBy, sortOrder, userId, userRole })
    res.json(result)
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch tickets" })
  }
})

// POST /api/tickets - Create ticket
router.post("/", requireAuth, async (req, res) => {
  const result = createTicketSchema.safeParse(req.body)
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message ?? "Validation failed"
    res.status(400).json({ error: errorMessage })
    return
  }

  try {
    const ticket = await ticketService.create(result.data)
    res.status(201).json(ticket)

    // Notify all agents about the new ticket (async, non-blocking)
    ;(async () => {
      try {
        const agents = await prisma.user.findMany({
          where: { role: "AGENT", deletedAt: null },
          select: { email: true },
        })
        if (agents.length === 0) return

        const ticketUrl = `http://localhost:5173/tickets/${ticket.id}`
        const createdAt = ticket.createdAt instanceof Date
          ? ticket.createdAt.toLocaleString("zh-CN")
          : String(ticket.createdAt)

        await Promise.allSettled(
          agents.map((agent) =>
            sendEmail({
              to: agent.email,
              subject: `[新工单] #${ticket.id} - ${ticket.subject}`,
              html: `
            <h2>新工单通知</h2>
            <p>有一个新的工单需要处理。</p>
            <hr/>
            <p><strong>工单编号：</strong>#${ticket.id}</p>
            <p><strong>主题：</strong>${escapeHtml(ticket.subject)}</p>
            <p><strong>提交人：</strong>${escapeHtml(ticket.supportEmail ?? "N/A")}</p>
            <p><strong>创建时间：</strong>${createdAt}</p>
            <a href="${ticketUrl}">查看工单</a>
          `,
            })
          )
        )
      } catch (err) {
        console.error(`[Email] Failed to send agent notifications for ticket ${ticket.id}:`, err)
      }
    })()
  } catch (_error) {
    res.status(500).json({ error: "Failed to create ticket" })
  }
})

// GET /api/tickets/:id - Get ticket with responses
router.get("/:id", requireAuth, async (req, res) => {
  const ticket = await ticketService.getById(req.params.id as string)
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" })
    return
  }
  // Agents can only see tickets assigned to them
  if (req.user?.role === "AGENT" && ticket.assignedTo !== req.user?.id) {
    res.status(403).json({ error: "Access denied" })
    return
  }
  res.json(ticket)
})

// PATCH /api/tickets/:id - Update ticket
router.patch("/:id", requireAuth, async (req, res) => {
  const result = updateTicketSchema.safeParse(req.body)
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message ?? "Validation failed"
    res.status(400).json({ error: errorMessage })
    return
  }

  try {
    const ticket = await ticketService.update(req.params.id as string, result.data)
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" })
      return
    }
    res.json(ticket)
  } catch (_error) {
    res.status(500).json({ error: "Failed to update ticket" })
  }
})

// DELETE /api/tickets/:id - Delete ticket (admin only)
router.delete("/:id", requireAuth, requireRole(Role.ADMIN), async (req, res) => {
  try {
    await ticketService.delete(req.params.id as string)
    res.status(204).send()
  } catch (_error) {
    res.status(500).json({ error: "Failed to delete ticket" })
  }
})

// GET /api/tickets/:id/responses - List responses
router.get("/:id/responses", requireAuth, async (req, res) => {
  try {
    const responses = await ticketService.getResponses(req.params.id as string)
    res.json(responses)
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch responses" })
  }
})

// POST /api/tickets/:id/responses - Add response
router.post("/:id/responses", requireAuth, async (req, res) => {
  const result = createTicketResponseSchema.safeParse(req.body)
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message ?? "Validation failed"
    res.status(400).json({ error: errorMessage })
    return
  }

  try {
    // Verify ticket exists
    const ticket = await ticketService.getById(req.params.id as string)
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" })
      return
    }

    const response = await ticketService.addResponse(req.params.id as string, result.data.body)
    res.status(201).json(response)
  } catch (_error) {
    res.status(500).json({ error: "Failed to add response" })
  }
})

// POST /api/tickets/:id/polish - Polish response text with AI
router.post("/:id/polish", requireAuth, async (req, res) => {
  const { body } = req.body
  if (!body || typeof body !== "string" || body.trim().length === 0) {
    res.status(400).json({ error: "body is required" })
    return
  }

  try {
    const result = await aiService.polishText(body)
    res.json(result)
  } catch (error) {
    console.error("Polish text error:", error)
    res.status(500).json({ error: "Failed to polish text" })
  }
})

// POST /api/tickets/:id/summarize - AI summary of ticket
router.post("/:id/summarize", requireAuth, async (req, res) => {
  try {
    const ticket = await ticketService.getById(req.params.id as string)
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" })
      return
    }
    // Agents can only see tickets assigned to them
    if (!checkTicketAccess(ticket, req.user)) {
      res.status(403).json({ error: "Access denied" })
      return
    }

    const result = await aiService.summarizeTicket({
      subject: ticket.subject,
      body: ticket.body,
      responses: (ticket.responses ?? []).map(r => ({
        body: r.body,
        isCustomerReply: r.isCustomerReply,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      })),
    })
    res.json(result)
  } catch (error) {
    const err = error as { message?: string }
    console.error("Summarize error:", err?.message || error)
    res.status(500).json({ error: "Failed to summarize ticket" })
  }
})

// POST /api/tickets/:id/classify - AI classify ticket category
router.post("/:id/classify", requireAuth, async (req, res) => {
  try {
    const ticket = await ticketService.getById(req.params.id as string)
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" })
      return
    }
    if (!checkTicketAccess(ticket, req.user)) {
      res.status(403).json({ error: "Access denied" })
      return
    }

    const result = await aiService.classifyTicket(ticket.subject, ticket.body)
    res.json(result)
  } catch (error) {
    const err = error as { message?: string }
    console.error("Classify error:", err?.message || error)
    res.status(500).json({ error: "Failed to classify ticket" })
  }
})

// GET /api/tickets/:id/suggested-reply - AI suggest replies
router.get("/:id/suggested-reply", requireAuth, async (req, res) => {
  try {
    const ticket = await ticketService.getById(req.params.id as string)
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" })
      return
    }
    if (!checkTicketAccess(ticket, req.user)) {
      res.status(403).json({ error: "Access denied" })
      return
    }

    const result = await aiService.suggestReplies({
      subject: ticket.subject,
      body: ticket.body,
      responses: (ticket.responses ?? []).map(r => ({
        body: r.body,
        isCustomerReply: r.isCustomerReply,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      })),
    })
    res.json(result)
  } catch (error) {
    const err = error as { message?: string }
    console.error("Suggest reply error:", err?.message || error)
    res.status(500).json({ error: "Failed to generate suggested replies" })
  }
})

export default router

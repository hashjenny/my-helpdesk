import { Router } from "express"
import { requireAuth, requireRole } from "../middleware/session.js"
import { ticketService } from "../services/ticketService.js"
import {
  createTicketSchema,
  updateTicketSchema,
  createTicketResponseSchema,
  TicketStatus,
  TicketCategory,
  Role,
} from "@helpdesk/shared"

const router = Router()

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

    const result = await ticketService.list({ page, limit, status, category, search, sortBy, sortOrder })
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

export default router

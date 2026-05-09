import { prisma } from "../lib/prisma.js"
import { logger } from "../lib/logger.js"
import type { CreateTicketInput, UpdateTicketInput } from "@helpdesk/shared"

export const ticketService = {
  async list(params: {
    page: number
    limit: number
    status?: string
    category?: string
    search?: string
    sortBy?: string
    sortOrder?: string
    userId?: string
    userRole?: string
  }) {
    const { page, limit, status, category, search, sortBy = "createdAt", sortOrder = "desc", userId, userRole } = params
    const skip = (page - 1) * limit

    const where: any = { deletedAt: null }
    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ]
    }
    // Agents can only see tickets assigned to them
    if (userRole === "AGENT" && userId) {
      where.assignedTo = userId
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: { responses: { orderBy: { createdAt: "asc" } } },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ])

    return { tickets, total, page, totalPages: Math.ceil(total / limit) }
  },

  async getById(id: string) {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        responses: { orderBy: { createdAt: "asc" } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    })
  },

  async create(data: CreateTicketInput) {
    return prisma.ticket.create({
      data: {
        subject: data.subject,
        body: data.body,
        category: data.category,
        supportEmail: data.supportEmail,
      },
    })
  },

  async update(id: string, data: UpdateTicketInput) {
    return prisma.ticket.update({
      where: { id },
      data: {
        ...(data.subject && { subject: data.subject }),
        ...(data.body && { body: data.body }),
        ...(data.status && { status: data.status }),
        ...(data.category && { category: data.category }),
        ...("assignedTo" in data && { assignedTo: data.assignedTo }),
      },
    })
  },

  async delete(id: string) {
    return prisma.ticket.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },

  async addResponse(ticketId: string, body: string) {
    const response = await prisma.ticketResponse.create({
      data: { ticketId, body, isCustomerReply: false },
    })

    try {
      const ticket = await this.getById(ticketId)
      if (ticket?.supportEmail) {
        const { emailService } = await import("./email.js")
        await emailService.sendTicketResponseEmail(ticket, response.body)
      }
    } catch (error) {
      logger.error("Failed to send ticket response email:", error)
    }

    return response
  },

  async getResponses(ticketId: string) {
    return prisma.ticketResponse.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
    })
  },
}

import { prisma } from "../lib/prisma.js"
import type { CreateTicketInput, UpdateTicketInput } from "@helpdesk/shared"

export const ticketService = {
  async list(params: {
    page: number
    limit: number
    status?: string
    category?: string
    search?: string
  }) {
    const { page, limit, status, category, search } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ]
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: { responses: { orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" },
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
      include: { responses: { orderBy: { createdAt: "asc" } } },
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
      },
    })
  },

  async delete(id: string) {
    return prisma.ticket.delete({ where: { id } })
  },

  async addResponse(ticketId: string, body: string) {
    return prisma.ticketResponse.create({
      data: { ticketId, body },
    })
  },

  async getResponses(ticketId: string) {
    return prisma.ticketResponse.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
    })
  },
}

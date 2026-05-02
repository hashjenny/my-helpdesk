import { Resend } from "resend"
import { ticketService } from "./ticketService.js"

const resend = new Resend(process.env.RESEND_API_KEY)

interface ResendWebhookPayload {
  from: string
  to: string
  subject: string
  text: string
  html?: string
}

export const emailService = {
  /**
   * Send ticket response email to customer
   */
  async sendTicketResponseEmail(ticket: { id: number; subject: string; supportEmail?: string | null }, responseBody: string) {
    if (!ticket.supportEmail) {
      return
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: ticket.supportEmail,
      subject: `[Ticket #${ticket.id}] ${ticket.subject}`,
      text: responseBody,
    })
  },

  /**
   * Process incoming email from Resend webhook
   * Creates a ticket from the email content, or adds a response if replying to existing ticket
   */
  async processInboundEmail(payload: ResendWebhookPayload) {
    // Use text body, fallback to stripped HTML
    const body = payload.text || payload.html?.replace(/<[^>]*>/g, "") || ""

    // Extract sender email from "Name <email>" format
    const supportEmail = payload.from.match(/<(.+?)>/)?.[1] || payload.from

    // Check if this is a reply to an existing ticket
    const ticketIdMatch = payload.subject.match(/\[Ticket #([^\]]+)\]/)
    if (ticketIdMatch) {
      const ticketId = parseInt(ticketIdMatch[1], 10)
      if (!isNaN(ticketId)) {
        const ticket = await ticketService.getById(ticketId)
        if (ticket) {
          const response = await ticketService.addResponse(ticketId, {
            body,
            isCustomerReply: false,
          })

          // Update isCustomerReply to true using prisma directly
          const { Prisma } = await import("@prisma/client")
          const prisma = new Prisma()
          await prisma.ticketResponse.update({
            where: { id: response.id },
            data: { isCustomerReply: true },
          })

          return { ticketId, responseId: response.id, isReply: true }
        }
      }
    }

    // No match or ticket not found - create new ticket
    const subject = payload.subject.replace(/^(Re:\s*)+/i, "").trim() || "No Subject"
    const ticket = await ticketService.create({
      subject,
      body,
      category: "GENERAL",
      supportEmail,
    })

    return ticket
  },
}
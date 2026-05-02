import { ticketService } from "./ticketService.js"

interface ResendWebhookPayload {
  from: string
  to: string
  subject: string
  text: string
  html?: string
}

export const emailService = {
  /**
   * Process incoming email from Resend webhook
   * Creates a ticket from the email content
   */
  async processInboundEmail(payload: ResendWebhookPayload) {
    // Extract subject from email subject line (remove "Re: " prefix if present)
    const subject = payload.subject.replace(/^(Re:\s*)+/i, "").trim() || "No Subject"

    // Use text body, fallback to stripped HTML
    const body = payload.text || payload.html?.replace(/<[^>]*>/g, "") || ""

    // Extract sender email from "Name <email>" format
    const supportEmail = payload.from.match(/<(.+?)>/)?.[1] || payload.from

    const ticket = await ticketService.create({
      subject,
      body,
      category: "GENERAL",
      supportEmail,
    })

    return ticket
  },
}

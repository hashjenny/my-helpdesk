import { Router } from "express"
import { emailService } from "../services/email.js"
import { logger } from "../lib/logger.js"

const router = Router()

// POST /api/webhooks/email - Resend inbound email webhook
// This route should be protected with a webhook secret in production
// POST /api/webhooks/ticket - Manual ticket creation webhook (for testing)
// Simulates an inbound email to create a ticket with AI classification
router.post("/ticket", async (req, res) => {
  try {
    const { from, subject, text } = req.body

    if (!from || !subject || !text) {
      res.status(400).json({ error: "Missing required fields: from, subject, text" })
      return
    }

    const result = await emailService.processInboundEmail({
      from,
      to: process.env.SUPPORT_EMAIL || "support@example.com",
      subject,
      text,
    })

    res.status(201).json({ ticketId: result.ticketId })
  } catch (_error) {
    logger.error("Ticket webhook error:", _error)
    res.status(500).json({ error: "Failed to create ticket" })
  }
})

// POST /api/webhooks/email - Resend inbound email webhook
// This route should be protected with a webhook secret in production
router.post("/email", async (req, res) => {
  try {
    // In production, verify webhook signature:
    // const signature = req.headers["resend-signature"]
    // if (!verifyWebhookSignature(signature, req.body, process.env.RESEND_WEBHOOK_SECRET)) {
    //   res.status(401).json({ error: "Invalid signature" })
    //   return
    // }

    const { from, to, subject, text, html } = req.body

    if (!from || !subject) {
      res.status(400).json({ error: "Missing required fields" })
      return
    }

    const result = await emailService.processInboundEmail({
      from,
      to,
      subject,
      text,
      html,
    })

    // result can be { ticketId, responseId, isReply } for replies or { ticketId, isReply } for new tickets
    res.status(201).json({ ticketId: result.ticketId })
  } catch (_error) {
    logger.error("Email webhook error:", _error)
    res.status(500).json({ error: "Failed to process email" })
  }
})

export default router

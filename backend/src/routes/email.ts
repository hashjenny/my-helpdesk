import { Router } from "express"
import { emailService } from "../services/email.js"

const router = Router()

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

    const ticket = await emailService.processInboundEmail({
      from,
      to,
      subject,
      text,
      html,
    })

    res.status(201).json({ ticketId: ticket.id })
  } catch (_error) {
    console.error("Email webhook error:", _error)
    res.status(500).json({ error: "Failed to process email" })
  }
})

export default router

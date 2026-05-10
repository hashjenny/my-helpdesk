import "./env.js"
import { Resend } from "resend"
import { logger } from "./logger.js"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("[Resend] RESEND_API_KEY not set, skipping email")
    return { success: false, error: "RESEND_API_KEY not set" }
  }
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error("[Resend] Failed to send email:", message)
    return { success: false, error: message }
  }
}

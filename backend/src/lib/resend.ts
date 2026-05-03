import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("[Resend] RESEND_API_KEY not set, skipping email")
    return { success: false, error: "RESEND_API_KEY not set" }
  }
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
    console.error("[Resend] Failed to send email:", message)
    return { success: false, error: message }
  }
}
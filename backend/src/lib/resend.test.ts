import { sendEmail } from "./resend.js"

describe("resend client", () => {
  it("sendEmail is a function", () => {
    expect(typeof sendEmail).toBe("function")
  })

  it("returns success:false when RESEND_API_KEY is not set", async () => {
    const originalKey = process.env.RESEND_API_KEY
    delete process.env.RESEND_API_KEY
    const result = await sendEmail({ to: "test@test.com", subject: "Test", html: "<p>Test</p>" })
    process.env.RESEND_API_KEY = originalKey
    expect(result.success).toBe(false)
    expect(result.error).toBe("RESEND_API_KEY not set")
  })
})
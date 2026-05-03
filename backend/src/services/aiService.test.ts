import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("aiService", () => {
  beforeEach(() => {
    // Mock process.env
    vi.stubEnv("MINIMAX_API_KEY", "test-key")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("classifyTicket", () => {
    it("returns TECHNICAL for technical issue", async () => {
      // @ts-ignore
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "TECHNICAL" } }] }),
      })

      const { aiService } = await import("./aiService.js")
      const result = await aiService.classifyTicket("无法登录", "登录报错500")
      expect(result.category).toBe("TECHNICAL")
    })

    it("throws on invalid category response", async () => {
      // @ts-ignore
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "GARBAGE" } }] }),
      })

      const { aiService } = await import("./aiService.js")
      await expect(aiService.classifyTicket("test", "test")).rejects.toThrow()
    })

    it("returns GENERAL for general inquiry", async () => {
      // @ts-ignore
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "GENERAL" } }] }),
      })

      const { aiService } = await import("./aiService.js")
      const result = await aiService.classifyTicket("如何重置密码", "忘记了密码")
      expect(result.category).toBe("GENERAL")
    })

    it("returns REFUND for refund request", async () => {
      // @ts-ignore
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "REFUND" } }] }),
      })

      const { aiService } = await import("./aiService.js")
      const result = await aiService.classifyTicket("退款申请", "申请全额退款")
      expect(result.category).toBe("REFUND")
    })
  })

  describe("suggestReplies", () => {
    it("returns array of replies", async () => {
      // @ts-ignore
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "谢谢您的反馈\n我们会尽快处理\n感谢您的耐心" } }] }),
      })

      const { aiService } = await import("./aiService.js")
      const result = await aiService.suggestReplies({ subject: "test", body: "test", responses: [] })
      expect(result.replies).toHaveLength(3)
      expect(result.replies[0]).toBe("谢谢您的反馈")
    })

    it("returns empty array for empty response", async () => {
      // @ts-ignore
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "" } }] }),
      })

      const { aiService } = await import("./aiService.js")
      const result = await aiService.suggestReplies({ subject: "test", body: "test", responses: [] })
      expect(result.replies).toHaveLength(0)
    })
  })
})

import { describe, it, expect } from "vitest"
import { aiService } from "./aiService.js"

describe("aiService", () => {
  describe("classifyTicket", () => {
    it("returns a valid category", async () => {
      // Will fail — method doesn't exist yet
      const result = await aiService.classifyTicket("无法登录系统", "点击登录后报500错误")
      expect(["GENERAL", "TECHNICAL", "REFUND"]).toContain(result.category)
    })
  })

  describe("suggestReplies", () => {
    it("returns array of replies", async () => {
      // Will fail — method doesn't exist yet
      const result = await aiService.suggestReplies({
        subject: "测试工单",
        body: "测试内容",
        responses: []
      })
      expect(Array.isArray(result.replies)).toBe(true)
    })
  })
})
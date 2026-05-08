import Anthropic from "@anthropic-ai/sdk"

const MiniMaxClient = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://api.minimaxi.com/anthropic",
})

export const aiService = {
  async polishText(text: string): Promise<{ polished: string }> {
    if (!text.trim()) {
      return { polished: text }
    }

    const message = await MiniMaxClient.messages.create({
      model: "MiniMax-M2.7",
      max_tokens: 1024,
      system: "You are a professional customer support agent. Polish the user's reply to make it more professional, friendly, and well-structured. Keep the same meaning but improve clarity, grammar, and tone. Only return the polished text, nothing else.",
      messages: [{ role: "user", content: text }],
    })

    const firstContent = message.content.find(c => c.type === "text")
    const polished = firstContent?.type === "text" ? firstContent.text : text
    return { polished: polished || text }
  },

  async summarizeTicket(ticket: {
    subject: string
    body: string
    responses: Array<{ body: string; isCustomerReply: boolean; createdAt: string }>
  }): Promise<{ summary: string }> {
    const responseList = ticket.responses
      .map(r => `${r.isCustomerReply ? "客户" : "客服"} [${r.createdAt}]: ${r.body}`)
      .join("\n")

    const message = await MiniMaxClient.messages.create({
      model: "MiniMax-M2.7",
      max_tokens: 1024,
      system: "你是一个专业的客服支持助手,负责总结工单要点。",
      messages: [{
        role: "user",
        content: `请总结以下工单的关键信息,限制在 200 字以内:

主题:${ticket.subject}
正文:${ticket.body}
${responseList ? `回复记录:\n${responseList}` : ""}

请用中文回复,格式:
- 问题核心:...
- 已尝试步骤:...
- 当前状态:...`
      }],
    })

    const firstContent = message.content.find(c => c.type === "text")
    const summary = firstContent?.type === "text" ? firstContent.text : ""
    return { summary }
  },

  async classifyTicket(subject: string, body: string): Promise<{ category: "GENERAL" | "TECHNICAL" | "REFUND" }> {
    const message = await MiniMaxClient.messages.create({
      model: "MiniMax-M2.7",
      max_tokens: 64,
      system: "你是一个工单分类助手。根据工单的主题和内容,判断它属于哪个类别。选项:GENERAL(一般咨询),TECHNICAL(技术问题),REFUND(退款/财务相关)。只回复一个词:GENERAL、TECHNICAL 或 REFUND,不要其他内容。",
      messages: [{ role: "user", content: `主题:${subject}\n内容:${body}` }],
    })

    const firstContent = message.content.find(c => c.type === "text")
    const result = firstContent?.type === "text" ? firstContent.text.trim().toUpperCase() : ""

    // Handle partial matches (e.g., "REF" -> "REFUND", "TECH" -> "TECHNICAL")
    let category: "GENERAL" | "TECHNICAL" | "REFUND" = "GENERAL"
    if (result.includes("REFUND") || result === "REF") {
      category = "REFUND"
    } else if (result.includes("TECHNICAL") || result === "TECH") {
      category = "TECHNICAL"
    } else if (result.includes("GENERAL")) {
      category = "GENERAL"
    } else {
      throw new Error(`Invalid category from AI: ${result}`)
    }
    return { category }
  },

  async suggestReplies(ticket: {
    subject: string
    body: string
    responses: Array<{ body: string; isCustomerReply: boolean; createdAt: string }>
  }): Promise<{ replies: string[] }> {
    const responseList = ticket.responses
      .map(r => `${r.isCustomerReply ? "客户" : "客服"} [${r.createdAt}]: ${r.body}`)
      .join("\n")

    const message = await MiniMaxClient.messages.create({
      model: "MiniMax-M2.7",
      max_tokens: 512,
      system: "你是一个客服助手。根据工单内容,生成 1-3 条建议回复。每条回复不超过 50 字。用中文回复。格式:每条回复单独一行,不要编号。",
      messages: [{
        role: "user",
        content: `主题:${ticket.subject}\n内容:${ticket.body}\n${responseList ? `对话记录:\n${responseList}` : ""}`
      }],
    })

    const firstContent = message.content.find(c => c.type === "text")
    const text = firstContent?.type === "text" ? firstContent.text : ""
    const replies = text.split("\n").map(r => r.trim()).filter(r => r.length > 0).slice(0, 3)
    return { replies }
  }
}
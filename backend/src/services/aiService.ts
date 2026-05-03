const MINIMAX_API_URL = "https://api.minimax.io/v1/chat/completions"

interface PolishResult {
  polished: string
}

interface MiniMaxResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

interface SummaryResult {
  summary: string
}

export const aiService = {
  async polishText(text: string): Promise<PolishResult> {
    if (!text.trim()) {
      return { polished: text }
    }

    const apiKey = process.env.MINIMAX_API_KEY
    if (!apiKey) {
      throw new Error("MINIMAX_API_KEY not configured")
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [
          {
            role: "system",
            name: "MiniMax AI",
            content: `You are a professional customer support agent. Polish the user's reply to make it more professional, friendly, and well-structured. Keep the same meaning but improve clarity, grammar, and tone. Only return the polished text, nothing else.`
          },
          {
            role: "user",
            name: "User",
            content: text
          }
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`)
    }

    const data = await response.json() as MiniMaxResponse
    const polished = data.choices?.[0]?.message?.content ?? text

    return { polished }
  },

  async summarizeTicket(ticket: {
    subject: string
    body: string
    responses: Array<{ body: string; isCustomerReply: boolean; createdAt: string }>
  }): Promise<SummaryResult> {
    const apiKey = process.env.MINIMAX_API_KEY
    if (!apiKey) {
      throw new Error("MINIMAX_API_KEY not configured")
    }

    const responseList = ticket.responses
      .map(r => `${r.isCustomerReply ? "客户" : "客服"} [${r.createdAt}]: ${r.body}`)
      .join("\n")

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [
          {
            role: "system",
            content: `你是一个专业的客服支持助手，负责总结工单要点。`
          },
          {
            role: "user",
            content: `请总结以下工单的关键信息，限制在 200 字以内：

主题：${ticket.subject}
正文：${ticket.body}
${responseList ? `回复记录：\n${responseList}` : ""}

请用中文回复，格式：
- 问题核心：...
- 已尝试步骤：...
- 当前状态：...`
          }
        ],
        temperature: 0.3,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`)
    }

    const data = await response.json() as MiniMaxResponse
    const summary = data.choices?.[0]?.message?.content ?? ""

    return { summary }
  },

  async classifyTicket(subject: string, body: string): Promise<{ category: "GENERAL" | "TECHNICAL" | "REFUND" }> {
    const apiKey = process.env.MINIMAX_API_KEY
    if (!apiKey) throw new Error("MINIMAX_API_KEY not configured")

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [
          {
            role: "system",
            content: `你是一个工单分类助手。根据工单的主题和内容，判断它属于哪个类别。
选项：GENERAL（一般咨询）、TECHNICAL（技术问题）、REFUND（退款/财务相关）
只回复一个词：GENERAL、 TECHNICAL 或 REFUND，不要其他内容。`
          },
          {
            role: "user",
            content: `主题：${subject}\n内容：${body}`
          }
        ],
        temperature: 0.3,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    if (!response.ok) throw new Error(`MiniMax API error: ${response.status}`)

    const data = await response.json() as MiniMaxResponse
    const result = data.choices?.[0]?.message?.content?.trim().toUpperCase() ?? "GENERAL"
    const validCategories = ["GENERAL", "TECHNICAL", "REFUND"]
    const category = validCategories.includes(result) ? result as "GENERAL" | "TECHNICAL" | "REFUND" : "GENERAL"
    return { category }
  },

  async suggestReplies(ticket: {
    subject: string
    body: string
    responses: Array<{ body: string; isCustomerReply: boolean; createdAt: string }>
  }): Promise<{ replies: string[] }> {
    const apiKey = process.env.MINIMAX_API_KEY
    if (!apiKey) throw new Error("MINIMAX_API_KEY not configured")

    const responseList = ticket.responses
      .map(r => `${r.isCustomerReply ? "客户" : "客服"} [${r.createdAt}]: ${r.body}`)
      .join("\n")

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [
          {
            role: "system",
            content: `你是一个客服助手。根据工单内容，生成 1-3 条建议回复。每条回复不超过 50 字。用中文回复。
格式：每条回复单独一行，不要编号。`
          },
          {
            role: "user",
            content: `主题：${ticket.subject}\n内容：${ticket.body}\n${responseList ? `对话记录：\n${responseList}` : ""}`
          }
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    if (!response.ok) throw new Error(`MiniMax API error: ${response.status}`)

    const data = await response.json() as MiniMaxResponse
    const content = data.choices?.[0]?.message?.content ?? ""
    const replies = content.split("\n").map(r => r.trim()).filter(r => r.length > 0).slice(0, 3)
    return { replies }
  }
}
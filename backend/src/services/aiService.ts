const MINIMAX_API_URL = "https://api.minimax.io/v1/chat/completions"

interface MiniMaxResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

async function callMiniMax(
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.7
): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey) throw new Error("MINIMAX_API_KEY not configured")

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages,
        temperature,
      }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`MiniMax API error: ${response.status}`)
    const data = await response.json() as MiniMaxResponse
    return data.choices?.[0]?.message?.content ?? ""
  } finally {
    clearTimeout(timeout)
  }
}

export const aiService = {
  async polishText(text: string): Promise<{ polished: string }> {
    if (!text.trim()) {
      return { polished: text }
    }

    const content = await callMiniMax([
      {
        role: "system",
        content: `You are a professional customer support agent. Polish the user's reply to make it more professional, friendly, and well-structured. Keep the same meaning but improve clarity, grammar, and tone. Only return the polished text, nothing else.`
      },
      {
        role: "user",
        content: text
      }
    ], 0.7)

    return { polished: content || text }
  },

  async summarizeTicket(ticket: {
    subject: string
    body: string
    responses: Array<{ body: string; isCustomerReply: boolean; createdAt: string }>
  }): Promise<{ summary: string }> {
    const responseList = ticket.responses
      .map(r => `${r.isCustomerReply ? "客户" : "客服"} [${r.createdAt}]: ${r.body}`)
      .join("\n")

    const content = await callMiniMax([
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
    ], 0.3)

    return { summary: content }
  },

  async classifyTicket(subject: string, body: string): Promise<{ category: "GENERAL" | "TECHNICAL" | "REFUND" }> {
    const result = await callMiniMax([
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
    ], 0.3)

    const trimmed = result.trim().toUpperCase()
    const validCategories = ["GENERAL", "TECHNICAL", "REFUND"]
    if (!validCategories.includes(trimmed)) {
      throw new Error(`Invalid category from AI: ${result}`)
    }
    return { category: trimmed as "GENERAL" | "TECHNICAL" | "REFUND" }
  },

  async suggestReplies(ticket: {
    subject: string
    body: string
    responses: Array<{ body: string; isCustomerReply: boolean; createdAt: string }>
  }): Promise<{ replies: string[] }> {
    const responseList = ticket.responses
      .map(r => `${r.isCustomerReply ? "客户" : "客服"} [${r.createdAt}]: ${r.body}`)
      .join("\n")

    const content = await callMiniMax([
      {
        role: "system",
        content: `你是一个客服助手。根据工单内容，生成 1-3 条建议回复。每条回复不超过 50 字。用中文回复。
格式：每条回复单独一行，不要编号。`
      },
      {
        role: "user",
        content: `主题：${ticket.subject}\n内容：${ticket.body}\n${responseList ? `对话记录：\n${responseList}` : ""}`
      }
    ], 0.7)

    const replies = content.split("\n").map(r => r.trim()).filter(r => r.length > 0).slice(0, 3)
    return { replies }
  }
}
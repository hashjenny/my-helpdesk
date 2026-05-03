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

    const { Anthropic } = await import("@anthropic-ai/sdk")

    const client = new Anthropic({
      apiKey: apiKey,
      baseURL: "https://api.minimaxi.com/anthropic",
    })

    // Build prompt
    const responseList = ticket.responses
      .map(r => `${r.isCustomerReply ? "客户" : "客服"} [${r.createdAt}]: ${r.body}`)
      .join("\n")

    const prompt = `请总结以下工单的关键信息，限制在 200 字以内：

主题：${ticket.subject}
正文：${ticket.body}
${responseList ? `回复记录：\n${responseList}` : ""}

请用中文回复，格式：
- 问题核心：...
- 已尝试步骤：...
- 当前状态：...`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    let message
    try {
      message = await client.messages.create(
        {
          model: "MiniMax-M2.7",
          max_tokens: 300,
          system: "你是一个专业的客服支持助手，负责总结工单要点。",
          messages: [
            { role: "user", content: prompt }
          ],
        },
        {
          signal: controller.signal,
        }
      )
    } catch (error) {
      clearTimeout(timeout)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Summarization timed out after 30 seconds")
      }
      throw error
    }

    clearTimeout(timeout)

    let summary = ""
    for (const block of message.content) {
      if (block.type === "text") {
        summary = block.text
        break
      }
    }

    return { summary }
  }
}
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
  }
}
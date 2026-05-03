const MINIMAX_API_URL = "https://api.minimax.chat/v1/text/chatcompletion_pro"

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

    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "abab6.5s-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional customer support agent. Polish the user's reply to make it more professional, friendly, and well-structured. Keep the same meaning but improve clarity, grammar, and tone. Only return the polished text, nothing else.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`)
    }

    const data = await response.json() as MiniMaxResponse
    const polished = data.choices?.[0]?.message?.content ?? text

    return { polished }
  }
}
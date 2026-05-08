import Anthropic from "@anthropic-ai/sdk"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const MiniMaxClient = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://api.minimaxi.com/anthropic",
})

interface KBMatchResult {
  found: boolean
  answer?: string
  resolved?: boolean
}

let knowledgeBaseContent: string | null = null

function getKnowledgeBase(): string {
  if (!knowledgeBaseContent) {
    // Load from project root (parent of backend/)
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const kbPath = join(__dirname, "..", "..", "..", "knowledge-base.md")
    console.log(`[kb] Loading KB from: ${kbPath}`)
    knowledgeBaseContent = readFileSync(kbPath, "utf-8")
    console.log(`[kb] KB loaded, length: ${knowledgeBaseContent.length}`)
  }
  return knowledgeBaseContent
}

export const kbService = {
  /**
   * Check if a ticket matches any entry in the knowledge base.
   * Returns the answer if found, null otherwise.
   */
  async matchTicket(
    subject: string,
    body: string
  ): Promise<KBMatchResult> {
    const kb = getKnowledgeBase()

    const message = await MiniMaxClient.messages.create({
      model: "MiniMax-M2.7",
      max_tokens: 512,
      system:
        "You are a knowledge base matching assistant. Given a user's question and a knowledge base in Chinese, determine if the KB contains a relevant answer. " +
        "Respond with ONLY a valid JSON object, nothing else:\n" +
        '{"found": true, "answer": "the KB answer", "resolved": true} if found, or {"found": false} if not.',
      messages: [
        {
          role: "user",
          content: `Knowledge Base:\n${kb}\n\nUser Question:\nSubject: ${subject}\nContent: ${body}`,
        },
      ],
    })

    const text = message.content[0]?.type === "text" ? message.content[0].text.trim() : ""

    console.log(`[kb] Match attempt for: ${subject}`)
    console.log(`[kb] AI response: ${text}`)

    if (!text) {
      console.error(`[kb] Empty AI response`)
      return { found: false }
    }

    try {
      const result = JSON.parse(text) as KBMatchResult
      console.log(`[kb] Match result: found=${result.found}, resolved=${result.resolved}`)
      return result
    } catch (e) {
      console.error(`[kb] JSON parse error:`, e)
      return { found: false }
    }
  },
}

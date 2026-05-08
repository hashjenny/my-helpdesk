import Anthropic from "@anthropic-ai/sdk"
import { readFileSync } from "fs"
import { join } from "path"

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
    const kbPath = join(process.cwd(), "knowledge-base.md")
    knowledgeBaseContent = readFileSync(kbPath, "utf-8")
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
      max_tokens: 256,
      system:
        "You are a knowledge base matching assistant. Given a user's question and a knowledge base, determine if the knowledge base contains a relevant answer. " +
        "Respond with ONLY a JSON object, no other text:\n" +
        '{"found": true/false, "answer": "the relevant answer from KB if found", "resolved": true/false}\n' +
        '"resolved" is true only if the KB answer fully solves the problem (e.g., steps to fix, process to follow).\n' +
        "If the KB does not contain a relevant answer, respond: {\"found\": false}",
      messages: [
        {
          role: "user",
          content: `Knowledge Base:\n${kb}\n\n---\n\nUser Question:\nSubject: ${subject}\nContent: ${body}`,
        },
      ],
    })

    const text = message.content[0]?.type === "text" ? message.content[0].text.trim() : ""

    try {
      return JSON.parse(text) as KBMatchResult
    } catch {
      return { found: false }
    }
  },
}

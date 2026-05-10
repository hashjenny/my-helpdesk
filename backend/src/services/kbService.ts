import "../lib/env.js"
import path from "path"
import { fileURLToPath } from "url"

import Anthropic from "@anthropic-ai/sdk"
import { readFileSync } from "fs"
import { join } from "path"
import { logger } from "../lib/logger.js"

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
    const currentDir = path.dirname(fileURLToPath(import.meta.url))
    const kbPath = join(currentDir, "..", "..", "..", "knowledge-base.md")
    logger.info(`[kb] Loading KB from: ${kbPath}`)
    knowledgeBaseContent = readFileSync(kbPath, "utf-8")
    logger.info(`[kb] KB loaded, length: ${knowledgeBaseContent.length}`)
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

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        logger.debug(`[kb] Match attempt ${attempt}/3 for: ${subject}`)

        const message = await MiniMaxClient.messages.create({
          model: "MiniMax-M2.7",
          max_tokens: 256,
          system:
            "You are a customer support assistant. Based on the knowledge base, answer the user's question in Chinese. " +
            "If the KB has relevant info, use it. " +
            "First line: YES if KB has answer, NO if not. " +
            "Second line: Your answer (if YES) or brief explanation why not (if NO).",
          messages: [
            {
              role: "user",
              content: `Knowledge Base:\n${kb}\n\nUser Question:\nSubject: ${subject}\nContent: ${body}`,
            },
          ],
        })

        logger.debug(`[kb] Raw API response:`, JSON.stringify(message))

        // Find the text content (skip thinking)
        const textContent = message.content.find((c) => c.type === "text")
        const text = textContent?.type === "text" ? textContent.text.trim() : ""
        logger.debug(`[kb] AI response: ${text}`)

        if (!text) {
          logger.warn(`[kb] Empty AI response on attempt ${attempt}`)
          continue
        }

        // Parse: first line is YES/NO, rest is answer
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
        const firstLine = lines[0]?.toUpperCase() || ""
        const answer = lines.slice(1).join("\n").trim()

        if (firstLine.startsWith("YES") && answer) {
          logger.info(`[kb] Match found: ${answer.substring(0, 50)}...`)
          return { found: true, answer, resolved: true }
        } else {
          logger.debug(`[kb] No match found`)
          return { found: false }
        }
      } catch (e) {
        logger.error(`[kb] Attempt ${attempt} error:`, e)
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1000))
        }
      }
    }

    logger.error(`[kb] All 3 attempts failed, returning no match`)
    return { found: false }
  },
}

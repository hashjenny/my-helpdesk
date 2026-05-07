import { getQueue } from "../lib/queue.js"
import { aiService } from "../services/aiService.js"
import { ticketService } from "../services/ticketService.js"

export async function startClassifierWorker() {
  const boss = getQueue()

  await boss.work("classify-ticket", { retryBackoff: true, retryDelay: [5, 15, 30], maxRetries: 3 }, async (job) => {
    const { ticketId, subject, body } = job.data
    console.log(`[classifier] Processing ticket ${ticketId}`)

    try {
      const result = await aiService.classifyTicket(subject, body)
      await ticketService.update(ticketId, { category: result.category })
      console.log(`[classifier] Ticket ${ticketId} classified as ${result.category}`)
    } catch (error) {
      console.error(`[classifier] Failed to classify ticket ${ticketId}:`, error)
      throw error // Re-throw to trigger pg-boss retry
    }
  })

  console.log("[classifier] Worker started")
}
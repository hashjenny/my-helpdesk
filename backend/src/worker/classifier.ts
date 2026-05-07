import type { Job } from "pg-boss"
import { getQueue } from "../lib/queue.js"
import { aiService } from "../services/aiService.js"
import { ticketService } from "../services/ticketService.js"

export async function startClassifierWorker() {
  const boss = getQueue()
  await boss.start()
  await boss.createQueue("classify-ticket")

  await boss.work("classify-ticket", async (jobs: Job<{ ticketId: string; subject: string; body: string }>[]) => {
    const job = jobs[0]
    if (!job) return
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
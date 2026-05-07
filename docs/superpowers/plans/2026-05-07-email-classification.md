# Email Classification via pg-boss - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pg-boss to asynchronously classify inbound email tickets using AI.

**Architecture:** When emails create tickets, the category is set to GENERAL and a job is enqueued. A background worker picks up the job, calls AI classification, and updates the ticket category. Retry 3 times on failure with backoff (5s, 15s, 30s).

**Tech Stack:** pg-boss, Express, TypeScript, Prisma, aiService

---

## File Structure

| File | Purpose |
|------|---------|
| `backend/src/lib/queue.ts` | pg-boss singleton, exported via `getQueue()` |
| `backend/src/worker/classifier.ts` | Worker that processes classify-ticket jobs |
| `backend/src/services/email.ts` | Enqueue job after creating ticket |
| `backend/src/index.ts` | Start worker on app init |
| `backend/package.json` | Add pg-boss dependency |

---

## Task 1: Install pg-boss dependency

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Add pg-boss to backend dependencies**

Run: `cd backend && pnpm add pg-boss`

---

## Task 2: Create pg-boss queue singleton

**Files:**
- Create: `backend/src/lib/queue.ts`

- [ ] **Step 1: Write the queue module**

```typescript
import PgBoss from "pg-boss"

let boss: PgBoss | undefined

export function getQueue(): PgBoss {
  if (!boss) {
    boss = new PgBoss(process.env.DATABASE_URL!)
    boss.on("error", (error) => {
      console.error("pg-boss error:", error)
    })
  }
  return boss
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/lib/queue.ts
git commit -m "feat(queue): add pg-boss singleton"
```

---

## Task 3: Create classifier worker

**Files:**
- Create: `backend/src/worker/classifier.ts`

Worker subscribes to `classify-ticket` queue and calls aiService.classifyTicket().

- [ ] **Step 1: Write the classifier worker**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/worker/classifier.ts
git commit -m "feat(classifier): add pg-boss worker for ticket classification"
```

---

## Task 4: Modify email service to enqueue classification job

**Files:**
- Modify: `backend/src/services/email.ts`

- [ ] **Step 1: Add queue import and enqueue after ticket creation**

In `email.ts`, add import for `getQueue` and modify `processInboundEmail()` to enqueue after creating ticket:

```typescript
import { getQueue } from "../lib/queue.js"
```

In `processInboundEmail()`, after the `ticketService.create()` call (line 64-69), add:

```typescript
const queue = getQueue()
await queue.send("classify-ticket", { ticketId: ticket.id, subject, body })
```

The full change (lines 62-71):
```typescript
    // No match or ticket not found - create new ticket
    const subject = payload.subject.replace(/^(Re:\s*)+/i, "").trim() || "No Subject"
    const ticket = await ticketService.create({
      subject,
      body,
      category: "GENERAL",
      supportEmail,
    })

    const queue = getQueue()
    await queue.send("classify-ticket", { ticketId: ticket.id, subject, body })

    return { ticketId: ticket.id, isReply: false }
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/email.ts
git commit -m "feat(email): enqueue classification job after creating ticket"
```

---

## Task 5: Start classifier worker on app init

**Files:**
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Import and start worker after server starts**

Add import at top:
```typescript
import { startClassifierWorker } from "./worker/classifier.js"
```

After the `app.listen()` call (line 83-85), add:

```typescript
startClassifierWorker().catch(console.error)
```

Full change at lines 81-86:
```typescript
const PORT = Number(process.env.PORT) || 3001

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await startClassifierWorker()
})
```

Note: Since we need to await the worker, change the callback to async.

- [ ] **Step 2: Commit**

```bash
git add backend/src/index.ts
git commit -m "feat: start pg-boss classifier worker on app init"
```

---

## Verification

After all tasks:
1. Run `pnpm --filter backend dev` and verify server starts without errors
2. Send a test email to the webhook and verify:
   - Ticket is created with GENERAL category initially
   - After a few seconds, the category is updated to TECHNICAL or REFUND (if AI classification succeeds)
   - If AI fails, it retries 3 times and eventually gives up, leaving category as GENERAL
3. Check server logs for `[classifier]` output
# Email Classification via pg-boss

## Overview

Use pg-boss to asynchronously classify inbound emails using AI. When emails create tickets, classification runs in the background via a job queue instead of synchronously.

## Architecture

```
Resend webhook → emailService.processInboundEmail()
  → create ticket (category: GENERAL)
  → enqueue "classify-ticket" job
  → return immediately

pg-boss worker (same process)
  → picks up "classify-ticket" job
  → calls aiService.classifyTicket(subject, body)
  → updates ticket.category on success
  → retries 3x on failure, then gives up
```

## Implementation

### Dependencies

- `pg-boss` — job queue using PostgreSQL

### Files

| File | Purpose |
|------|---------|
| `backend/src/lib/queue.ts` | pg-boss instance singleton |
| `backend/src/worker/classifier.ts` | classify-ticket worker |
| `backend/src/services/email.ts` | enqueue job after creating ticket |
| `backend/src/index.ts` | start worker on app init |

### Queue Setup (`queue.ts`)

```typescript
import PgBoss from "pg-boss"
pg-boss uses its own connection to PostgreSQL (shares DATABASE_URL with Prisma).

let boss: PgBoss

export function getQueue() {
  if (!boss) {
    boss = new PgBoss(process.env.DATABASE_URL)
  }
  return boss
}
```

### Worker (`classifier.ts`)

- Subscribe to `classify-ticket` queue
- On job: call `aiService.classifyTicket(subject, body)`
- On success: `ticketService.update(id, { category: result.category })`
- Retry policy: 3 attempts with backoff (5s, 15s, 30s)
- On all retries failed: log error, leave category as GENERAL

### Email Service Change (`email.ts`)

In `processInboundEmail()`, after ticket creation:

```typescript
const ticket = await ticketService.create({ subject, body, category: "GENERAL", supportEmail })
await queue.send("classify-ticket", { ticketId: ticket.id, subject, body })
return ticket
```

### Server Init (`index.ts`)

On startup:
1. Start Express server
2. Start worker: `boss.start()` and register handlers
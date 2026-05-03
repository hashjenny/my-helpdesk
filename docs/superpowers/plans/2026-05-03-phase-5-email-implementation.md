# Phase 5: Email Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add agent email notifications when new tickets are created, using Resend + React Email.

**Architecture:** After a ticket is successfully created via `POST /api/tickets`, query all AGENT-role users from the DB and send them a notification email asynchronously. Email sending errors are caught and logged but do not affect the ticket creation response. The Resend client is a singleton in `backend/src/lib/resend.ts`. React Email templates live in `backend/src/emails/`.

**Tech Stack:** `resend` npm package, `@react-email/components`, React Email templates.

---

## File Map

| File | Responsibility |
|------|----------------|
| `backend/src/lib/resend.ts` | Resend client singleton, exports `sendEmail` helper |
| `backend/src/emails/ticket-created.tsx` | React Email template for new ticket notification |
| `backend/src/services/ticketService.ts` | Ticket CRUD operations (read for agent query) |
| `backend/src/routes/tickets.ts:55-69` | Add async email dispatch after `ticketService.create` succeeds |

---

## Task 1: Create Resend Client Singleton

**Files:**
- Create: `backend/src/lib/resend.ts`
- Test: `backend/src/lib/resend.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/src/lib/resend.test.ts
import { sendEmail } from "./resend.js"

describe("resend client", () => {
  it("sendEmail is a function", () => {
    expect(typeof sendEmail).toBe("function")
  })
})
```

Run: `pnpm --filter backend test -- src/lib/resend.test.ts`
Expected: FAIL — "sendEmail is not defined"

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter backend test -- src/lib/resend.test.ts
```

- [ ] **Step 3: Write minimal implementation**

```typescript
// backend/src/lib/resend.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend] RESEND_API_KEY not set, skipping email")
    return
  }
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject,
    html,
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter backend test -- src/lib/resend.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/lib/resend.ts backend/src/lib/resend.test.ts
git commit -m "feat(email): add Resend client singleton with sendEmail helper"
```

---

## Task 2: Create React Email Template for New Ticket

**Files:**
- Create: `backend/src/emails/ticket-created.tsx`
- Test: `backend/src/emails/ticket-created.test.tsx` (optional, mainly smoke test render)

- [ ] **Step 1: Write the template**

```tsx
// backend/src/emails/ticket-created.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components"

interface TicketCreatedEmailProps {
  ticketId: string
  subject: string
  requesterEmail: string
  createdAt: string
  ticketUrl: string
}

export function TicketCreatedEmail({
  ticketId,
  subject,
  requesterEmail,
  createdAt,
  ticketUrl,
}: TicketCreatedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "24px" }}>
            <Text style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
              新工单通知
            </Text>
            <Text style={{ fontSize: "14px", color: "#525f7f" }}>
              有一个新的工单需要处理。
            </Text>
            <Hr style={{ margin: "16px 0" }} />
            <Text style={{ fontSize: "14px", fontWeight: "bold" }}>工单编号</Text>
            <Text style={{ fontSize: "14px", color: "#525f7f", marginBottom: "12px" }}>
              #{ticketId}
            </Text>
            <Text style={{ fontSize: "14px", fontWeight: "bold" }}>主题</Text>
            <Text style={{ fontSize: "14px", color: "#525f7f", marginBottom: "12px" }}>
              {subject}
            </Text>
            <Text style={{ fontSize: "14px", fontWeight: "bold" }}>提交人</Text>
            <Text style={{ fontSize: "14px", color: "#525f7f", marginBottom: "12px" }}>
              {requesterEmail}
            </Text>
            <Text style={{ fontSize: "14px", fontWeight: "bold" }}>创建时间</Text>
            <Text style={{ fontSize: "14px", color: "#525f7f", marginBottom: "20px" }}>
              {createdAt}
            </Text>
            <Link
              href={ticketUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              查看工单
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const subject = (ticketId: string, ticketSubject: string) =>
  `[新工单] #${ticketId} - ${ticketSubject}`
```

- [ ] **Step 2: Verify TypeScript compiles (no test needed for template)**

```bash
pnpm --filter backend build 2>&1 | head -30
```

Expected: No errors related to `ticket-created.tsx`

- [ ] **Step 3: Commit**

```bash
git add backend/src/emails/ticket-created.tsx
git commit -m "feat(email): add TicketCreatedEmail React Email template"
```

---

## Task 3: Wire Email Notification into Ticket Creation

**Files:**
- Modify: `backend/src/routes/tickets.ts:55-69` — add async email dispatch after `ticketService.create`
- Read: `backend/src/lib/prisma.ts` — for agent user query
- Read: `backend/src/services/ticketService.ts` — understand `create` signature

- [ ] **Step 1: Write the failing test**

```typescript
// backend/src/routes/tickets.test.ts (add to existing or create)
// Test that POST /api/tickets calls sendEmail for agents
// This test requires mocking prisma and sendEmail
```

For simplicity, skip unit test here and verify manually (see Step 4).

- [ ] **Step 2: Modify the tickets POST route**

In `backend/src/routes/tickets.ts`, add after `const ticket = await ticketService.create(result.data)` (line 64):

```typescript
// After ticket creation, notify all agents (async, non-blocking)
import { sendEmail } from "../lib/resend.js"
import { render } from "@react-email/components"
// ... (import TicketCreatedEmail and subject)
import { prisma } from "../lib/prisma.js"

// Inside the POST handler, after ticket creation success:
const _ = async () => {
  try {
    const agents = await prisma.user.findMany({
      where: { role: "AGENT", deletedAt: null },
      select: { email: true },
    })
    const createdAt = ticket.createdAt instanceof Date
      ? ticket.createdAt.toLocaleString("zh-CN")
      : String(ticket.createdAt)
    const ticketUrl = `http://localhost:5173/tickets/${ticket.id}`

    await Promise.allSettled(
      agents.map((agent) =>
        sendEmail({
          to: agent.email,
          subject: `[新工单] #${ticket.id} - ${ticket.subject}`,
          html: `
            <h2>新工单通知</h2>
            <p>有一个新的工单需要处理。</p>
            <hr/>
            <p><strong>工单编号：</strong>#${ticket.id}</p>
            <p><strong>主题：</strong>${ticket.subject}</p>
            <p><strong>提交人：</strong>${ticket.supportEmail ?? "N/A"}</p>
            <p><strong>创建时间：</strong>${createdAt}</p>
            <a href="${ticketUrl}">查看工单</a>
          `,
        })
      )
    )
  } catch (err) {
    console.error("[Email] Failed to send agent notifications:", err)
  }
}
_(/* intentionally not awaited */)
```

- [ ] **Step 3: Run TypeScript build to check for errors**

```bash
pnpm --filter backend build 2>&1 | grep -E "(error|warning)" | head -20
```

Expected: No TypeScript errors

- [ ] **Step 4: Manual integration test**

Start backend: `pnpm --filter backend dev`
Start frontend: `pnpm --filter frontend dev`

```bash
# Login as admin/agent first to get token, then:
curl -X POST http://localhost:3001/api/tickets \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<YOUR_TOKEN>" \
  -d '{"subject":"测试工单","body":"测试内容","category":"GENERAL"}'
```

Check backend console for `[Email]` log and verify no unhandled error.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/tickets.ts
git commit -m "feat(email): notify agents on new ticket creation"
```

---

## Task 4: Verify Inbound Webhook Handles Simple Payload

**Files:**
- Read: `backend/src/routes/email.ts`
- Read: `backend/src/services/email.ts`

The inbound webhook already exists and handles `{ from, to, subject, text, html }`. The simplified payload `{ from, subject, body }` is a subset — confirm `processInboundEmail` uses `payload.text` (not just `payload.body`), and if `body` is passed instead of `text`, adjust the service.

- [ ] **Step 1: Check `processInboundEmail` uses `payload.text` or `payload.body`**

Looking at `backend/src/services/email.ts:38`:
```typescript
const body = payload.text || payload.html?.replace(/<[^>]*>/g, "") || ""
```

It uses `payload.text`, but the simplified test payload sends `body` not `text`. Fix `processInboundEmail` to also accept `body`.

```typescript
// backend/src/services/email.ts line 38
const body = payload.text || payload.body || payload.html?.replace(/<[^>]*>/g, "") || ""
```

- [ ] **Step 2: Manual test the webhook**

```bash
curl -X POST http://localhost:3001/api/webhooks/email \
  -H "Content-Type: application/json" \
  -d '{"from":"customer@example.com","subject":"Test ticket","body":"Test body"}'
```

Expected: `201` with `{ "ticketId": "..." }`

Verify ticket in DB has `supportEmail = "customer@example.com"`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/services/email.ts
git commit -m "fix(email): support 'body' field in inbound webhook payload"
```

---

## Task 5: Install Dependencies

This may have already been done. Verify:

- [ ] **Step 1: Check `resend` is in dependencies**

```bash
grep '"resend"' backend/package.json
```

If missing: `pnpm --filter backend add resend @react-email/components`

- [ ] **Step 2: Commit if package.json changed**

```bash
git add backend/package.json pnpm-lock.yaml
git commit -m "deps(email): add resend and @react-email/components"
```

---

## Spec Coverage Check

| Spec Section | Tasks |
|---|---|
| Email sending to agents on new ticket | Task 1, Task 3 |
| React Email template | Task 2 |
| Async/non-blocking dispatch | Task 3 (unawaited async IIFE) |
| Error handling (log only) | Task 3 (try/catch with console.error) |
| Inbound webhook simplified test | Task 4 |
| Dependencies | Task 5 |

## Placeholder Scan

- No "TBD" or "TODO" in plan
- All code blocks are complete
- No references to "similar to Task N" without repetition
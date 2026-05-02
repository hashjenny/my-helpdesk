# Email Reply Feature Design

**Date:** 2026-05-02
**Topic:** Customer email reply to agent responses

## Overview

When an agent responds to a ticket, send an email notification to the customer. When the customer replies, the email system extracts the ticket ID from the subject line, finds the corresponding ticket, and adds the reply as a ticket response.

## Flow

1. Agent submits response via `ReplyForm` → `POST /api/tickets/:id/responses`
2. Backend sends email to `ticket.supportEmail` with subject `[Ticket #ID] Original Subject`
3. Customer replies to that email
4. Resend webhook fires `POST /api/webhooks/email`
5. Backend extracts ticket ID from subject line
6. If ID found → finds ticket → adds reply as response with `isCustomerReply: true`
7. If ID not found → creates new ticket (existing behavior)

## Changes

### 1. Prisma Schema — Add `isCustomerReply` to `TicketResponse`

```prisma
model TicketResponse {
  id              String   @id @default(cuid())
  ticketId        String
  body            String
  isCustomerReply Boolean  @default(false)
  createdAt       DateTime @default(now())
  ticket          Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}
```

### 2. Backend — Email Service (`backend/src/services/email.ts`)

Add `sendTicketResponseEmail` function:

```typescript
async sendTicketResponseEmail(ticket: Ticket, responseBody: string) {
  // Use Resend API to send email
  // From: support@helpdesk.com (or configured support email)
  // To: ticket.supportEmail
  // Subject: [Ticket #${ticket.id}] ${ticket.subject}
  // Body: responseBody
}
```

Requires `resend` package.

### 3. Backend — Ticket Service (`backend/src/services/ticketService.ts`)

After adding a response, trigger the email:

```typescript
async addResponse(ticketId: string, body: string) {
  const response = await prisma.ticketResponse.create({
    data: { ticketId, body, isCustomerReply: false }
  })

  // Fetch ticket to get supportEmail, then send email
  const ticket = await this.getById(ticketId)
  if (ticket?.supportEmail) {
    await emailService.sendTicketResponseEmail(ticket, body)
  }

  return response
}
```

### 4. Backend — Email Webhook (`backend/src/routes/email.ts`)

Update `processInboundEmail` to detect ticket ID in subject:

```typescript
async processInboundEmail(payload: ResendWebhookPayload) {
  // Extract ticket ID from subject: [Ticket #ID] Subject
  const ticketIdMatch = payload.subject.match(/\[Ticket #([^\]]+)\]/)

  if (ticketIdMatch) {
    const ticketId = ticketIdMatch[1]
    const ticket = await ticketService.getById(ticketId)

    if (ticket) {
      // Add as customer reply
      const response = await ticketService.addResponse(ticketId, body)
      await prisma.ticketResponse.update({
        where: { id: response.id },
        data: { isCustomerReply: true }
      })
      // Optionally re-open ticket if it was CLOSED/RESOLVED
      return { ticketId, responseId: response.id, isReply: true }
    }
  }

  // No ID found → create new ticket (existing behavior)
  const ticket = await ticketService.create({ subject, body, category: "GENERAL", supportEmail })
  return { ticketId: ticket.id, isReply: false }
}
```

### 5. Frontend — Ticket Responses (`frontend/src/components/tickets/TicketResponses.tsx`)

Display "Customer" badge vs "Agent" based on `isCustomerReply`:

```typescript
<span className={`font-medium ${response.isCustomerReply ? "text-blue-600" : "text-gray-900"}`}>
  {response.isCustomerReply ? "Customer" : "Agent"}
</span>
```

### 6. Shared — TicketResponse Interface (`shared/index.ts`)

Add `isCustomerReply` to interface:

```typescript
export interface TicketResponse {
  id: string
  ticketId: string
  body: string
  isCustomerReply: boolean
  createdAt: string
}
```

### 7. Dependencies

Add `resend` package to `backend/package.json`:

```bash
pnpm add resend
```

Add to `.env`:

```
RESEND_API_KEY="re_xxxxx"
RESEND_FROM_EMAIL="support@helpdesk.com"
```

## Database Migration

```bash
pnpm --filter backend prisma migrate dev --name add_is_customer_reply_to_ticket_response
```

## Edge Cases

| Case | Handling |
|------|----------|
| Reply to closed ticket | Add response, optionally re-open to OPEN |
| Reply to non-existent ticket ID | Create new ticket |
| Customer has no email on file | Email fails silently, agent notified in UI |
| Subject with no `[Ticket #]` prefix | Treat as new ticket creation |

## Testing

1. Create ticket via email webhook
2. Agent responds → verify email sent to customer
3. Customer replies → verify response added with `isCustomerReply: true`
4. Verify frontend shows "Customer" badge

## Status

Draft — pending implementation

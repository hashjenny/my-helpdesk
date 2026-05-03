# Phase 5: Email Integration Design

**Date:** 2026-05-03
**Status:** Approved

---

## Overview

Phase 5 adds email notification sending (Resend) and a simplified inbound webhook for email-to-ticket conversion. Email sending triggers when a new ticket is created and notifies all agents. The inbound webhook is tested manually since the Resend test address cannot receive real external emails.

---

## 1. Email Sending

### Trigger

- **Event:** New ticket created via `POST /api/tickets`
- **Action:** Send notification email to all agents
- **Timing:** Asynchronous (non-blocking, after response sent)

### Implementation

**File: `backend/src/lib/resend.ts`**
- Resend client singleton with API key from env (`RESEND_API_KEY`)
- Export `sendEmail(to, subject, html)` helper

**File: `backend/src/emails/ticket-created.tsx`**
- React Email template for new ticket notification
- Fields: ticket ID, subject, requester email, created at, ticket URL
- Plain text fallback for email clients that don't render HTML

**File: `backend/src/routes/tickets.ts`** (modify `POST /tickets`)
- After successful ticket creation, query all agents from DB
- Call Resend helper to send notification to each agent email
- Wrap in try/catch — failures log only, do not affect the 201 response

**Email content:**
- From: `onboarding@resend.dev`
- Subject: `[新工单] #{ticketId} - {subject}`
- Body: Ticket detail link (`http://localhost:5173/tickets/{id}`), requester, created time

### Dependencies

- `resend` package (backend)
- `@react-email/components` (backend, for React Email templates)

### Error Handling

- Resend API errors: caught, logged via `console.error`, never thrown
- Missing `RESEND_API_KEY`: log warning, skip sending, do not block ticket creation

---

## 2. Email Receiving (Simplified Verification)

### Endpoint

- `POST /api/webhooks/email` (already exists in `backend/src/routes/webhooks.ts`)

### Manual Test Payload

```json
{
  "from": "customer@example.com",
  "subject": "无法登录系统",
  "body": "登录时报错500..."
}
```

### Test Command

```bash
curl -X POST http://localhost:3001/api/webhooks/email \
  -H "Content-Type: application/json" \
  -d '{"from":"customer@example.com","subject":"Test ticket","body":"Test body"}'
```

### Behavior

- Extract `from` (customer email), `subject`, `body`
- Create ticket with `supportEmail` field set to customer email
- Return created ticket JSON

### Note on Real Inbound

Once a real domain is configured with Resend Inbound Routing, Resend will POST incoming emails to this same endpoint automatically. The parsing logic (from/subject/body extraction) will work without changes.

---

## Files to Create/Modify

### New Files
- `backend/src/lib/resend.ts` — Resend client
- `backend/src/emails/ticket-created.tsx` — React Email template

### Modified Files
- `backend/src/routes/tickets.ts` — Add email dispatch after ticket creation
- `backend/package.json` — Add `resend` dependency
- `backend/src/routes/webhooks.ts` — Verify existing webhook handles the simplified payload

---

## Testing Plan

1. Create ticket via `POST /api/tickets` → verify agents receive email (check Resend dashboard logs)
2. `POST /api/webhooks/email` with test payload → verify ticket created with `supportEmail` field
3. Verify ticket creation succeeds even if email sending fails (error is swallowed)

---

## Out of Scope

- Agent reply-to email notifications (future)
- Email thread/conversation view (future)
- Real domain inbound routing setup (future Phase 5 iteration)
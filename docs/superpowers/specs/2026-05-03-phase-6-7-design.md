# Phase 6 & 7 Implementation Design

**Date:** 2026-05-03
**Status:** Draft

---

## Overview

Implement missing Phase 6 AI features (classification, suggested replies) and Phase 7 Dashboard.

---

## Phase 6: AI Features

### 6.1 AI Classification

**Backend: `POST /api/tickets/:id/classify`**

- Agent clicks "Classify" button → calls this endpoint
- Sends ticket subject + body to MiniMax
- Returns suggested category: `{ category: "GENERAL" | "TECHNICAL" | "REFUND" }`
- Does NOT auto-update ticket — returns suggestion for agent to review

**Frontend: Ticket Detail Page**

- When ticket detail loads, if ticket category is still default ("GENERAL"), automatically call classify endpoint and show the suggestion as a badge/pill near the category selector
- "Classify" button for agents to re-run classification manually
- Shows category suggestion inline with option to apply

### 6.2 AI Suggested Replies

**Backend: `GET /api/tickets/:id/suggested-reply`**

- Agent clicks "Suggest Reply" → calls this endpoint
- Sends ticket subject + body + all responses to MiniMax
- Returns 1-3 suggested reply drafts as array

**Frontend: Ticket Detail Page**

- "Suggest Reply" button in reply area
- Shows suggested replies as clickable chips/text
- Agent can click to populate reply textarea, then edit before sending

### 6.3 AI Service Updates

**File: `backend/src/services/aiService.ts`**

Add two new methods:
- `classifyTicket(subject, body)` → `{ category: "GENERAL" | "TECHNICAL" | "REFUND" }`
- `suggestReplies(subject, body, responses)` → `{ replies: string[] }`

**Issues to fix in existing `aiService.ts`:**
- Remove `@anthropic-ai/sdk` dynamic import (not needed — using native fetch)
- Unify on MiniMax API only
- Add proper error handling and timeout

---

## Phase 7: Dashboard

### 7.1 Dashboard API

**New route: `backend/src/routes/dashboard.ts`**

- `GET /api/dashboard/stats` — Returns ticket counts by status and category
  ```json
  {
    "total": 100,
    "byStatus": { "OPEN": 50, "RESOLVED": 30, "CLOSED": 20 },
    "byCategory": { "GENERAL": 40, "TECHNICAL": 35, "REFUND": 25 }
  }
  ```

- `GET /api/dashboard/recent` — Returns 10 most recent tickets
  ```json
  {
    "tickets": [
      { "id", "subject", "status", "category", "createdAt", "supportEmail" }
    ]
  }
  ```

### 7.2 Frontend Dashboard

**New page: `frontend/src/pages/Dashboard.tsx`**

Route: `/` (replace placeholder Dashboard)

**Components:**
- Stat cards: Total tickets, Open, Resolved, Closed (4 cards)
- Category breakdown: General / Technical / Refund counts
- Recent tickets table (last 10)

**No charts** — keep it simple with cards and a table (YAGNI). Charts can be added later if needed.

---

## Architecture

### Backend File Changes

| File | Action |
|------|--------|
| `backend/src/services/aiService.ts` | Add `classifyTicket`, `suggestReplies`; remove @anthropic-ai/sdk dependency |
| `backend/src/routes/tickets.ts` | Add `POST /:id/classify` and `GET /:id/suggested-reply` routes |
| `backend/src/routes/dashboard.ts` | Create new — stats and recent endpoints |
| `backend/src/index.ts` | Wire dashboard router |

### Frontend File Changes

| File | Action |
|------|--------|
| `frontend/src/pages/Dashboard.tsx` | Create — stats cards + recent table |
| `frontend/src/pages/TicketDetail.tsx` | Add Classify button + Suggested Reply button |
| `frontend/src/lib/api/index.ts` | Add `fetchDashboardStats()`, `fetchDashboardRecent()` |

---

## Error Handling

- AI API errors: catch, log, return `{ error: "..." }` with 500
- Timeout: 30 seconds max per AI call
- Missing API key: throw early with clear message

---

## Testing

**Backend:**
- Unit tests for `aiService.classifyTicket` and `aiService.suggestReplies` (mock MiniMax)
- Integration test for dashboard endpoints

**Frontend:**
- Dashboard page smoke test (renders without crashing)
- Ticket detail AI buttons visible to agents only

---

## Out of Scope

- Real-time dashboard updates (WebSocket/SSE)
- Ticket assignment UI in dashboard
- Export functionality
- Email charts
# Phase 6 & 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 6 AI features (classification, suggested replies) and Phase 7 Dashboard (stats API + frontend).

**Architecture:** Use Anthropic SDK (`@anthropic-ai/sdk`) with MiniMax baseURL. aiService.ts gets two new methods. Dashboard is a new router. Frontend adds two new API functions and a Dashboard page.

**Tech Stack:** React 19, TanStack Query, Express, Prisma, MiniMax API via Anthropic SDK.

---

## File Map

| File | Responsibility |
|------|----------------|
| `backend/src/services/aiService.ts` | MiniMax API wrapper via Anthropic SDK — add `classifyTicket`, `suggestReplies` |
| `backend/src/routes/tickets.ts:217+` | Add `POST /:id/classify` and `GET /:id/suggested-reply` routes |
| `backend/src/routes/dashboard.ts` | New — `GET /api/dashboard/stats` and `GET /api/dashboard/recent` |
| `backend/src/index.ts` | Wire dashboard router at `/api/dashboard` |
| `frontend/src/lib/api/tickets.ts` | Add `classifyTicket(id, token)` and `suggestReplies(id, token)` |
| `frontend/src/lib/api/index.ts` | Re-export from tickets.ts |
| `frontend/src/pages/TicketDetail.tsx` | Add Classify button + AI category suggestion + Suggest Reply button |
| `frontend/src/pages/Dashboard.tsx` | New — stat cards + recent tickets table |

---

## Task 1: Fix and Extend aiService.ts

**Files:**
- Modify: `backend/src/services/aiService.ts`
- Test: `backend/src/services/aiService.test.ts`

**Context:** aiService.ts needs two new methods (`classifyTicket`, `suggestReplies`) and should use Anthropic SDK for all AI calls to MiniMax.

**Implementation approach:** Use `@anthropic-ai/sdk` with `baseURL: "https://api.minimax.chat/v1"` to call MiniMax-M2.7 model via Anthropic-compatible API.

**Code example:**
```typescript
import Anthropic from "@anthropic-ai/sdk"

const MiniMaxClient = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://api.minimax.chat/v1",
})

async classifyTicket(subject: string, body: string): Promise<{ category: "GENERAL" | "TECHNICAL" | "REFUND" }> {
  const message = await MiniMaxClient.messages.create({
    model: "MiniMax-M2.7",
    max_tokens: 64,
    system: "你是一个工单分类助手...",
    messages: [{ role: "user", content: `主题:${subject}\n内容:${body}` }],
  })
  const result = message.content[0]?.type === "text" ? message.content[0].text.trim().toUpperCase() : ""
  // ...
}
```

- [ ] **Step 1: Write the failing tests**

```typescript
// backend/src/services/aiService.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { aiService } from "./aiService.js"

describe("aiService", () => {
  describe("classifyTicket", () => {
    it("returns a valid category", async () => {
      // Will fail - method doesn't exist yet
      const result = await aiService.classifyTicket("无法登录", "登录时报错500")
      expect(["GENERAL", "TECHNICAL", "REFUND"]).toContain(result.category)
    })
  })

  describe("suggestReplies", () => {
    it("returns array of replies", async () => {
      // Will fail - method doesn't exist yet
      const result = await aiService.suggestReplies({
        subject: "测试",
        body: "测试内容",
        responses: []
      })
      expect(Array.isArray(result.replies)).toBe(true)
    })
  })
})
```

Run: `pnpm --filter backend test -- src/services/aiService.test.ts`
Expected: FAIL — "classifyTicket is not a function"

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter backend test -- src/services/aiService.test.ts
```

- [ ] **Step 3: Implement — add classifyTicket and suggestReplies, fix summarizeTicket**

Replace `summarizeTicket` to use pure fetch (remove `@anthropic-ai/sdk`), add both new methods.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm --filter backend test -- src/services/aiService.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/aiService.ts backend/src/services/aiService.test.ts
git commit -m "feat(ai): add classifyTicket and suggestReplies, remove @anthropic-ai/sdk"
```

---

## Task 2: Add Classify and Suggested Reply Routes

**Files:**
- Modify: `backend/src/routes/tickets.ts` — add two new routes after the summarize route (after line 244)
- Test: `backend/src/routes/tickets.test.ts` (or manual test)

**Add to `backend/src/routes/tickets.ts`** after the `POST /:id/summarize` route (around line 244):

```typescript
// POST /api/tickets/:id/classify - AI classify ticket category
router.post("/:id/classify", requireAuth, async (req, res) => {
  try {
    const ticket = await ticketService.getById(req.params.id as string)
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" })
      return
    }
    if (req.user?.role === "AGENT" && ticket.assignedTo !== req.user?.id) {
      res.status(403).json({ error: "Access denied" })
      return
    }

    const result = await aiService.classifyTicket(ticket.subject, ticket.body)
    res.json(result)
  } catch (error) {
    const err = error as { message?: string }
    console.error("Classify error:", err?.message || error)
    res.status(500).json({ error: "Failed to classify ticket" })
  }
})

// GET /api/tickets/:id/suggested-reply - AI suggest replies
router.get("/:id/suggested-reply", requireAuth, async (req, res) => {
  try {
    const ticket = await ticketService.getById(req.params.id as string)
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" })
      return
    }
    if (req.user?.role === "AGENT" && ticket.assignedTo !== req.user?.id) {
      res.status(403).json({ error: "Access denied" })
      return
    }

    const result = await aiService.suggestReplies({
      subject: ticket.subject,
      body: ticket.body,
      responses: (ticket.responses ?? []).map(r => ({
        body: r.body,
        isCustomerReply: r.isCustomerReply,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      })),
    })
    res.json(result)
  } catch (error) {
    const err = error as { message?: string }
    console.error("Suggest reply error:", err?.message || error)
    res.status(500).json({ error: "Failed to generate suggested replies" })
  }
})
```

- [ ] **Step 1: Verify build passes with new routes**

```bash
pnpm --filter backend build 2>&1 | grep -E "error" | head -5
```

Expected: No errors

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/tickets.ts
git commit -m "feat(ai): add classify and suggested-reply endpoints"
```

---

## Task 3: Create Dashboard API

**Files:**
- Create: `backend/src/routes/dashboard.ts`
- Modify: `backend/src/index.ts` — wire dashboard router
- Test: `backend/src/routes/dashboard.test.ts`

**Create `backend/src/routes/dashboard.ts`:**

```typescript
import { Router } from "express"
import { requireAuth } from "../middleware/session.js"
import { prisma } from "../lib/prisma.js"

const router = Router()

// GET /api/dashboard/stats - Ticket counts by status and category
router.get("/stats", requireAuth, async (_req, res) => {
  try {
    const [total, byStatus, byCategory] = await Promise.all([
      prisma.ticket.count({ where: { deletedAt: null } }),
      prisma.ticket.groupBy({
        by: ["status"],
        _count: { status: true },
        where: { deletedAt: null },
      }),
      prisma.ticket.groupBy({
        by: ["category"],
        _count: { category: true },
        where: { deletedAt: null },
      }),
    ])

    const statusMap: Record<string, number> = {}
    for (const row of byStatus) {
      statusMap[row.status] = row._count.status
    }

    const categoryMap: Record<string, number> = {}
    for (const row of byCategory) {
      categoryMap[row.category] = row._count.category
    }

    res.json({
      total,
      byStatus: {
        OPEN: statusMap["OPEN"] ?? 0,
        RESOLVED: statusMap["RESOLVED"] ?? 0,
        CLOSED: statusMap["CLOSED"] ?? 0,
      },
      byCategory: {
        GENERAL: categoryMap["GENERAL"] ?? 0,
        TECHNICAL: categoryMap["TECHNICAL"] ?? 0,
        REFUND: categoryMap["REFUND"] ?? 0,
      },
    })
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" })
  }
})

// GET /api/dashboard/recent - 10 most recent tickets
router.get("/recent", requireAuth, async (_req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        subject: true,
        status: true,
        category: true,
        createdAt: true,
        supportEmail: true,
      },
    })
    res.json({ tickets })
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch recent tickets" })
  }
})

export default router
```

**Modify `backend/src/index.ts` — add after the email webhook line (line 63):**

```typescript
import dashboardRouter from "./routes/dashboard.js"

// ... existing code ...

// Dashboard routes
app.use("/api/dashboard", dashboardRouter)
```

- [ ] **Step 1: Write tests for dashboard endpoints**

```typescript
// backend/src/routes/dashboard.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import request from "supertest"
import { Express } from "express"
import { createTestApp } from "../../test/test-utils.js"
// ... (use your test setup pattern)
```

For simplicity, test manually:
```bash
curl http://localhost:3001/api/dashboard/stats -H "Cookie: better-auth.session_token=<TOKEN>"
curl http://localhost:3001/api/dashboard/recent -H "Cookie: better-auth.session_token=<TOKEN>"
```

- [ ] **Step 2: Verify build passes**

```bash
pnpm --filter backend build 2>&1 | grep -E "error" | head -5
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/dashboard.ts backend/src/index.ts
git commit -m "feat(dashboard): add stats and recent tickets API"
```

---

## Task 4: Frontend — Add API Functions

**Files:**
- Modify: `frontend/src/lib/api/tickets.ts` — add `classifyTicket` and `suggestReplies`

**Add to `frontend/src/lib/api/tickets.ts`:**

```typescript
export async function classifyTicket(id: string, token: string): Promise<{ category: "GENERAL" | "TECHNICAL" | "REFUND" }> {
  const instance = createAxiosInstance(token)
  const response = await instance.post(`/api/tickets/${id}/classify`)
  return response.data as { category: "GENERAL" | "TECHNICAL" | "REFUND" }
}

export async function suggestReplies(id: string, token: string): Promise<{ replies: string[] }> {
  const instance = createAxiosInstance(token)
  const response = await instance.get(`/api/tickets/${id}/suggested-reply`)
  return response.data as { replies: string[] }
}
```

- [ ] **Step 1: Verify TypeScript compiles**

```bash
pnpm --filter frontend build 2>&1 | grep -E "error|classifyTicket|suggestReplies" | head -10
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/api/tickets.ts
git commit -m "feat(api): add classifyTicket and suggestReplies"
```

---

## Task 5: Frontend — Add AI Buttons to TicketDetail

**Files:**
- Modify: `frontend/src/pages/TicketDetail.tsx`

**Context:** The page already has AI summary card (lines 132-166). Need to add:
1. Below the category selector: if category is "GENERAL", show an AI suggestion badge with "AI suggests: TECHNICAL" and an "Apply" button
2. In the reply area (near ReplyForm): add "Suggest Reply" button

**Add imports:**
```typescript
import { classifyTicket, suggestReplies } from "../lib/api/tickets"
import { Sparkles } from "lucide-react"
```

**Add state below existing summary state (after line 55):**
```typescript
const [suggestedCategory, setSuggestedCategory] = useState<"GENERAL" | "TECHNICAL" | "REFUND" | null>(null)
const [isClassifying, setIsClassifying] = useState(false)
const [suggestedReplies, setSuggestedReplies] = useState<string[]>([])
const [isSuggestingReplies, setIsSuggestingReplies] = useState(false)
```

**Add auto-classify effect (after the summary loading state setup around line 55):**
```typescript
// Auto-classify when ticket loads and category is default GENERAL
useEffect(() => {
  if (ticket && ticket.category === "GENERAL" && !suggestedCategory) {
    handleClassify()
  }
}, [ticket?.id])
```

**Add handler functions:**
```typescript
const handleClassify = async () => {
  if (!id || !token) return
  setIsClassifying(true)
  try {
    const result = await classifyTicket(id, token)
    setSuggestedCategory(result.category)
  } catch {
    // Silently fail — not critical
  } finally {
    setIsClassifying(false)
  }
}

const handleSuggestReplies = async () => {
  if (!id || !token) return
  setIsSuggestingReplies(true)
  try {
    const result = await suggestReplies(id, token)
    setSuggestedReplies(result.replies)
  } catch {
    // Silently fail
  } finally {
    setIsSuggestingReplies(false)
  }
}

const applySuggestedCategory = () => {
  if (suggestedCategory) {
    handleCategoryChange(suggestedCategory)
    setSuggestedCategory(null)
  }
}
```

**Modify the Category selector section (around line 207-219)** — add AI suggestion badge:

```tsx
<div>
  <label className="text-sm font-medium block mb-1">Category</label>
  <select
    className="w-full border rounded px-3 py-2 text-sm"
    value={ticket.category}
    onChange={(e) => handleCategoryChange(e.target.value as TicketCategory)}
    disabled={updateMutation.isPending}
  >
    <option value="GENERAL">General</option>
    <option value="TECHNICAL">Technical</option>
    <option value="REFUND">Refund</option>
  </select>
  {suggestedCategory && suggestedCategory !== ticket.category && (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        AI建议: {suggestedCategory}
      </span>
      <button
        onClick={applySuggestedCategory}
        className="text-xs text-purple-600 hover:text-purple-800 underline"
      >
        应用
      </button>
    </div>
  )}
  {isClassifying && <span className="text-xs text-muted-foreground mt-1 block">AI分析中...</span>}
</div>
```

**Add "Suggest Reply" button in ReplyForm area (around line 183):**

In the `ReplyForm` component or just above it, add:
```tsx
<div className="flex items-center gap-2 mb-2">
  <button
    onClick={handleSuggestReplies}
    disabled={isSuggestingReplies}
    className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
  >
    <Sparkles className="w-4 h-4" />
    {isSuggestingReplies ? "生成中..." : "AI 推荐回复"}
  </button>
</div>

{suggestedReplies.length > 0 && (
  <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
    <p className="text-xs font-medium text-purple-700 mb-2">推荐回复：</p>
    <div className="flex flex-wrap gap-2">
      {suggestedReplies.map((reply, i) => (
        <button
          key={i}
          onClick={() => {/* populate reply form — pass via callback */}}
          className="text-xs text-left px-2 py-1 bg-white border border-purple-200 rounded hover:bg-purple-100 transition-colors"
        >
          {reply}
        </button>
      ))}
    </div>
  </div>
)}
```

**Note on ReplyForm population:** The simplest approach: store the selected reply in a state variable and pass it as `defaultValue` to `ReplyForm`. If `ReplyForm` doesn't support `defaultValue`, modify it to accept an optional `defaultValue` prop.

- [ ] **Step 1: Verify frontend builds**

```bash
pnpm --filter frontend build 2>&1 | grep -E "error" | head -10
```

- [ ] **Step 2: Manual test** — start frontend and verify:
  - TicketDetail shows AI classification suggestion when category is GENERAL
  - "Suggest Reply" button appears and shows reply suggestions

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/TicketDetail.tsx
git commit -m "feat(ai): add classify and suggest reply buttons to TicketDetail"
```

---

## Task 6: Frontend — Create Dashboard Page

**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/src/App.tsx` — update route for `/` to use Dashboard

**Create `frontend/src/pages/Dashboard.tsx`:**

```typescript
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { fetchDashboardStats, fetchDashboardRecent } from "@/lib/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import type { TicketStatus, TicketCategory } from "@helpdesk/shared"

const statusLabels: Record<TicketStatus, string> = {
  OPEN: "待处理",
  RESOLVED: "已解决",
  CLOSED: "已关闭",
}

const categoryLabels: Record<TicketCategory, string> = {
  GENERAL: "一般咨询",
  TECHNICAL: "技术问题",
  REFUND: "退款",
}

export function Dashboard() {
  const { session } = useAuth()
  const token = session?.session?.token ?? ""

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => fetchDashboardStats(token),
    enabled: Boolean(token),
  })

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ["dashboard", "recent"],
    queryFn: () => fetchDashboardRecent(token),
    enabled: Boolean(token),
  })

  if (statsLoading) return <div className="p-6">加载中...</div>

  const statCards = [
    { label: "总工单", value: stats?.total ?? 0, color: "bg-blue-50 border-blue-200" },
    { label: "待处理", value: stats?.byStatus.OPEN ?? 0, color: "bg-yellow-50 border-yellow-200" },
    { label: "已解决", value: stats?.byStatus.RESOLVED ?? 0, color: "bg-green-50 border-green-200" },
    { label: "已关闭", value: stats?.byStatus.CLOSED ?? 0, color: "bg-gray-50 border-gray-200" },
  ]

  const categoryCards = [
    { label: "一般咨询", key: "GENERAL" as const, color: "bg-blue-50 border-blue-200" },
    { label: "技术问题", key: "TECHNICAL" as const, color: "bg-orange-50 border-orange-200" },
    { label: "退款", key: "REFUND" as const, color: "bg-red-50 border-red-200" },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className={card.color}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {categoryCards.map((card) => (
          <Card key={card.key} className={card.color}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{stats?.byCategory[card.key] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近工单</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : recent?.tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无工单</p>
          ) : (
            <div className="space-y-2">
              {recent?.tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.supportEmail ?? "无邮箱"} · {new Date(ticket.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      ticket.status === "OPEN" ? "bg-yellow-100 text-yellow-800" :
                      ticket.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {statusLabels[ticket.status as TicketStatus]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Create `frontend/src/lib/api/dashboard.ts`:**

```typescript
import axios from "axios"
import { API_BASE } from "./auth-client"

const createAxiosInstance = (token: string) => {
  const instance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  return instance
}

export interface DashboardStats {
  total: number
  byStatus: { OPEN: number; RESOLVED: number; CLOSED: number }
  byCategory: { GENERAL: number; TECHNICAL: number; REFUND: number }
}

export interface RecentTicket {
  id: string
  subject: string
  status: string
  category: string
  createdAt: string
  supportEmail: string | null
}

export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
  const instance = createAxiosInstance(token)
  const response = await instance.get("/api/dashboard/stats")
  return response.data
}

export async function fetchDashboardRecent(token: string): Promise<{ tickets: RecentTicket[] }> {
  const instance = createAxiosInstance(token)
  const response = await instance.get("/api/dashboard/recent")
  return response.data
}
```

**Modify `frontend/src/App.tsx`** — update the `/` route to use Dashboard:

```tsx
import { Dashboard } from "./pages/Dashboard"

// In the route definition:
<Route path="/" element={<Dashboard />} />
```

Remove the old Dashboard import if it's a placeholder.

- [ ] **Step 1: Verify frontend builds**

```bash
pnpm --filter frontend build 2>&1 | grep -E "error" | head -10
```

- [ ] **Step 2: Start frontend and test** — verify Dashboard page loads at `/`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx frontend/src/lib/api/dashboard.ts frontend/src/App.tsx
git commit -m "feat(dashboard): add Dashboard page with stats and recent tickets"
```

---

## Spec Coverage Check

| Spec Section | Tasks |
|---|---|
| AI classifyTicket method | Task 1 |
| AI suggestReplies method | Task 1 |
| Remove @anthropic-ai/sdk | Task 1 |
| POST /tickets/:id/classify route | Task 2 |
| GET /tickets/:id/suggested-reply route | Task 2 |
| Dashboard stats API | Task 3 |
| Dashboard recent API | Task 3 |
| Frontend classifyTicket/suggestReplies API | Task 4 |
| TicketDetail classify UI | Task 5 |
| TicketDetail suggest reply UI | Task 5 |
| Dashboard page | Task 6 |

## Placeholder Scan

- No "TBD", "TODO", or "fill in details" in steps
- All code blocks are complete
- All function names and types are consistent across tasks
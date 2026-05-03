# AI 工单总结功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在工单详情页添加 AI 总结功能，帮助客服快速了解工单要点，每次点击刷新总结内容。

**Architecture:** 后端新增 `summarizeTicket` AI 方法和 `POST /api/tickets/:id/summarize` 路由，前端在 `TicketDetail` 页面标题下方添加总结卡片组件，包含刷新按钮触发重新生成。

**Tech Stack:** Express + TypeScript (backend), React + TanStack Query + Axios (frontend), MiniMax API

---

## File Structure

- Modify: `backend/src/services/aiService.ts` — 添加 `summarizeTicket` 方法
- Modify: `backend/src/routes/tickets.ts` — 添加 summarize 路由
- Modify: `frontend/src/lib/api/tickets.ts` — 添加 `summarizeTicket` API 函数
- Modify: `frontend/src/pages/TicketDetail.tsx` — 添加总结 UI

---

## Task 1: 后端 - aiService 添加 summarizeTicket 方法

**Files:**
- Modify: `backend/src/services/aiService.ts`

- [ ] **Step 1: 在 aiService.ts 添加 summarizeTicket 方法**

在 `aiService` 对象中添加：

```typescript
interface SummaryResult {
  summary: string
}

async summarizeTicket(ticket: {
  subject: string
  body: string
  responses: Array<{ body: string; isCustomerReply: boolean; createdAt: string }>
}): Promise<SummaryResult> {
  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY not configured")
  }

  const client = new Anthropic({
    apiKey: apiKey,
    baseURL: "https://api.minimaxi.com/anthropic",
  })

  // 构建 prompt
  const responseList = ticket.responses
    .map(r => `${r.isCustomerReply ? "客户" : "客服"} [${r.createdAt}]: ${r.body}`)
    .join("\n")

  const prompt = `请总结以下工单的关键信息，限制在 200 字以内：

主题：${ticket.subject}
正文：${ticket.body}
${responseList ? `回复记录：\n${responseList}` : ""}

请用中文回复，格式：
- 问题核心：...
- 已尝试步骤：...
- 当前状态：...`

  const message = await client.messages.create({
    model: "MiniMax-M2.7",
    max_tokens: 300,
    system: "你是一个专业的客服支持助手，负责总结工单要点。",
    messages: [
      { role: "user", content: prompt }
    ],
  })

  let summary = ""
  for (const block of message.content) {
    if (block.type === "text") {
      summary = block.text
      break
    }
  }

  return { summary }
}
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/services/aiService.ts
git commit -m "feat: add summarizeTicket AI method"
```

---

## Task 2: 后端 - 添加 summarize 路由

**Files:**
- Modify: `backend/src/routes/tickets.ts`

- [ ] **Step 1: 在 tickets.ts 末尾添加路由（在 polish 路由后）**

```typescript
// POST /api/tickets/:id/summarize - AI summary of ticket
router.post("/:id/summarize", requireAuth, async (req, res) => {
  try {
    const ticket = await ticketService.getById(req.params.id as string)
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" })
      return
    }

    const result = await aiService.summarizeTicket({
      subject: ticket.subject,
      body: ticket.body,
      responses: ticket.responses ?? [],
    })
    res.json(result)
  } catch (error) {
    const err = error as { message?: string }
    console.error("Summarize error:", err?.message || error)
    res.status(500).json({ error: "Failed to summarize ticket" })
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add backend/src/routes/tickets.ts
git commit -m "feat: add POST /api/tickets/:id/summarize endpoint"
```

---

## Task 3: 前端 - 添加 summarizeTicket API 函数

**Files:**
- Modify: `frontend/src/lib/api/tickets.ts`

- [ ] **Step 1: 在 tickets.ts 末尾添加 summarizeTicket**

```typescript
export const summarizeTicket = (id: string, token: string) =>
  axios.post(`/api/tickets/${id}/summarize`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.data as { summary: string })
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/lib/api/tickets.ts
git commit -m "feat: add summarizeTicket API function"
```

---

## Task 4: 前端 - TicketDetail 添加总结 UI

**Files:**
- Modify: `frontend/src/pages/TicketDetail.tsx`

- [ ] **Step 1: 添加 useQuery 获取总结**

在现有 queryClient 定义后添加：

```typescript
const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
  queryKey: ["ticket-summary", id],
  queryFn: () => summarizeTicket(id!, token),
  enabled: Boolean(id && token),
})
```

- [ ] **Step 2: 添加刷新函数**

在 handleReply 函数附近添加：

```typescript
const handleRefreshSummary = () => {
  queryClient.invalidateQueries({ queryKey: ["ticket-summary", id] })
}
```

- [ ] **Step 3: 在标题下方添加总结卡片（在 EmailBadge 后）**

找到：
```tsx
<EmailBadge email={ticket.supportEmail} />
```

在其后添加：

```tsx
<Card className="bg-blue-50 border-blue-200 mt-2">
  <CardContent className="pt-3 pb-3">
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-blue-700">AI 总结</span>
          <button
            onClick={handleRefreshSummary}
            disabled={isSummaryLoading}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="刷新总结"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSummaryLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
        {isSummaryLoading ? (
          <p className="text-sm text-muted-foreground">生成中...</p>
        ) : summaryData?.summary ? (
          <p className="text-sm text-blue-900 whitespace-pre-wrap">{summaryData.summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">暂无总结</p>
        )}
      </div>
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 4: 添加 RefreshCw 图标导入**

在文件顶部找到 `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"` 添加 `RefreshCw`：

```tsx
import { RefreshCw } from "lucide-react"
```

- [ ] **Step 5: 提交**

```bash
git add frontend/src/pages/TicketDetail.tsx
git commit -m "feat: add AI summary card to ticket detail page"
```

---

## 验证步骤

1. 启动后端：`pnpm --filter backend dev`
2. 启动前端：`pnpm --filter frontend dev`
3. 打开工单详情页 <http://localhost:5173/tickets/:id>
4. 确认标题下方显示 AI 总结卡片
5. 点击刷新按钮，确认总结更新
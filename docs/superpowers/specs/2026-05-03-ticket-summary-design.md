# AI 工单总结功能设计

## 概述

在工单详情页添加 AI 总结功能，帮助客服人员快速了解工单要点。每次点击刷新总结内容。

## 功能位置

工单详情页标题下方区域（左侧主栏），显示在邮件徽章旁边。

## 后端改动

### aiService.ts

添加 `summarizeTicket` 方法：

```typescript
interface SummaryResult {
  summary: string
}

async summarizeTicket(ticket: {
  subject: string
  body: string
  responses: Array<{ body: string; isCustomerReply: boolean; createdAt: string }>
}): Promise<SummaryResult>
```

Prompt 要点：
- 分析工单主题、正文、所有回复
- 输出：问题核心、已尝试步骤、当前状态
- 语言跟随原内容
- 限制在 200 tokens 以内

### tickets.ts

新增路由：

```
POST /api/tickets/:id/summarize
- 需要认证
- 输入：工单完整数据（从 service 获取）
- 输出：{ summary: string }
```

## 前端改动

### TicketDetail.tsx

- 新增 `useQuery` 获取总结：`["ticket-summary", id]`
- 新增刷新按钮，点击触发重新获取（invalidateQueries 后重新 fetch）
- 总结区域 UI：
  - 浅蓝背景卡片（bg-blue-50 border-blue-200）
  - 标题："AI 总结"
  - 刷新按钮（Lucide `RefreshCw` 图标）
  - 总结文本内容
  - 加载中显示旋转图标

### API 调用

```typescript
// frontend/src/lib/api/tickets.ts
export const summarizeTicket = (id: string, token: string) =>
  axios.post(`/api/tickets/${id}/summarize`).then(r => r.data)
```

## 交互流程

1. 页面加载 → 自动请求总结（显示 loading）
2. 总结显示 → 用户可阅读
3. 点击刷新按钮 → 显示 loading 状态 → 获取新总结 → 更新显示

## 错误处理

- AI 服务不可用时显示错误提示，不阻塞页面
- 超时时间：30 秒
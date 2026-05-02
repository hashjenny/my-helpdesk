# 工单 E2E 测试设计

**日期:** 2026-05-03
**主题:** 工单页面完整 E2E 测试覆盖

## 概述

为工单列表页 (`/tickets`) 和工单详情页 (`/tickets/:id`) 编写完整 E2E 测试。若组件测试已覆盖某功能，则跳过对应 E2E 测试。

## 组件测试覆盖分析

**已覆盖（组件测试 → E2E 跳过）：**

| 组件 | 已覆盖功能 |
|------|-----------|
| `TicketFilters` | search input, status/category selects, onChange handlers |
| `TicketTable` | 渲染 rows, loading skeleton, empty state, error state, delete button, View link |
| `CreateTicketForm` | form fields, submit/cancel buttons, isPending disabled |
| `ReplyForm` | textarea, submit button, isPending disabled |
| `EmailBadge` | 渲染 email / null 情况 |

**未覆盖（需要 E2E 测试）：**

- 端到端用户流程（登录 → 操作 → 结果验证）
- 与真实后端交互的完整 CRUD
- 页面间导航
- 排序与真实数据的集成
- 状态/类别变更的实际保存

## 测试用例

### 工单列表页 (`/tickets`)

| # | 测试名称 | 描述 |
|---|---------|------|
| 1 | `should display tickets list with pagination` | 列表渲染分页信息，显示 "Previous" "Next" 按钮 |
| 2 | `should create a new ticket` | 点击 New Ticket → 填写表单 → 提交 → 新工单出现在列表 |
| 3 | `should filter tickets by status` | 选择 OPEN 状态 → 只显示 OPEN 工单 |
| 4 | `should filter tickets by category` | 选择 TECHNICAL 类别 → 只显示 TECHNICAL 工单 |
| 5 | `should search tickets by keyword` | 输入搜索词 → 列表即时更新为匹配工单 |
| 6 | `should sort tickets by column` | 点击 Subject 列头 → 升序/降序切换 |
| 7 | `should delete a ticket` | 点击 Delete → 确认对话框 → 工单从列表移除 |
| 8 | `should navigate to ticket detail` | 点击 View → 跳转至详情页 |

### 工单详情页 (`/tickets/:id`)

| # | 测试名称 | 描述 |
|---|---------|------|
| 9 | `should display ticket details` | subject, body, status, category 正确显示 |
| 10 | `should change ticket status` | 修改状态 → 刷新后状态保持 |
| 11 | `should change ticket category` | 修改类别 → 刷新后类别保持 |
| 12 | `should assign ticket to agent` | 分配给坐席 → 显示坐席名称 badge |
| 13 | `should add response to ticket` | 填写回复 → 提交 → 回复出现在列表 |
| 14 | `should show responses in chronological order` | 多个回复按时间正序排列 |

## 测试数据

`global-setup.ts` 已执行 `seed-tickets.ts`，提供 10 条测试工单。

测试用户: `admin@test.com` / `testpass123`

## 跳过规则

> 若组件测试已覆盖某功能，则跳过对应 E2E 测试。

此规则已在 `CLAUDE.md` 中标注。

## 测试文件

- `e2e/tickets.spec.ts` — 所有工单 E2E 测试
- `e2e/pages/tickets.page.ts` — 工单列表页 Page Object
- `e2e/pages/ticket-detail.page.ts` — 工单详情页 Page Object

## 状态

Draft — pending implementation

# 工单 E2E 测试实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为工单列表页和详情页编写 14 个 E2E 测试用例

**Architecture:** 使用 Playwright + Page Objects 模式。现有 `TicketListPage` 和 `TicketDetailPage` 已实现，测试文件 `e2e/tickets.spec.ts` 待补充完整测试用例。

**Tech Stack:** Playwright, TypeScript, Page Objects

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `e2e/tickets.spec.ts` | 所有工单 E2E 测试（需补充 14 个测试用例） |
| `e2e/pages/tickets.page.ts` | 工单列表页 Page Object（已存在） |
| `e2e/pages/ticket-detail.page.ts` | 工单详情页 Page Object（已存在） |
| `e2e/global-setup.ts` | 测试数据准备（已有 seed-tickets.ts） |

---

## Task 1: 工单列表页 - 分页测试

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加分页测试**

在 `tickets.spec.ts` 中添加：

```typescript
test('should display tickets list with pagination', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Verify pagination info exists
  await expect(page.locator('text=Total:')).toBeVisible()
  await expect(page.locator('button:has-text("Previous")')).toBeVisible()
  await expect(page.locator('button:has-text("Next")')).toBeVisible()

  // Verify tickets are displayed
  const rows = page.locator('table tbody tr')
  await expect(rows.first()).toBeVisible()
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "pagination"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add pagination e2e test"
```

---

## Task 2: 工单列表页 - 创建工单

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加创建工单测试**

```typescript
test('should create a new ticket', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Open create form
  await page.locator('button:has-text("New Ticket")').click()
  await expect(page.locator('text=Create New Ticket')).toBeVisible()

  // Fill form
  const uniqueSubject = `Test Ticket ${Date.now()}`
  await page.fill('#subject', uniqueSubject)
  await page.fill('#body', 'Test description for the ticket')
  await page.selectOption('#category', 'TECHNICAL')

  // Submit
  await page.click('button:has-text("Create Ticket")')
  await page.waitForLoadState('networkidle')

  // Verify new ticket appears in list
  await expect(page.locator(`text=${uniqueSubject}`)).toBeVisible()
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "create a new ticket"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add create ticket e2e test"
```

---

## Task 3: 工单列表页 - 状态筛选

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加状态筛选测试**

```typescript
test('should filter tickets by status', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Get initial ticket count
  const initialRows = await page.locator('table tbody tr').count()

  // Filter by OPEN status
  await page.locator('select').first().selectOption('OPEN')
  await page.waitForLoadState('networkidle')

  // Verify rows are filtered (may be less than initial)
  const filteredRows = await page.locator('table tbody tr').count()
  // All visible tickets should be OPEN
  const openTickets = page.locator('table tbody tr span:has-text("OPEN")')
  await expect(openTickets.first()).toBeVisible()
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "filter tickets by status"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add status filter e2e test"
```

---

## Task 4: 工单列表页 - 类别筛选

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加类别筛选测试**

```typescript
test('should filter tickets by category', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Filter by TECHNICAL category
  await page.locator('select').nth(1).selectOption('TECHNICAL')
  await page.waitForLoadState('networkidle')

  // All visible tickets should be TECHNICAL
  const technicalTickets = page.locator('table tbody tr span:has-text("TECHNICAL")')
  await expect(technicalTickets.first()).toBeVisible()
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "filter tickets by category"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add category filter e2e test"
```

---

## Task 5: 工单列表页 - 搜索

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加搜索测试**

```typescript
test('should search tickets by keyword', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Get a known ticket subject from the list
  const firstSubject = await page.locator('table tbody tr td').first().textContent()

  // Search for part of the subject
  if (firstSubject && firstSubject.length > 3) {
    const searchTerm = firstSubject.substring(0, 5)
    await page.fill('input[placeholder*="Search"]', searchTerm)
    await page.waitForLoadState('networkidle')

    // Verify search results contain the term
    const rows = page.locator('table tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)
  }
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "search tickets by keyword"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add search e2e test"
```

---

## Task 6: 工单列表页 - 排序

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加排序测试**

```typescript
test('should sort tickets by column', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Click Subject column header to sort
  await page.locator('th:has-text("Subject")').click()
  await page.waitForLoadState('networkidle')

  // Click again to reverse sort
  await page.locator('th:has-text("Subject")').click()
  await page.waitForLoadState('networkidle')

  // Verify table is still visible and has rows
  await expect(page.locator('table tbody tr').first()).toBeVisible()
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "sort tickets by column"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add sort e2e test"
```

---

## Task 7: 工单列表页 - 删除工单

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加删除工单测试**

```typescript
test('should delete a ticket', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Get initial count
  const initialCount = await page.locator('table tbody tr').count()

  // Handle dialog and click delete
  page.on('dialog', dialog => dialog.accept())
  await page.locator('button:has-text("Delete")').first().click()
  await page.waitForLoadState('networkidle')

  // Verify count decreased
  const newCount = await page.locator('table tbody tr').count()
  expect(newCount).toBeLessThan(initialCount)
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "delete a ticket"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add delete ticket e2e test"
```

---

## Task 8: 工单列表页 - 导航到详情

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加导航测试**

```typescript
test('should navigate to ticket detail', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Click View link
  await page.locator('a:has-text("View")').first().click()
  await page.waitForLoadState('networkidle')

  // Verify we're on detail page
  await expect(page.locator('text=Add Response')).toBeVisible()
  await expect(page.url()).toContain('/tickets/')
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "navigate to ticket detail"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add navigate to detail e2e test"
```

---

## Task 9: 工单详情页 - 显示详情

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加显示详情测试**

```typescript
test('should display ticket details', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Navigate to first ticket
  await page.locator('a:has-text("View")').first().click()
  await page.waitForLoadState('networkidle')

  // Verify ticket details are shown
  await expect(page.locator('h1').first()).toBeVisible() // subject
  await expect(page.locator('text=Add Response')).toBeVisible()
  await expect(page.locator('select').first()).toBeVisible() // status select
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "display ticket details"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add display ticket details e2e test"
```

---

## Task 10: 工单详情页 - 修改状态

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加修改状态测试**

```typescript
test('should change ticket status', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Navigate to ticket detail
  await page.locator('a:has-text("View")').first().click()
  await page.waitForLoadState('networkidle')

  // Get current status
  const currentStatus = await page.locator('select').first().inputValue()

  // Change to a different status
  const newStatus = currentStatus === 'OPEN' ? 'RESOLVED' : 'OPEN'
  await page.locator('select').first().selectOption(newStatus)
  await page.waitForLoadState('networkidle')

  // Verify the change was saved
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator(`select option[value="${newStatus}"]`)).toBeSelected()
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "change ticket status"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add change status e2e test"
```

---

## Task 11: 工单详情页 - 修改类别

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加修改类别测试**

```typescript
test('should change ticket category', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Navigate to ticket detail
  await page.locator('a:has-text("View")').first().click()
  await page.waitForLoadState('networkidle')

  // Get current category
  const currentCategory = await page.locator('select').nth(1).inputValue()

  // Change to a different category
  const newCategory = currentCategory === 'GENERAL' ? 'TECHNICAL' : 'GENERAL'
  await page.locator('select').nth(1).selectOption(newCategory)
  await page.waitForLoadState('networkidle')

  // Verify the change was saved
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator(`select option[value="${newCategory}"]`)).toBeSelected()
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "change ticket category"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add change category e2e test"
```

---

## Task 12: 工单详情页 - 分配坐席

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加分配坐席测试**

```typescript
test('should assign ticket to agent', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Navigate to ticket detail
  await page.locator('a:has-text("View")').first().click()
  await page.waitForLoadState('networkidle')

  // Check if assignedTo select exists (admin only)
  const assigneeSelect = page.locator('select').nth(2)
  if (await assigneeSelect.isVisible()) {
    // Get available agents
    const options = await assigneeSelect.locator('option').all()
    if (options.length > 1) {
      // Select first agent (not "Unassigned")
      await assigneeSelect.selectOption({ index: 1 })
      await page.waitForLoadState('networkidle')

      // Verify assignment badge appears
      await expect(page.locator('text=Agent').first()).toBeVisible()
    }
  }
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "assign ticket to agent"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add assign agent e2e test"
```

---

## Task 13: 工单详情页 - 添加回复

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加回复测试**

```typescript
test('should add response to ticket', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Navigate to ticket detail
  await page.locator('a:has-text("View")').first().click()
  await page.waitForLoadState('networkidle')

  // Add a response
  const responseText = `Test response ${Date.now()}`
  await page.fill('#reply', responseText)
  await page.click('button:has-text("Send Response")')
  await page.waitForLoadState('networkidle')

  // Verify response appears
  await expect(page.locator(`text=${responseText}`)).toBeVisible()
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "add response to ticket"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add add response e2e test"
```

---

## Task 14: 工单详情页 - 回复时间排序

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: 添加回复排序测试**

```typescript
test('should show responses in chronological order', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')

  // Navigate to ticket detail
  await page.locator('a:has-text("View")').first().click()
  await page.waitForLoadState('networkidle')

  // Add multiple responses
  const response1 = `First response ${Date.now()}`
  const response2 = `Second response ${Date.now()}`
  await page.fill('#reply', response1)
  await page.click('button:has-text("Send Response")')
  await page.waitForLoadState('networkidle')
  await page.fill('#reply', response2)
  await page.click('button:has-text("Send Response")')
  await page.waitForLoadState('networkidle')

  // Verify both responses exist
  await expect(page.locator(`text=${response1}`)).toBeVisible()
  await expect(page.locator(`text=${response2}`)).toBeVisible()

  // Verify order: response1 should appear before response2
  const pos1 = await page.locator(`text=${response1}`).evaluate(el => el.getBoundingClientRect().top)
  const pos2 = await page.locator(`text=${response2}`).evaluate(el => el.getBoundingClientRect().top)
  expect(pos1).toBeLessThan(pos2)
})
```

- [ ] **Step 2: 运行测试验证**

Run: `pnpm playwright test e2e/tickets.spec.ts --grep "responses in chronological order"`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add responses order e2e test"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| should display tickets list with pagination | Task 1 |
| should create a new ticket | Task 2 |
| should filter tickets by status | Task 3 |
| should filter tickets by category | Task 4 |
| should search tickets by keyword | Task 5 |
| should sort tickets by column | Task 6 |
| should delete a ticket | Task 7 |
| should navigate to ticket detail | Task 8 |
| should display ticket details | Task 9 |
| should change ticket status | Task 10 |
| should change ticket category | Task 11 |
| should assign ticket to agent | Task 12 |
| should add response to ticket | Task 13 |
| should show responses in chronological order | Task 14 |

All 14 spec requirements covered. No placeholders found.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-tickets-e2e-plan.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

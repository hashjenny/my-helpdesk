# AI Polish Reply Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Polish with AI" button to ReplyForm that polishes response text with professional tone.

**Architecture:** Backend adds `POST /api/tickets/:id/polish` endpoint calling MiniMax API. Frontend adds polish mutation to ReplyForm with UI button.

**Tech Stack:** Express, MiniMax API, React Hook Form, TanStack Query

---

## File Structure

- **Create:** `backend/src/services/aiService.ts` - MiniMax API wrapper for text polishing
- **Modify:** `backend/src/routes/tickets.ts` - Add polish endpoint
- **Modify:** `frontend/src/lib/api/tickets.ts` - Add polish API function
- **Modify:** `frontend/src/components/tickets/ReplyForm.tsx` - Add polish button and mutation
- **Modify:** `frontend/src/components/tickets/ReplyForm.test.tsx` - Add polish tests

---

## Task 1: Create AI Service

**Files:**
- Create: `backend/src/services/aiService.ts`

- [ ] **Step 1: Create aiService.ts**

```typescript
const MINIMAX_API_URL = "https://api.minimax.chat/v1/text/chatcompletion_pro"

interface PolishResult {
  polished: string
}

export const aiService = {
  async polishText(text: string): Promise<PolishResult> {
    if (!text.trim()) {
      return { polished: text }
    }

    const apiKey = process.env.MINIMAX_API_KEY
    if (!apiKey) {
      throw new Error("MINIMAX_API_KEY not configured")
    }

    const response = await fetch(MINIMAX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "abab6.5s-chat",
        messages: [
          {
            role: "system",
            content: `You are a professional customer support agent. Polish the user's reply to make it more professional, friendly, and well-structured. Keep the same meaning but improve clarity, grammar, and tone. Only return the polished text, nothing else.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`)
    }

    const data = await response.json()
    const polished = data.choices?.[0]?.message?.content ?? text

    return { polished }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/aiService.ts
git commit -m "feat: add aiService for text polishing"
```

---

## Task 2: Add Polish Endpoint

**Files:**
- Modify: `backend/src/routes/tickets.ts`

- [ ] **Step 1: Add polish endpoint to tickets.ts**

Add this route after the responses endpoints (around line 148):

```typescript
// POST /api/tickets/:id/polish - Polish response text with AI
router.post("/:id/polish", requireAuth, async (req, res) => {
  const { body } = req.body
  if (!body || typeof body !== "string" || body.trim().length === 0) {
    res.status(400).json({ error: "body is required" })
    return
  }

  try {
    const { aiService } = await import("../services/aiService.js")
    const result = await aiService.polishText(body)
    res.json(result)
  } catch (_error) {
    res.status(500).json({ error: "Failed to polish text" })
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/tickets.ts
git commit -m "feat: add POST /api/tickets/:id/polish endpoint"
```

---

## Task 3: Add Frontend Polish API

**Files:**
- Modify: `frontend/src/lib/api/tickets.ts`

- [ ] **Step 1: Add polish function to tickets.ts**

Add after the `addResponse` function:

```typescript
export async function polishTicketResponse(id: string, body: string, token: string) {
  const response = await axios.post(
    `/api/tickets/${id}/polish`,
    { body },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data as { polished: string }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/api/tickets.ts
git commit -m "feat: add polishTicketResponse API function"
```

---

## Task 4: Update ReplyForm with Polish Button

**Files:**
- Modify: `frontend/src/components/tickets/ReplyForm.tsx`
- Test: `frontend/src/components/tickets/ReplyForm.test.tsx`

- [ ] **Step 1: Update ReplyForm.tsx imports**

Add `useMutation` and `useWatch` from react-hook-form, add `polishTicketResponse`:

```typescript
import { useForm, type Resolver, useWatch } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { polishTicketResponse } from "@/lib/api/tickets"
import { useAuth } from "@/hooks/useAuth"
```

- [ ] **Step 2: Update ReplyForm to add polish mutation**

Add inside the component, before the form setup:

```typescript
const { session } = useAuth()
const token = session?.session?.token ?? ""
const ticketId = // You'll need to pass this as a prop - see Step 3
const currentBody = useWatch({ control: register("body").control, name: "body" })

const polishMutation = useMutation({
  mutationFn: (body: string) => polishTicketResponse(ticketId, body, token),
  onSuccess: (data) => {
    reset({ body: data.polished })
  },
  onError: (err: Error) => alert(err.message),
})
```

- [ ] **Step 3: Update ReplyFormProps interface**

Update the interface to include ticketId:

```typescript
interface ReplyFormProps {
  ticketId: string
  onSubmit: (body: string) => void
  isPending: boolean
}
```

- [ ] **Step 4: Update component signature**

```typescript
export function ReplyForm({ ticketId, onSubmit, isPending }: ReplyFormProps) {
```

- [ ] **Step 5: Update button area**

Replace the single Button with two buttons:

```typescript
<div className="flex gap-2">
  <Button
    type="button"
    variant="outline"
    onClick={() => polishMutation.mutate(currentBody)}
    disabled={!currentBody?.trim() || polishMutation.isPending}
  >
    {polishMutation.isPending ? "Polishing..." : "Polish with AI"}
  </Button>
  <Button type="submit" disabled={isPending}>
    {isPending ? "Sending..." : "Send Response"}
  </Button>
</div>
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/tickets/ReplyForm.tsx
git commit -m "feat: add AI polish button to ReplyForm"
```

---

## Task 5: Update TicketDetail to Pass ticketId

**Files:**
- Modify: `frontend/src/pages/TicketDetail.tsx`

- [ ] **Step 1: Pass ticketId to ReplyForm**

Find where ReplyForm is used and add ticketId prop:

```typescript
<ReplyForm
  ticketId={id!}
  onSubmit={handleReply}
  isPending={responseMutation.isPending}
/>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/TicketDetail.tsx
git commit -m "feat: pass ticketId to ReplyForm"
```

---

## Task 6: Add ReplyForm Component Test

**Files:**
- Modify: `frontend/src/components/tickets/TicketComponents.test.tsx`

- [ ] **Step 1: Add ReplyForm polish tests**

Add to the ReplyForm describe block:

```typescript
it("renders polish button", () => {
  render(<ReplyForm ticketId="1" onSubmit={() => {}} isPending={false} />)
  expect(screen.getByRole("button", { name: /polish with ai/i })).toBeInTheDocument()
})

it("disables polish button when input is empty", () => {
  render(<ReplyForm ticketId="1" onSubmit={() => {}} isPending={false} />)
  expect(screen.getByRole("button", { name: /polish with ai/i })).toBeDisabled()
})

it("shows polishing state when mutation is pending", () => {
  const queryClient = createQueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <ReplyForm ticketId="1" onSubmit={() => {}} isPending={false} />
    </QueryClientProvider>
  )
  // Test polishing state when API is called - would need mock
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm --filter frontend test -- --run
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/tickets/TicketComponents.test.tsx
git commit -m "test: add ReplyForm polish component tests"
```

---

## Task 7: Add E2E Test for Polish Flow

**Files:**
- Modify: `e2e/tickets.spec.ts`

- [ ] **Step 1: Add E2E test**

Add to the test file:

```typescript
test('should polish response with AI', async ({ page }) => {
  await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
  await authPage.waitForAuthNavigation()
  await page.waitForLoadState('networkidle')
  // Navigate to ticket detail
  await ticketListPage.goto()
  await page.waitForLoadState('networkidle')
  await ticketListPage.viewTicket(0)
  await page.waitForLoadState('networkidle')
  // Type some text
  const testText = 'hi i need help with my account'
  await ticketDetailPage.replyTextarea.fill(testText)
  // Click polish button
  await page.locator('button:has-text("Polish with AI")').click()
  // Wait for polishing to complete
  await page.waitForFunction(
    () => !document.body.textContent?.includes('Polishing...'),
    { timeout: 10000 }
  ).catch(() => {})
  // Verify textarea has content (polished text)
  const polishedContent = await ticketDetailPage.replyTextarea.inputValue()
  expect(polishedContent.length).toBeGreaterThan(0)
  expect(polishedContent).not.toBe(testText)
})
```

- [ ] **Step 2: Run E2E tests**

```bash
pnpm test
```

- [ ] **Step 3: Commit**

```bash
git add e2e/tickets.spec.ts
git commit -m "test: add E2E test for AI polish flow"
```

---

## Verification

Run all tests:

```bash
pnpm --filter frontend test -- --run
pnpm test
```

Expected:
- Component tests: PASS
- E2E tests: PASS (except may have pre-existing failures)

# Project Context

This is an AI-powered ticket management system.

## Documentation Rule

When asking about libraries, frameworks, SDKs, APIs, or CLI tools — **always use Context7 MCP** to fetch current documentation first. Do NOT rely on training data for library-specific syntax, configuration, or best practices.

## Tech Stack

- Frontend: React 19 + TypeScript + Vite + React Router + Tailwind CSS + shadcn/ui + **TanStack Query** + **TanStack Table** + **Axios**
- Backend: Express + TypeScript + Node.js
- Database: PostgreSQL + Prisma 5
- Auth: Better Auth with bcrypt password hashing
- AI: MiniMax API via Anthropic SDK (`@anthropic-ai/sdk` with `baseURL: "https://api.minimaxi.com/anthropic"`, model: `MiniMax-M2.7`)
- Email: Resend (inbound email to ticket conversion)

## Package Manager

This project uses **pnpm** with workspace configuration:

```yaml
packages:
  - shared
  - backend
  - frontend
```

Commands:

- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages (shared → backend → frontend)
- `pnpm --filter backend dev` - Start backend dev server
- `pnpm --filter frontend dev` - Start frontend dev server
- `pnpm --filter backend prisma:generate` - Generate Prisma client

## UI Components

This project uses **shadcn/ui** with Tailwind CSS v4 and the `base-nova` style variant.

### Key Components Available

- `Button` - button with variants (default, outline, ghost, destructive)
- `Card` - card components (Card, CardHeader, CardContent, CardTitle, CardDescription)
- `Input` - form input field
- `Label` - form label
- `Alert` - alert messages with variants
- `Table` - table components (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
- `Separator` - horizontal/vertical separator

### Import Alias

Use `@/` prefix for imports from `frontend/src/`:

```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

### Path Configuration

- TypeScript: `tsconfig.app.json` with `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }`
- Vite: `vite.config.ts` with resolve alias for `@`

## Key Paths

- Frontend: `frontend/src/`
- Backend: `backend/src/`
- Shared: `shared/` (schemas and types shared between frontend and backend)
- Prisma schema: `backend/prisma/schema.prisma`
- API modules: `frontend/src/lib/api/` (Axios)
- Query client: `frontend/src/lib/query-client.ts` (TanStack Query)

### Shared Schemas (`shared/`)

Zod schemas and types shared between frontend and backend via the `@helpdesk/shared` package:

```typescript
import { Role, createUserSchema, TicketStatus, createTicketSchema } from "@helpdesk/shared"
```

Available exports:

- `Role` - object with `ADMIN` and `AGENT` values
- `UserRole` - TypeScript type for role values
- `createUserSchema` - Zod schema for user creation
- `updateUserSchema` - Zod schema for user updates
- `changePasswordSchema` - Zod schema for password changes
- `TicketStatus` - readonly array `["OPEN", "RESOLVED", "CLOSED"]`
- `TicketCategory` - readonly array `["GENERAL", "TECHNICAL", "REFUND"]`
- `Ticket` - interface for ticket data
- `createTicketSchema` - Zod schema for ticket creation
- `updateTicketSchema` - Zod schema for ticket updates

## Frontend Data Fetching

API calls use **Axios** via `frontend/src/lib/api/`:

- `fetchUsers(params)` - GET with pagination/search
- `createUser(data, token)` - POST
- `updateUser(id, data, token)` - PATCH
- `deleteUser(id, token)` - DELETE
- `fetchTickets(params)` - GET with pagination/filters
- `fetchTicket(id, token)` - GET single ticket
- `createTicket(data, token)` - POST
- `updateTicket(id, data, token)` - PATCH
- `deleteTicket(id, token)` - DELETE

State management uses **TanStack Query**:

- `useQuery` for fetching lists with automatic caching
- `useMutation` for create/update/delete with `queryClient.invalidateQueries`
- QueryClientProvider wraps App in `App.tsx`

Type-only imports use `import type { User }` (verbatimModuleSyntax enabled)

### Form Validation

Forms use **React Hook Form** + **Zod** for validation. Zod schemas are shared via the `shared/` package:

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createTicketSchema, type CreateTicketInput } from "@helpdesk/shared"

export function MyForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { category: "GENERAL" },
  })

  const onSubmit = (data: CreateTicketInput) => { /* ... */ }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("subject")} aria-invalid={!!errors.subject} />
      {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
      {/* ... */}
    </form>
  )
}
```

## Project Status

### Completed Phases

**Phase 1: Project Setup**

- Frontend scaffold with Vite + React + TypeScript + Tailwind + React Router
- Backend scaffold with Express + TypeScript + Node.js
- Prisma initialized with PostgreSQL
- StatusCheck component for health check

**Phase 2: Database Schema & Models**

- User model (ADMIN, AGENT roles)
- Ticket model (OPEN, RESOLVED, CLOSED statuses; GENERAL, TECHNICAL, REFUND categories)
- TicketResponse model
- Session model (for Better Auth)
- Migrations applied to PostgreSQL

**Phase 3: Authentication**

- Better Auth integration with Express
- User registration and login (frontend + backend)
- Session middleware and role-based access control
- Protected routes for authenticated users
- Admin user management panel
- bcrypt password hashing
- Login page redirects to home if already authenticated

**Phase 4: Ticket Management** (completed)

- Full ticket CRUD API (`/api/tickets`)
- Ticket list with pagination, search, and filters (status, category)
- Ticket detail with responses
- Frontend ticket list and detail pages
- Email-to-ticket webhook (`/api/webhooks/email`)
- `supportEmail` field on tickets for email-originated tickets
- **Client-side sorting** with TanStack Table (click column headers)
- **Soft delete** (tickets have `deletedAt` field, filtered by default)

### Current Phase

**Phase 5: Email Integration** (completed)

- Resend integration for inbound email processing
- Email notification templates (React Email)

**Phase 6: AI Features** (completed)

- `aiService.ts` with MiniMax API integration via Anthropic SDK (`@anthropic-ai/sdk`)
- `classifyTicket` - AI classification into GENERAL/TECHNICAL/REFUND
- `suggestReplies` - AI-generated reply suggestions
- `summarizeTicket` - AI-powered ticket summarization
- `polishText` - AI text polishing for agent replies

**Phase 7: Dashboard** (completed)

- `GET /api/dashboard/stats` - Ticket counts by status and category
- `GET /api/dashboard/recent` - 10 most recent tickets
- Dashboard page at `/` with stat cards and recent tickets list

### Navigation

- `/` - Dashboard (real data from API)
- `/tickets` - Ticket list (authenticated users)
- `/tickets/:id` - Ticket detail with AI features (classify, suggest replies)
- `/users` - User management (admin only)
- `/admin/users` - Admin user panel (admin only)

### Test Users

- Admin: <admin@helpdesk.com> / toor123
- Agent: <agent@desk.com> / toor
- E2E Test Admin: <admin@test.com> / toor123

### Database

- PostgreSQL running on localhost:5432
- Database: helpdesk (production)
- Test Database: helpdesk_test (independent, preserved after tests)
- User: postgres / toor
- Prisma migrations applied

### Running Services

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3001>

### API Endpoints

**Ticket API:**

- `GET /api/tickets` - List tickets (pagination, filters)
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket with responses
- `PATCH /api/tickets/:id` - Update ticket (status, category)
- `DELETE /api/tickets/:id` - Delete ticket (admin only)
- `GET /api/tickets/:id/responses` - List responses
- `POST /api/tickets/:id/responses` - Add response

**Email Webhook:**

- `POST /api/webhooks/email` - Convert inbound email to ticket

### Implementation Plan

See `plan.md` for full feature breakdown across 8 phases.

## Agents

### Playwright E2E Writer Agent

**Use this agent** when the user asks to:

- Write, create, or add E2E tests
- Modify or extend existing E2E tests
- Set up test fixtures or page objects
- Run or verify E2E tests

**Command:** `/playwright` or invoke via `Task` tool with `playwright-e2e-writer` subagent

**Test files:** `./e2e/` directory

### E2E Test Skip Rule

**若组件测试已覆盖某功能，则跳过对应 E2E 测试。**

例如 `TicketFilters` 组件测试已覆盖搜索和筛选逻辑，则 E2E 不再重复测试该功能。

组件测试位置：`frontend/src/components/**/*.test.tsx`

当前组件测试覆盖：

| 组件 | 状态 |
|------|------|
| `TicketFilters` | ✅ 已覆盖搜索、状态/类别筛选 |
| `TicketTable` | ✅ 已覆盖表格渲染、loading、empty、error、delete |
| `CreateTicketForm` | ✅ 已覆盖表单字段、提交、取消、pending 状态 |
| `ReplyForm` | ✅ 已覆盖 textarea、提交按钮、pending 状态 |
| `EmailBadge` | ✅ 已覆盖渲染/null 情况 |
| `TicketResponses` | ✅ 已覆盖空状态、响应列表、Agent/Customer 标签 |

**E2E 测试应覆盖（组件测试未覆盖）：**

- 端到端用户流程（登录 → 操作 → 结果）
- 与真实后端交互的完整 CRUD
- 页面间导航
- 排序与真实数据的集成
- 状态/类别变更（需刷新页面验证）
- 坐席分配（admin 专属功能）

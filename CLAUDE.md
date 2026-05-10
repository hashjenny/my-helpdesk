# Project Context

AI-powered ticket management system.

## Documentation

**Always use Context7 MCP** for library/SDK questions. Run `npx ctx7@latest library <name>` then `npx ctx7@latest docs <id>`.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + React Router + Tailwind + shadcn/ui + TanStack Query + TanStack Table + Axios
- **Backend:** Express + TypeScript + Node.js
- **Database:** PostgreSQL + Prisma 5
- **Auth:** Better Auth + bcrypt
- **AI:** MiniMax via `@anthropic-ai/sdk` (`baseURL: "https://api.minimaxi.com/anthropic"`, model: `MiniMax-M2.7`)
- **Email:** Resend

## Package Manager

pnpm workspace (`shared/`, `backend/`, `frontend/`):

- `pnpm install` | `pnpm build` | `pnpm --filter backend dev` | `pnpm --filter frontend dev`

## Key Paths

| Path | Purpose |
| :--- | :--- |
| `frontend/src/` | Frontend source |
| `backend/src/` | Backend source |
| `shared/` | Zod schemas shared via `@helpdesk/shared` |
| `backend/prisma/schema.prisma` | Prisma schema |

**Import alias:** `@/` maps to `frontend/src/`

## Shared Schemas

```typescript
import { Role, TicketStatus, TicketCategory, createUserSchema, createTicketSchema } from "@helpdesk/shared"
```

## UI Components

shadcn/ui with Tailwind CSS v4 (`base-nova` style). Key: `Button`, `Card`, `Input`, `Label`, `Alert`, `Table`, `Separator`.

## Form Validation

React Hook Form + Zod. Use `zodResolver` with schemas from `@helpdesk/shared`.

## Design System

**Obsidian Terminal** theme — dark mode, amber accent (`oklch(0.75 0.15 75)`), JetBrains Mono font.

Key classes: `border-amber-500/20 bg-[oklch(0.11_0_0)]` (cards), `border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono` (inputs).

## Navigation

- `/` — Dashboard
- `/tickets` — Ticket list
- `/tickets/:id` — Ticket detail with AI features
- `/users` — User management (admin only)

## Test Users

- Admin: `admin@helpdesk.com` / `toor123`
- Agent: `agent@desk.com` / `toor`

## Services

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3001>
- Database: PostgreSQL on localhost:5432 (db: `helpdesk`)

## E2E Testing

Use `/playwright` or `playwright-e2e-writer` agent. **Skip if component test covers it.**

Component tests exist for: `TicketFilters`, `TicketTable`, `CreateTicketForm`, `ReplyForm`, `EmailBadge`, `TicketResponses`.

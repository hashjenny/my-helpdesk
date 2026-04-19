# Project Context

This is an AI-powered ticket management system.

## Documentation Rule

When asking about libraries, frameworks, SDKs, APIs, or CLI tools — **always use Context7 MCP** to fetch current documentation first. Do NOT rely on training data for library-specific syntax, configuration, or best practices.

## Tech Stack

- Frontend: React 19 + TypeScript + Vite + React Router + Tailwind CSS + shadcn/ui
- Backend: Express + TypeScript + Node.js
- Database: PostgreSQL + Prisma 5
- Auth: Better Auth with bcrypt password hashing
- AI: MiniMax API
- Email: Resend + React Email

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
- Prisma schema: `backend/prisma/schema.prisma`

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

### Current Phase

**Phase 4: Ticket Management** (upcoming)

### Navigation

- `/tickets` - Ticket list (authenticated users)
- `/users` - User management (admin only)
- `/admin/users` - Admin user panel (admin only)

### Test Users

- Admin: admin@helpdesk.com (password via ADMIN_PASSWORD env)
- Agent: agent@desk.com / toor
- E2E Test Admin: admin@test.com / testpass123

### Database

- PostgreSQL running on localhost:5432
- Database: helpdesk (production)
- Test Database: helpdesk_test (independent, preserved after tests)
- User: postgres / toor
- Prisma migrations applied

### Running Services

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3001>

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

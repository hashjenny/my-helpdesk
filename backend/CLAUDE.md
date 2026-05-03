---
description: Backend project using Express + TypeScript + Node.js runtime.
globs: "*.ts, *.tsx, *.js, *.json"
alwaysApply: false
---

## Backend Guidelines

This backend uses Express with TypeScript running on Node.js.

### Runtime Commands

- Use `pnpm install` to install dependencies
- Use `pnpm --filter backend dev` to start the development server with tsx watch
- Use `pnpm --filter backend build` to compile TypeScript
- Use `pnpm --filter backend start` to run the production build
- Use `pnpm --filter backend prisma:generate` to generate Prisma Client
- Use `pnpm --filter backend prisma:studio` to open Prisma Studio

### AI Integration

**Use Anthropic SDK** (`@anthropic-ai/sdk`) to call MiniMax models. MiniMax provides an Anthropic-compatible API.

**Configuration:**
```typescript
import Anthropic from "@anthropic-ai/sdk"

const MiniMaxClient = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://api.minimaxi.com/anthropic",
})
```

**Usage:**
```typescript
const message = await MiniMaxClient.messages.create({
  model: "MiniMax-M2.7",
  max_tokens: 1024,
  system: "Your system prompt",
  messages: [{ role: "user", content: "user message" }],
})

const text = message.content[0]?.type === "text" ? message.content[0].text : ""
```

### Dependencies

- Express for HTTP server
- Prisma for database ORM
- Better Auth for authentication
- bcrypt for password hashing
- tsx for development auto-reloading
- **@anthropic-ai/sdk** for MiniMax AI (Anthropic-compatible API)

### Project Structure

- Entry point: `src/index.ts`
- Routes: `src/routes/` (users.ts, tickets.ts, email.ts)
- Services: `src/services/` (ticketService.ts, email.ts)
- Middleware: `src/middleware/session.ts`
- Auth config: `src/auth.ts`
- Database: PostgreSQL via Prisma

### API Routes

- `/api/users` - User management (admin only)
- `/api/tickets` - Ticket CRUD operations
- `/api/webhooks/email` - Inbound email to ticket conversion

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

### Dependencies

- Express for HTTP server
- Prisma for database ORM
- Better Auth for authentication
- bcrypt for password hashing
- tsx for development auto-reloading

### Project Structure

- Entry point: `src/index.ts`
- Routes: `src/routes/`
- Middleware: `src/middleware/`
- Auth config: `src/auth.ts`
- Database: PostgreSQL via Prisma

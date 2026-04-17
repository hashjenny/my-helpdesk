---
description: Backend project using Express + TypeScript + Node.js runtime.
globs: "*.ts, *.tsx, *.js, *.json"
alwaysApply: false
---

## Backend Guidelines

This backend uses Express with TypeScript running on Node.js.

### Runtime Commands

- Use `npm install` to install dependencies
- Use `npm run dev` to start the development server with tsx watch
- Use `npm run build` to compile TypeScript
- Use `npm run start` to run the production build
- Use `npx tsx <file>` to run TypeScript files directly
- Use `npx prisma <command>` for Prisma CLI commands

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

# Project Context

This is an AI-powered ticket management system.

## Documentation Rule

When asking about libraries, frameworks, SDKs, APIs, or CLI tools — **always use Context7 MCP** to fetch current documentation first. Do NOT rely on training data for library-specific syntax, configuration, or best practices.

## Tech Stack

- Frontend: React 18 + TypeScript + Vite + React Router + Tailwind CSS
- Backend: Express + TypeScript + Bun
- Database: PostgreSQL + Prisma 5
- Auth: Better Auth with bcrypt password hashing
- AI: MiniMax API
- Email: Resend + React Email

## Key Paths

- Frontend: `frontend/src/`
- Backend: `backend/src/`
- Prisma schema: `backend/prisma/schema.prisma`

## Project Status

### Completed Phases

**Phase 1: Project Setup**
- Frontend scaffold with Vite + React + TypeScript + Tailwind + React Router
- Backend scaffold with Express + TypeScript + Bun
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

### Database

- PostgreSQL running on localhost:5432
- Database: helpdesk
- User: postgres
- Prisma migrations applied

### Running Services

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Implementation Plan

See `plan.md` for full feature breakdown across 8 phases.

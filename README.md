# Helpdesk

AI-powered ticket management system.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + React Router + Tailwind CSS
- **Backend**: Express + TypeScript + Node.js
- **Database**: PostgreSQL + Prisma 5
- **Auth**: Better Auth with bcrypt password hashing
- **AI**: MiniMax API (upcoming)
- **Email**: Resend + React Email (upcoming)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with database, auth, email, AI, and optional Sentry values.
```

3. Run database migrations:

```bash
pnpm --filter backend prisma migrate dev
```

4. Start the development servers:

```bash
# Terminal 1
pnpm dev:backend

# Terminal 2
pnpm dev:frontend
```

The frontend, backend, and Playwright E2E setup all read environment values from the root `.env` file. Use `.env.example` for local development. `.env.test` can override those values for E2E runs.

## Production

Production builds compile the Vite frontend into `backend/public`, then the Express backend serves those static files and `/api/*` from one Railway service.

```bash
pnpm build
pnpm start
```

Railway uses `railway.json` with the root `Dockerfile`. Set Railway variables from `.env.production.example`, especially `DATABASE_URL`, `NODE_ENV=production`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `TRUSTED_ORIGINS`, and optional `SENTRY_DSN` / `VITE_SENTRY_DSN`.

Build the Docker image locally with:

```bash
pnpm docker:build
```

## Project Structure

```
my-helpdesk/
├── frontend/          # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/       # React context providers
│       ├── lib/          # Library configurations
│       ├── pages/        # Page components
│       └── App.tsx       # Main app component
├── backend/           # Express backend
│   └── src/
│       ├── middleware/    # Express middleware
│       ├── routes/       # API routes
│       ├── auth.ts       # Better Auth configuration
│       └── index.ts      # Server entry point
└── plan.md            # Implementation plan
```

## Features

### Phase 1-3 Completed

- User registration and login
- Session management with Better Auth
- Role-based access control (ADMIN, AGENT)
- Admin user management panel

### Phase 4+ Upcoming

- Ticket CRUD operations
- Ticket responses/thread
- Email notifications
- AI-powered ticket classification and summaries

## API Endpoints

### Authentication

- `POST /api/auth/*` - Better Auth endpoints (sign-in, sign-up, sign-out, session)

### Users (Admin only)

- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/me` - Get current user

### Health

- `GET /api/health` - Health check

## Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

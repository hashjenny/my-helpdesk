# Helpdesk

AI-powered ticket management system.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + React Router + Tailwind CSS
- **Backend**: Express + TypeScript + Bun
- **Database**: PostgreSQL + Prisma 5
- **Auth**: Better Auth with bcrypt password hashing
- **AI**: MiniMax API (upcoming)
- **Email**: Resend + React Email (upcoming)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database

### Installation

1. Install dependencies:

```bash
# Frontend
cd frontend
bun install

# Backend
cd backend
bun install
```

2. Set up environment variables:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL and secrets
```

3. Run database migrations:

```bash
cd backend
bunx prisma migrate dev
```

4. Start the development servers:

```bash
# Terminal 1 - Backend
cd backend
bun run src/index.ts

# Terminal 2 - Frontend
cd frontend
bun run dev
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

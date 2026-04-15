# Implementation Plan

## Phase 1: Project Setup

### 1.1 Frontend Setup

- Initialize React + Vite + TypeScript project
- Configure Tailwind CSS
- Setup React Router (routes, layouts)
- Setup folder structure (components, pages, hooks, utils)

### 1.2 Backend Setup

- Initialize Node.js + Express + TypeScript project
- Setup folder structure (routes, controllers, services, middleware)
- Configure CORS and JSON parsing

### 1.3 Database Setup

- Setup PostgreSQL database
- Initialize Prisma with TypeScript
- Define data models

---

## Phase 2: Database Schema & Models

### 2.1 Prisma Schema

- User model (id, email, password, role, name, createdAt)
- Ticket model (id, subject, body, status, category, createdAt, updatedAt)
- TicketResponse model (id, ticketId, body, createdAt)
- Session model (for express-session)

---

## Phase 3: Authentication

### 3.1 Auth API

- POST /auth/login
- POST /auth/logout
- GET /auth/me (get current user)

### 3.2 Admin User Management

- POST /users (admin creates support agent)
- GET /users (list all agents)
- DELETE /users/:id (remove agent)

### 3.3 Session Middleware

- Session validation middleware
- Role-based access control (admin, agent)

---

## Phase 4: Ticket Management

### 4.1 Ticket API

- GET /tickets (list with filters: status, category, search)
- POST /tickets (create new ticket)
- GET /tickets/:id (ticket detail)
- PATCH /tickets/:id (update ticket)
- PATCH /tickets/:id/status (change status)
- PATCH /tickets/:id/category (change category)

### 4.2 Ticket Responses

- POST /tickets/:id/responses (add response to ticket)
- GET /tickets/:id/responses (list responses)

### 4.3 Frontend - Ticket List

- Ticket list page with filters (status, category)
- Sorting (date, priority)
- Search functionality
- Pagination

### 4.4 Frontend - Ticket Detail

- Ticket detail view
- Response thread
- Status/category change controls

---

## Phase 5: Email Integration

### 5.1 Email Sending

- Setup Resend API
- Create React Email templates
- Send notification emails on ticket updates

### 5.2 Email Receiving

- Setup email webhook or IMAP integration
- Convert incoming emails to tickets

---

## Phase 6: AI Features

### 6.1 MiniMax API Integration

- Create AI service wrapper
- Handle API authentication and errors

### 6.2 AI Classification

- Classify ticket category (General, Technical, Refund)
- Endpoint: POST /tickets/:id/classify

### 6.3 AI Summaries

- Generate ticket summary
- Endpoint: GET /tickets/:id/summary

### 6.4 AI Suggested Replies

- Generate suggested responses
- Endpoint: GET /tickets/:id/suggested-reply

### 6.5 Frontend AI Integration

- Display AI classification suggestion
- Display AI summary
- Display AI suggested replies

---

## Phase 7: Dashboard

### 7.1 Dashboard API

- GET /dashboard/stats (ticket counts by status, category)
- GET /dashboard/recent (recent tickets)

### 7.2 Frontend Dashboard

- Overview statistics cards
- Ticket distribution charts
- Recent activity list

---

## Phase 8: Polish & Deployment

### 8.1 Error Handling

- Global error boundary (frontend)
- Error handling middleware (backend)
- Toast/notification system

### 8.2 Loading States

- Skeleton loaders
- Loading spinners

### 8.3 Deployment

- Docker configuration
- Environment variables setup
- Deployment scripts

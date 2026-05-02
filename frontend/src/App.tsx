import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserBadge } from './components/UserBadge'
import { StatusCheck } from './components/StatusCheck'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Users } from './pages/Users'
import { TicketList } from './pages/TicketList'
import { TicketDetail } from './pages/TicketDetail'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold"><Link to="/">Helpdesk</Link></h1>
              <nav className="flex gap-4">
                <Link to="/tickets" className="text-sm hover:underline">Tickets</Link>
                <Link to="/users" className="text-sm hover:underline">Users</Link>
              </nav>
            </div>
            <UserBadge />
          </div>
        </header>
        <main className="p-6">
          <StatusCheck />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <TicketList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

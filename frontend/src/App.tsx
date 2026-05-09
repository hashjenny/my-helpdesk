import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserBadge } from './components/UserBadge'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Users } from './pages/Users'
import { TicketList } from './pages/TicketList'
import { TicketDetail } from './pages/TicketDetail'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
        <header className="sticky top-0 z-50 w-full border-b border-amber-500/30 bg-[oklch(0.06_0_0)] backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="text-amber-400 font-bold text-lg tracking-tight">
                  <span className="text-amber-500">&gt;</span>
                  <span className="text-amber-400/90">_</span>
                </span>
                <h1 className="text-lg font-bold tracking-tight text-amber-400/90 group-hover:text-amber-400 transition-colors">
                  Helpdesk
                </h1>
              </Link>
              <nav className="flex gap-1">
                <Link
                  to="/tickets"
                  className="px-3 py-1.5 text-sm font-medium text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all"
                >
                  tickets
                </Link>
                <Link
                  to="/users"
                  className="px-3 py-1.5 text-sm font-medium text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all"
                >
                  users
                </Link>
              </nav>
            </div>
            <UserBadge />
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)] bg-[oklch(0.08_0_0)]">
          <div className="p-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
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
          </div>
        </main>
        </BrowserRouter>
        </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
  )
}

export default App

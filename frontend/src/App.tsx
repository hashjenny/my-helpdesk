import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserBadge } from './components/UserBadge'
import { StatusCheck } from './components/StatusCheck'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AdminUsers } from './pages/AdminUsers'
import { Users } from './pages/Users'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">Helpdesk</h1>
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
                  <div>Ticket List</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <div>Ticket Detail</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
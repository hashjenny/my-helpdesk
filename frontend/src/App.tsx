import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UserBadge } from './components/UserBadge'
import { StatusCheck } from './components/StatusCheck'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AdminUsers } from './pages/AdminUsers'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">Helpdesk</h1>
          <UserBadge />
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
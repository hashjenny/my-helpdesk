import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StatusCheck } from './components/StatusCheck'

function App() {
  return (
    <BrowserRouter>
      <main style={{ padding: '2rem' }}>
        <h1>Helpdesk</h1>
        <StatusCheck />
      </main>
      <Routes>
        <Route path="/" element={<div>Dashboard</div>} />
        <Route path="/tickets" element={<div>Ticket List</div>} />
        <Route path="/tickets/:id" element={<div>Ticket Detail</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

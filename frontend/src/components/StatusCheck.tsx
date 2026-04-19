import { useEffect, useState } from 'react'
import { API_BASE } from "../lib/auth-client"

export function StatusCheck() {
  const [status, setStatus] = useState<string>('Checking...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setError('Failed to connect'))
  }, [])

  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return <p>Backend status: {status}</p>
}

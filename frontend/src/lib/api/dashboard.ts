import axios from "axios"
import { API_BASE, signOut } from "../auth-client"

const createAxiosInstance = (token: string) => {
  const instance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error?.response?.status === 401) {
        await signOut()
      }
      return Promise.reject(error)
    }
  )

  return instance
}

export interface DashboardStats {
  total: number
  byStatus: { OPEN: number; RESOLVED: number; CLOSED: number }
  byCategory: { GENERAL: number; TECHNICAL: number; REFUND: number }
}

export interface RecentTicket {
  id: string
  subject: string
  status: string
  category: string
  createdAt: string
  supportEmail: string | null
}

export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
  const instance = createAxiosInstance(token)
  const response = await instance.get("/api/dashboard/stats")
  return response.data
}

export async function fetchDashboardRecent(token: string): Promise<{ tickets: RecentTicket[] }> {
  const instance = createAxiosInstance(token)
  const response = await instance.get("/api/dashboard/recent")
  return response.data
}
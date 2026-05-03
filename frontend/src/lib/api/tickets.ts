import axios from "axios"
import { API_BASE, signOut } from "../auth-client"
import type {
  Ticket,
  TicketsResponse,
  CreateTicketInput,
  UpdateTicketInput,
  TicketResponse,
  CreateTicketResponseInput,
} from "@helpdesk/shared"

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

interface FetchTicketsParams {
  page: number
  limit: number
  status?: string
  category?: string
  search?: string
  token: string
}

export async function fetchTickets(params: FetchTicketsParams): Promise<TicketsResponse> {
  const { page, limit, status, category, search, token } = params
  const instance = createAxiosInstance(token)
  const response = await instance.get("/api/tickets", {
    params: { page, limit, status, category, search },
  })
  return response.data
}

export async function fetchTicket(id: string, token: string): Promise<Ticket> {
  const instance = createAxiosInstance(token)
  const response = await instance.get(`/api/tickets/${id}`)
  return response.data
}

export async function createTicket(data: CreateTicketInput, token: string): Promise<Ticket> {
  const instance = createAxiosInstance(token)
  const response = await instance.post("/api/tickets", data)
  return response.data
}

export async function updateTicket(id: string, data: UpdateTicketInput, token: string): Promise<Ticket> {
  const instance = createAxiosInstance(token)
  const response = await instance.patch(`/api/tickets/${id}`, data)
  return response.data
}

export async function deleteTicket(id: string, token: string): Promise<void> {
  const instance = createAxiosInstance(token)
  await instance.delete(`/api/tickets/${id}`)
}

export async function fetchResponses(ticketId: string, token: string): Promise<TicketResponse[]> {
  const instance = createAxiosInstance(token)
  const response = await instance.get(`/api/tickets/${ticketId}/responses`)
  return response.data
}

export async function addResponse(
  ticketId: string,
  data: CreateTicketResponseInput,
  token: string
): Promise<TicketResponse> {
  const instance = createAxiosInstance(token)
  const response = await instance.post(`/api/tickets/${ticketId}/responses`, data)
  return response.data
}

export async function polishTicketResponse(
  id: string,
  body: string,
  token: string
): Promise<{ polished: string }> {
  const instance = createAxiosInstance(token)
  const response = await instance.post(`/api/tickets/${id}/polish`, { body })
  return response.data as { polished: string }
}

import { z } from "zod"

export const UserRole = ["AGENT", "ADMIN"] as const
export type UserRole = (typeof UserRole)[number]

export const Role = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
} as const

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  deletedAt?: string | null
}

export interface UsersResponse {
  users: User[]
  total: number
  page: number
  totalPages: number
}

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  role: z.enum(UserRole).default(Role.AGENT),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  role: z.enum(UserRole).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
})

export const changePasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
})

export type CreateUserInput = z.input<typeof createUserSchema>
export type CreateUser = z.output<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export function isUserRole(value: string): value is UserRole {
  return UserRole.includes(value as UserRole)
}

// Ticket Status & Category
export const TicketStatus = ["OPEN", "RESOLVED", "CLOSED"] as const
export type TicketStatus = (typeof TicketStatus)[number]

export const TicketCategory = ["GENERAL", "TECHNICAL", "REFUND"] as const
export type TicketCategory = (typeof TicketCategory)[number]

// Ticket interfaces
export interface TicketAssignee {
  id: string
  name: string
  email: string
}

export interface Ticket {
  id: string
  subject: string
  body: string
  status: TicketStatus
  category: TicketCategory
  supportEmail: string | null
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  responses?: TicketResponse[]
  assignee?: TicketAssignee | null
}

export interface TicketResponse {
  id: string
  ticketId: string
  body: string
  createdAt: string
  isCustomerReply: boolean
}

export interface TicketsResponse {
  tickets: Ticket[]
  total: number
  page: number
  totalPages: number
}

// Ticket Zod schemas
export const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  body: z.string().min(1, "Body is required"),
  category: z.enum(TicketCategory).default("GENERAL"),
  supportEmail: z.string().email().optional(),
})

export const updateTicketSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  status: z.enum(TicketStatus).optional(),
  category: z.enum(TicketCategory).optional(),
  assignedTo: z.string().nullable().optional(),
})

export const createTicketResponseSchema = z.object({
  body: z.string().min(1, "Response body is required"),
})

export type CreateTicketInput = z.input<typeof createTicketSchema>
export type CreateTicket = z.output<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type CreateTicketResponseInput = z.infer<typeof createTicketResponseSchema>

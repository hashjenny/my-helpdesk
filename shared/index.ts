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

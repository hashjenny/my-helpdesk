import axios from "axios"
import { API_BASE, signOut } from "../auth-client"
import type { CreateUserInput, User, UsersResponse } from "@helpdesk/shared"

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

interface FetchUsersParams {
  page: number
  limit: number
  search?: string
  role?: string
  token: string
}

export async function fetchUsers(params: FetchUsersParams): Promise<UsersResponse> {
  const { page, limit, search, role, token } = params
  const instance = createAxiosInstance(token)
  const response = await instance.get("/api/users", {
    params: { page, limit, search, role },
  })
  return response.data
}

export async function createUser(data: CreateUserInput, token: string): Promise<User> {
  const instance = createAxiosInstance(token)
  const response = await instance.post("/api/users", data)
  return response.data
}

interface UpdateUserParams {
  name?: string
  role?: "AGENT" | "ADMIN"
  password?: string
}

export async function updateUser(id: string, data: UpdateUserParams, token: string): Promise<User> {
  const instance = createAxiosInstance(token)

  // If password is being changed, use the separate password endpoint
  if (data.password) {
    await instance.patch(`/api/users/${id}/password`, {
      newPassword: data.password,
    })
    // Only send non-password fields to the regular update
    const { password, ...rest } = data
    void password
    if (Object.keys(rest).length > 0) {
      const response = await instance.patch(`/api/users/${id}`, rest)
      return response.data
    }
    // If only password was changed, return the updated user
    const userResponse = await instance.get(`/api/users/${id}`)
    return userResponse.data
  }

  const response = await instance.patch(`/api/users/${id}`, data)
  return response.data
}

export async function deleteUser(id: string, token: string): Promise<void> {
  const instance = createAxiosInstance(token)
  await instance.delete(`/api/users/${id}`)
}

interface Agent {
  id: string
  name: string
  email: string
}

export async function fetchAgents(token: string): Promise<Agent[]> {
  const instance = createAxiosInstance(token)
  const response = await instance.get("/api/users/agents")
  return response.data
}

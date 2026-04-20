import axios from "axios"
import { API_BASE } from "../auth-client"

export interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export interface UsersResponse {
  users: User[]
  total: number
  page: number
  totalPages: number
}

const createAxiosInstance = (token: string) =>
  axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

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

interface CreateUserData {
  email: string
  password: string
  name: string
  role: "AGENT" | "ADMIN"
}

export async function createUser(data: CreateUserData, token: string): Promise<User> {
  const instance = createAxiosInstance(token)
  const response = await instance.post("/api/users", data)
  return response.data
}

interface UpdateUserData {
  name?: string
  role?: "AGENT" | "ADMIN"
}

export async function updateUser(id: string, data: UpdateUserData, token: string): Promise<User> {
  const instance = createAxiosInstance(token)
  const response = await instance.patch(`/api/users/${id}`, data)
  return response.data
}

export async function deleteUser(id: string, token: string): Promise<void> {
  const instance = createAxiosInstance(token)
  await instance.delete(`/api/users/${id}`)
}
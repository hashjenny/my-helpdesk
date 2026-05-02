import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { fetchUsers, createUser, updateUser, deleteUser } from "../lib/api/users"
import type { CreateUserInput, UpdateUserInput, User } from "@helpdesk/shared"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  UserTable,
  UserFilters,
  CreateUserForm,
  EditUserModal,
  Pagination,
} from "@/components/users"

export function AdminUsers() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const token = session?.session?.token ?? ""

  // Search & filter state
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Create form
  const [showForm, setShowForm] = useState(false)

  // Edit modal state
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Fetch users with TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page, limit, search, roleFilter],
    queryFn: () => fetchUsers({ page, limit, search, role: roleFilter, token }),
    enabled: Boolean(token),
  })

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setShowForm(false)
    },
    onError: (err: Error) => alert(err.message),
  })

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setEditingUser(null)
    },
    onError: (err: Error) => alert(err.message),
  })

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (err: Error) => alert(err.message),
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setPage(1)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id)
    }
  }

  const users = data?.users ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
          {showForm ? "Cancel" : "Add Agent"}
        </Button>
      </div>

      {showForm && (
        <CreateUserForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isPending={createMutation.isPending}
        />
      )}

      <Separator />

      <UserFilters
        search={search}
        roleFilter={roleFilter}
        onSearchChange={handleSearchChange}
        onRoleFilterChange={handleRoleFilterChange}
      />

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(id, data) => updateMutation.mutate({ id, data })}
          isPending={updateMutation.isPending}
        />
      )}

      <UserTable
        users={users}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        currentUserId={session?.user?.id}
        limit={limit}
        onEdit={(user) => setEditingUser(user)}
        onDelete={handleDelete}
        deletePending={deleteMutation.isPending}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit)
          setPage(1)
        }}
      />
    </div>
  )
}

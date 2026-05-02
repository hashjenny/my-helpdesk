import { Role, type User } from "shared"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface UserTableProps {
  users: User[]
  isLoading: boolean
  error: Error | null
  currentUserId?: string
  limit: number
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  deletePending: boolean
}

export function UserTable({
  users,
  isLoading,
  error,
  currentUserId,
  limit,
  onEdit,
  onDelete,
  deletePending,
}: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: limit > 10 ? 5 : limit }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-32 rounded bg-muted animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
            </TableRow>
          ))
        ) : error ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-destructive py-8">
              {error instanceof Error ? error.message : "Failed to load users"}
            </TableCell>
          </TableRow>
        ) : users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No users found
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${user.role === "ADMIN"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {user.role}
                </span>
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </Button>
                  {user.id !== currentUserId && user.role !== Role.ADMIN && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user.id)}
                      disabled={deletePending}
                      className="text-destructive hover:text-destructive"
                    >
                      {deletePending ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

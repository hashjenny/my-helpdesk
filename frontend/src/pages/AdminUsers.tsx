import { useState, useEffect } from "react"
import { useSession } from "../lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export function AdminUsers() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "", name: "", role: "AGENT" })

  // Role is stored in our database, not in Better Auth's user type
  const isAdmin = (session?.user as unknown as User & { role?: string })?.role === "ADMIN"

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users", {
        headers: {
          Authorization: `Bearer ${session?.session?.token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data)
    } catch {
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.token}`,
        },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Failed to create user")
      setFormData({ email: "", password: "", name: "", role: "AGENT" })
      setShowForm(false)
      fetchUsers()
    } catch {
      setError("Failed to create user")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.session?.token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to delete user")
      fetchUsers()
    } catch {
      setError("Failed to delete user")
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Access denied. Admin only.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
          {showForm ? "Cancel" : "Add Agent"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form-name">Name</Label>
                  <Input
                    id="form-name"
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form-email">Email</Label>
                  <Input
                    id="form-email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form-password">Password</Label>
                  <Input
                    id="form-password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form-role">Role</Label>
                  <select
                    id="form-role"
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="AGENT">Agent</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

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
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                    user.role === "ADMIN"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {user.role}
                </span>
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {user.id !== (session?.user as unknown as User)?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
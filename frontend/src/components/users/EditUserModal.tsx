import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@helpdesk/shared"

interface EditUserModalProps {
  user: User
  onClose: () => void
  onSave: (id: string, data: { name: string; role: "AGENT" | "ADMIN"; password?: string }) => void
  isPending: boolean
}

export function EditUserModal({ user, onClose, onSave, isPending }: EditUserModalProps) {
  const [name, setName] = useState(user.name)
  const [role, setRole] = useState(user.role as "AGENT" | "ADMIN")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(user.id, {
      name,
      role,
      ...(password && { password }),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md border-amber-500/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-mono">&gt;</span>
            <CardTitle className="text-sm font-mono text-amber-400/80 uppercase tracking-wider">
              edit user
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-amber-400/70 font-mono text-xs uppercase">
                &gt; name
              </Label>
              <Input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-amber-400/70 font-mono text-xs uppercase">
                &gt; role
              </Label>
              <Select
                id="edit-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "AGENT" | "ADMIN")}
              >
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-amber-400/70 font-mono text-xs uppercase">
                &gt; password
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="border-amber-500/30 bg-[oklch(0.08_0_0)] text-amber-400 font-mono placeholder:text-amber-500/30"
              />
              <p className="text-xs font-mono text-amber-500/40">minimum 6 characters</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending} className="font-mono">
                {isPending ? "[ saving... ]" : "[ save ]"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="font-mono">
                [ cancel ]
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

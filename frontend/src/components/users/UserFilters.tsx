import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

interface UserFiltersProps {
  search: string
  roleFilter: string
  onSearchChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
}

export function UserFilters({
  search,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="search by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="font-mono"
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="AGENT">Agent</option>
        </Select>
      </div>
    </div>
  )
}

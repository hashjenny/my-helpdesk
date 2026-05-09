import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

interface TicketFiltersProps {
  search: string
  status: string
  category: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onCategoryChange: (value: string) => void
}

export function TicketFilters({
  search,
  status,
  category,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: TicketFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="search tickets..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="font-mono"
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </Select>
      </div>
      <div className="w-full sm:w-40">
        <Select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="GENERAL">General</option>
          <option value="TECHNICAL">Technical</option>
          <option value="REFUND">Refund</option>
        </Select>
      </div>
    </div>
  )
}
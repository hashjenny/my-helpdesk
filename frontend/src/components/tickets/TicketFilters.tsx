import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TicketFiltersProps {
  search: string
  status: string
  category: string
  sortBy: string
  sortOrder: "asc" | "desc"
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSortChange: (value: string) => void
  onSortOrderToggle: () => void
}

function SortIcon({ ascending }: { ascending: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ascending ? (
        <path d="M12 5v14M5 12l7-7 7 7" />
      ) : (
        <path d="M12 19V5M5 12l7 7 7-7" />
      )}
    </svg>
  )
}

export function TicketFilters({
  search,
  status,
  category,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onSortChange,
  onSortOrderToggle,
}: TicketFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-40">
        <select
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      <div className="w-full sm:w-40">
        <select
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="GENERAL">General</option>
          <option value="TECHNICAL">Technical</option>
          <option value="REFUND">Refund</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <select
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="createdAt">Created</option>
          <option value="updatedAt">Updated</option>
          <option value="subject">Subject</option>
          <option value="status">Status</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={onSortOrderToggle}
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          <SortIcon ascending={sortOrder === "asc"} />
        </Button>
      </div>
    </div>
  )
}

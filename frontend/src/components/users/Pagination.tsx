import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono text-amber-500/60">total: {total}</span>
        <Select
          value={String(limit)}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || isLoading}
          className="font-mono"
        >
          [prev]
        </Button>
        <span className="text-sm font-mono text-amber-500/60">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || isLoading}
          className="font-mono"
        >
          [next]
        </Button>
      </div>
    </div>
  )
}

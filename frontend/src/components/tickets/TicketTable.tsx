import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Link } from "react-router-dom"
import type { Ticket, TicketStatus } from "@helpdesk/shared"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmailBadge } from "./EmailBadge"

const statusColors: Record<TicketStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
}

const categoryLabels: Record<string, string> = {
  GENERAL: "General",
  TECHNICAL: "Technical",
  REFUND: "Refund",
}

interface TicketTableProps {
  tickets: Ticket[]
  isLoading: boolean
  error: Error | null
  limit: number
  onEdit: (ticket: Ticket) => void
  onDelete: (id: string) => void
  deletePending: boolean
}

export function TicketTable({
  tickets,
  isLoading,
  error,
  limit,
  onEdit,
  onDelete,
  deletePending,
}: TicketTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <div>
            <Link
              to={`/tickets/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.original.subject}
            </Link>
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {row.original.body.slice(0, 60)}...
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[row.original.status]}`}>
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => categoryLabels[row.original.category] || row.original.category,
      },
      {
        accessorKey: "supportEmail",
        header: "Source",
        cell: ({ row }) => <EmailBadge email={row.original.supportEmail} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link to={`/tickets/${row.original.id}`}>
              <Button variant="ghost" size="sm">View</Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original.id)}
              disabled={deletePending}
              className="text-destructive hover:text-destructive"
            >
              {deletePending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        ),
      },
    ],
    [deletePending, onDelete, onEdit]
  )

  const table = useReactTable({
    data: tickets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center gap-1">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() && (
                    <span className="ml-1">
                      {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><div className="h-4 w-48 rounded bg-muted animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
            </TableRow>
          ))
        ) : error ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-destructive py-8">
              {error instanceof Error ? error.message : "Failed to load tickets"}
            </TableCell>
          </TableRow>
        ) : table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No tickets found
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
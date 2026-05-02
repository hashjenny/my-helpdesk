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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
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
        ) : tickets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No tickets found
            </TableCell>
          </TableRow>
        ) : (
          tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="font-medium hover:underline"
                >
                  {ticket.subject}
                </Link>
                <p className="text-xs text-muted-foreground truncate max-w-xs">
                  {ticket.body.slice(0, 60)}...
                </p>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[ticket.status]}`}>
                  {ticket.status}
                </span>
              </TableCell>
              <TableCell>{categoryLabels[ticket.category]}</TableCell>
              <TableCell>
                <EmailBadge email={ticket.supportEmail} />
              </TableCell>
              <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link to={`/tickets/${ticket.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(ticket)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(ticket.id)}
                    disabled={deletePending}
                    className="text-destructive hover:text-destructive"
                  >
                    {deletePending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

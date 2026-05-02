import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { fetchTicket, updateTicket, addResponse } from "../lib/api/tickets"
import type { UpdateTicketInput, TicketStatus, TicketCategory } from "@helpdesk/shared"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { TicketResponses, ReplyForm, EmailBadge } from "@/components/tickets"

const statusColors: Record<TicketStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
}

export function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const token = session?.session?.token ?? ""

  // Fetch ticket
  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id!, token),
    enabled: Boolean(id && token),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateTicketInput) => updateTicket(id!, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] })
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
    },
    onError: (err: Error) => alert(err.message),
  })

  // Response mutation
  const responseMutation = useMutation({
    mutationFn: (body: string) => addResponse(id!, { body }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] })
    },
    onError: (err: Error) => alert(err.message),
  })

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateMutation.mutate({ status: newStatus })
  }

  const handleCategoryChange = (newCategory: TicketCategory) => {
    updateMutation.mutate({ category: newCategory })
  }

  const handleReply = (body: string) => {
    responseMutation.mutate(body)
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (error || !ticket) {
    return (
      <div className="p-6">
        <Link to="/tickets" className="text-sm hover:underline mb-4 inline-block">
          Back to tickets
        </Link>
        <div className="text-destructive">Failed to load ticket</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Link to="/tickets" className="text-sm hover:underline">
        Back to tickets
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-sm font-medium ${statusColors[ticket.status as TicketStatus]}`}>
              {ticket.status}
            </span>
            <span className="text-sm text-muted-foreground">
              {ticket.category}
            </span>
            <EmailBadge email={ticket.supportEmail} />
            <span className="text-sm text-muted-foreground">
              Created {new Date(ticket.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
            disabled={updateMutation.isPending}
          >
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={ticket.category}
            onChange={(e) => handleCategoryChange(e.target.value as TicketCategory)}
            disabled={updateMutation.isPending}
          >
            <option value="GENERAL">General</option>
            <option value="TECHNICAL">Technical</option>
            <option value="REFUND">Refund</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="whitespace-pre-wrap">{ticket.body}</p>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Responses</h2>
        <TicketResponses responses={ticket.responses ?? []} />
      </div>

      <Separator />

      <ReplyForm
        onSubmit={handleReply}
        isPending={responseMutation.isPending}
      />
    </div>
  )
}

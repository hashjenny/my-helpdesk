import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { fetchTickets, createTicket, deleteTicket } from "../lib/api/tickets"
import type { CreateTicketInput, Ticket } from "@helpdesk/shared"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TicketFilters, TicketTable, CreateTicketForm } from "@/components/tickets"
import { Pagination } from "@/components/users/Pagination"

export function TicketList() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const token = session?.session?.token ?? ""

  // Filters
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [category, setCategory] = useState("")

  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Create form
  const [showForm, setShowForm] = useState(false)

  // Fetch tickets
  const { data, isLoading, error } = useQuery({
    queryKey: ["tickets", page, limit, search, status, category],
    queryFn: () => fetchTickets({ page, limit, search, status, category, token }),
    enabled: Boolean(token),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTicketInput) => createTicket(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      setShowForm(false)
    },
    onError: (err: Error) => alert(err.message),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTicket(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
    },
    onError: (err: Error) => alert(err.message),
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPage(1)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      deleteMutation.mutate(id)
    }
  }

  const tickets = data?.tickets ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
          {showForm ? "Cancel" : "New Ticket"}
        </Button>
      </div>

      {showForm && (
        <CreateTicketForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isPending={createMutation.isPending}
        />
      )}

      <Separator />

      <TicketFilters
        search={search}
        status={status}
        category={category}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
      />

      <TicketTable
        tickets={tickets}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        limit={limit}
        onEdit={(_ticket: Ticket) => {}}
        onDelete={handleDelete}
        deletePending={deleteMutation.isPending}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit)
          setPage(1)
        }}
      />
    </div>
  )
}

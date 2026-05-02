import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { TicketTable } from "./TicketTable"
import { TicketFilters } from "./TicketFilters"
import { CreateTicketForm } from "./CreateTicketForm"
import { ReplyForm } from "./ReplyForm"
import { EmailBadge } from "./EmailBadge"
import type { Ticket } from "@helpdesk/shared"

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = createQueryClient()
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  )
}

const mockTickets: Ticket[] = [
  {
    id: "1",
    subject: "Login issue",
    body: "Cannot login to my account",
    status: "OPEN",
    category: "TECHNICAL",
    supportEmail: "user@example.com",
    assignedTo: null,
    createdAt: new Date("2026-05-01").toISOString(),
    updatedAt: new Date("2026-05-01").toISOString(),
  },
  {
    id: "2",
    subject: "Refund request",
    body: "I want a refund for my order",
    status: "RESOLVED",
    category: "REFUND",
    supportEmail: null,
    assignedTo: null,
    createdAt: new Date("2026-05-02").toISOString(),
    updatedAt: new Date("2026-05-02").toISOString(),
  },
]

describe("EmailBadge", () => {
  it("renders email when provided", () => {
    render(<EmailBadge email="test@example.com" />)
    expect(screen.getByText(/test@example\.com/)).toBeInTheDocument()
  })

  it("returns null when email is null", () => {
    const { container } = render(<EmailBadge email={null} />)
    expect(container.firstChild).toBeNull()
  })
})

describe("TicketFilters", () => {
  it("renders search input and selects", () => {
    render(
      <TicketFilters
        search=""
        status=""
        category=""
        onSearchChange={() => {}}
        onStatusChange={() => {}}
        onCategoryChange={() => {}}
      />
    )
    expect(screen.getByPlaceholderText("Search tickets...")).toBeInTheDocument()
    expect(screen.getAllByRole("combobox")).toHaveLength(2)
  })

  it("calls onSearchChange when typing", async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    render(
      <TicketFilters
        search=""
        status=""
        category=""
        onSearchChange={onSearchChange}
        onStatusChange={() => {}}
        onCategoryChange={() => {}}
      />
    )
    const input = screen.getByPlaceholderText("Search tickets...")
    await user.type(input, "test")
    expect(onSearchChange).toHaveBeenCalled()
  })

  it("calls onStatusChange when selecting status", async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    render(
      <TicketFilters
        search=""
        status=""
        category=""
        onSearchChange={() => {}}
        onStatusChange={onStatusChange}
        onCategoryChange={() => {}}
      />
    )
    const selects = screen.getAllByRole("combobox")
    await user.selectOptions(selects[0], "OPEN")
    expect(onStatusChange).toHaveBeenCalledWith("OPEN")
  })

  it("calls onCategoryChange when selecting category", async () => {
    const user = userEvent.setup()
    const onCategoryChange = vi.fn()
    render(
      <TicketFilters
        search=""
        status=""
        category=""
        onSearchChange={() => {}}
        onStatusChange={() => {}}
        onCategoryChange={onCategoryChange}
      />
    )
    const selects = screen.getAllByRole("combobox")
    await user.selectOptions(selects[1], "REFUND")
    expect(onCategoryChange).toHaveBeenCalledWith("REFUND")
  })
})

describe("TicketTable", () => {
  it("renders ticket rows", () => {
    renderWithClient(
      <TicketTable
        tickets={mockTickets}
        isLoading={false}
        error={null}
        limit={10}
        onEdit={() => {}}
        onDelete={() => {}}
        deletePending={false}
      />
    )
    expect(screen.getByText("Login issue")).toBeInTheDocument()
    expect(screen.getByText("Refund request")).toBeInTheDocument()
  })

  it("renders loading skeleton", () => {
    renderWithClient(
      <TicketTable
        tickets={[]}
        isLoading={true}
        error={null}
        limit={10}
        onEdit={() => {}}
        onDelete={() => {}}
        deletePending={false}
      />
    )
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument()
  })

  it("renders error state", () => {
    renderWithClient(
      <TicketTable
        tickets={[]}
        isLoading={false}
        error={new Error("Failed to load")}
        limit={10}
        onEdit={() => {}}
        onDelete={() => {}}
        deletePending={false}
      />
    )
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })

  it("renders empty state", () => {
    renderWithClient(
      <TicketTable
        tickets={[]}
        isLoading={false}
        error={null}
        limit={10}
        onEdit={() => {}}
        onDelete={() => {}}
        deletePending={false}
      />
    )
    expect(screen.getByText(/no tickets found/i)).toBeInTheDocument()
  })

  it("calls onDelete when delete button clicked", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderWithClient(
      <TicketTable
        tickets={mockTickets}
        isLoading={false}
        error={null}
        limit={10}
        onEdit={() => {}}
        onDelete={onDelete}
        deletePending={false}
      />
    )
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i })
    await user.click(deleteButtons[0])
    expect(onDelete).toHaveBeenCalledWith("1")
  })

  it("shows View link for each ticket", () => {
    renderWithClient(
      <TicketTable
        tickets={mockTickets}
        isLoading={false}
        error={null}
        limit={10}
        onEdit={() => {}}
        onDelete={() => {}}
        deletePending={false}
      />
    )
    const viewLinks = screen.getAllByRole("link", { name: /view/i })
    expect(viewLinks).toHaveLength(2)
  })
})

describe("CreateTicketForm", () => {
  it("renders form fields", () => {
    render(
      <CreateTicketForm onSubmit={() => {}} onCancel={() => {}} isPending={false} />
    )
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /create ticket/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  it("calls onSubmit with form data", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <CreateTicketForm onSubmit={onSubmit} onCancel={() => {}} isPending={false} />
    )
    await user.type(screen.getByLabelText(/subject/i), "Test Subject")
    await user.type(screen.getByLabelText(/description/i), "Test Description")
    await user.click(screen.getByRole("button", { name: /create ticket/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Test Subject", body: "Test Description" })
    )
  })

  it("calls onCancel when cancel clicked", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <CreateTicketForm onSubmit={() => {}} onCancel={onCancel} isPending={false} />
    )
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it("disables submit button when isPending", () => {
    render(
      <CreateTicketForm onSubmit={() => {}} onCancel={() => {}} isPending={true} />
    )
    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled()
  })
})

describe("ReplyForm", () => {
  it("renders reply textarea and submit button", () => {
    render(<ReplyForm onSubmit={() => {}} isPending={false} />)
    expect(screen.getByLabelText(/your response/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send response/i })).toBeInTheDocument()
  })

  it("calls onSubmit with reply body", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ReplyForm onSubmit={onSubmit} isPending={false} />)
    const textarea = screen.getByLabelText(/your response/i)
    await user.type(textarea, "This is a reply")
    await user.click(screen.getByRole("button", { name: /send response/i }))
    expect(onSubmit).toHaveBeenCalledWith("This is a reply")
  })

  it("disables submit button when isPending", () => {
    render(<ReplyForm onSubmit={() => {}} isPending={true} />)
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled()
  })
})
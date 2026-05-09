import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { fetchTicket, updateTicket, addResponse, summarizeTicket, classifyTicket, suggestReplies } from "../lib/api/tickets"
import { fetchAgents } from "../lib/api/users"
import type { UpdateTicketInput, TicketStatus, TicketCategory } from "@helpdesk/shared"
import { RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select } from "@/components/ui/select"
import { TicketResponses, ReplyForm, EmailBadge } from "@/components/tickets"

const statusColors: Record<TicketStatus, string> = {
  OPEN: "border-yellow-500/50 text-yellow-400 bg-yellow-500/10",
  RESOLVED: "border-green-500/50 text-green-400 bg-green-500/10",
  CLOSED: "border-gray-500/50 text-gray-400 bg-gray-500/10",
}

const categoryColors: Record<TicketCategory, string> = {
  GENERAL: "border-blue-500/50 text-blue-400 bg-blue-500/10",
  TECHNICAL: "border-orange-500/50 text-orange-400 bg-orange-500/10",
  REFUND: "border-red-500/50 text-red-400 bg-red-500/10",
}

export function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const token = session?.session?.token ?? ""

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id!, token),
    enabled: Boolean(id && token),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTicketInput) => updateTicket(id!, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] })
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
    },
    onError: (err: Error) => alert(err.message),
  })

  const responseMutation = useMutation({
    mutationFn: (body: string) => addResponse(id!, { body }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] })
    },
    onError: (err: Error) => alert(err.message),
  })

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: () => fetchAgents(token),
  })

  const [summary, setSummary] = useState<string | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(false)
  const [suggestedCategory, setSuggestedCategory] = useState<"GENERAL" | "TECHNICAL" | "REFUND" | null>(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([])
  const [isSuggestingReplies, setIsSuggestingReplies] = useState(false)
  const [replyText, setReplyText] = useState("")

  const handleGenerateSummary = async () => {
    if (!id || !token) return
    setIsSummaryLoading(true)
    setSummaryError(false)
    try {
      const result = await summarizeTicket(id, token)
      setSummary(result.summary)
    } catch {
      setSummaryError(true)
    } finally {
      setIsSummaryLoading(false)
    }
  }

  const handleClassify = async () => {
    if (!id || !token) return
    setIsClassifying(true)
    try {
      const result = await classifyTicket(id, token)
      setSuggestedCategory(result.category)
    } catch {
      // silently fail
    } finally {
      setIsClassifying(false)
    }
  }

  const handleSuggestReplies = async () => {
    if (!id || !token) return
    setIsSuggestingReplies(true)
    try {
      const result = await suggestReplies(id, token)
      setSuggestedReplies(result.replies)
    } catch {
      // silently fail
    } finally {
      setIsSuggestingReplies(false)
    }
  }

  const applySuggestedCategory = () => {
    if (suggestedCategory) {
      handleCategoryChange(suggestedCategory)
      setSuggestedCategory(null)
    }
  }

  useEffect(() => {
    // Auto-classify disabled - user triggers manually via button
  }, [ticket?.id])

  const isAdmin = session?.user?.role === "ADMIN"

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateMutation.mutate({ status: newStatus })
  }

  const handleCategoryChange = (newCategory: TicketCategory) => {
    updateMutation.mutate({ category: newCategory })
  }

  const handleAssignment = (assignedTo: string | null) => {
    updateMutation.mutate({ assignedTo })
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
    <div className="p-6">
      <Link to="/tickets" className="text-sm hover:underline mb-4 inline-block">
        Back to tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Ticket content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-mono text-amber-400/90">{ticket.subject}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono ${statusColors[ticket.status as TicketStatus]}`}>
                {ticket.status}
              </span>
              <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono ${categoryColors[ticket.category as TicketCategory]}`}>
                {ticket.category}
              </span>
              <EmailBadge email={ticket.supportEmail} />
              {ticket.assignee && (
                <span className="text-xs font-mono border border-amber-500/50 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {ticket.assignee.name}
                </span>
              )}
              <span className="text-xs font-mono text-amber-500/50">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <Card className="border-amber-500/20 bg-[oklch(0.11_0_0)]">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Button
                      onClick={handleGenerateSummary}
                      disabled={isSummaryLoading}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1 font-mono border-amber-500/30 text-amber-400/80 hover:bg-amber-500/10"
                    >
                      {isSummaryLoading ? (
                        <><RefreshCw className={`w-3 h-3 animate-spin`} /> generating...</>
                      ) : (
                        <><Sparkles className="w-3 h-3" /> ai summary</>
                      )}
                    </Button>
                  </div>
                  {summaryError ? (
                    <p className="text-sm text-red-400 font-mono">! generation failed</p>
                  ) : summary ? (
                    <p className="text-sm text-amber-400/80 font-mono whitespace-pre-wrap mt-2 border-l-2 border-amber-500/30 pl-3">{summary}</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

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

          <div className="flex items-center gap-2 mb-2">
            <Button
              onClick={handleSuggestReplies}
              disabled={isSuggestingReplies}
              variant="outline"
              size="sm"
              className="text-xs gap-1 font-mono border-amber-500/30 text-amber-400/80 hover:bg-amber-500/10"
            >
              <Sparkles className="w-3 h-3" />
              {isSuggestingReplies ? "generating..." : "ai suggested replies"}
            </Button>
          </div>

          {suggestedReplies.length > 0 && (
            <div className="mb-3 p-3 border border-amber-500/30 bg-[oklch(0.11_0_0)] rounded">
              <p className="text-xs font-mono text-amber-500/70 mb-2 uppercase tracking-wider">
                // suggested replies:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => setReplyText(reply)}
                    className="text-xs text-left px-2 py-1 border border-amber-500/40 bg-[oklch(0.08_0_0)] text-amber-400/80 rounded hover:bg-amber-500/10 hover:border-amber-500/60 transition-all font-mono"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ReplyForm ticketId={id!} onSubmit={handleReply} isPending={responseMutation.isPending} defaultValue={replyText} />
        </div>

        {/* Right column - Controls */}
        <div className="space-y-4">
          <Card className="border-amber-500/20 bg-[oklch(0.11_0_0)]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-mono">{'//'}</span>
                <CardTitle className="text-sm font-mono text-amber-400/80 uppercase tracking-wider">
                  ticket properties
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-amber-500/60 uppercase tracking-wider block">
                  &gt; status
                </label>
                <Select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  disabled={updateMutation.isPending}
                >
                  <option value="OPEN">Open</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-amber-500/60 uppercase tracking-wider block">
                  &gt; category
                </label>
                <div className="flex items-center gap-2 mb-1">
                  <Button
                    onClick={handleClassify}
                    disabled={isClassifying}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs gap-1 font-mono border-amber-500/30 text-amber-400/80 hover:bg-amber-500/10"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isClassifying ? "analyzing..." : "ai classify"}
                  </Button>
                </div>
                <Select
                  value={ticket.category}
                  onChange={(e) => handleCategoryChange(e.target.value as TicketCategory)}
                  disabled={updateMutation.isPending}
                >
                  <option value="GENERAL">General</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="REFUND">Refund</option>
                </Select>
                {suggestedCategory && suggestedCategory !== ticket.category && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-mono border border-amber-500/50 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      ai: {suggestedCategory}
                    </span>
                    <button
                      onClick={applySuggestedCategory}
                      className="text-xs font-mono text-amber-500/70 hover:text-amber-400 hover:underline"
                    >
                      [apply]
                    </button>
                  </div>
                )}
                {isClassifying && (
                  <span className="text-xs font-mono text-amber-500/50 mt-1 block">ai analyzing...</span>
                )}
              </div>

              {isAdmin && agents && (
                <div className="space-y-2">
                  <label className="text-xs font-mono text-amber-500/60 uppercase tracking-wider block">
                    &gt; assigned to
                  </label>
                  <Select
                    value={ticket.assignedTo ?? ""}
                    onChange={(e) => handleAssignment(e.target.value || null)}
                    disabled={updateMutation.isPending}
                  >
                    <option value="">unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
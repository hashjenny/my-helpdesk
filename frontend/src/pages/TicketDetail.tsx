import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { fetchTicket, updateTicket, addResponse, summarizeTicket, classifyTicket, suggestReplies } from "../lib/api/tickets"
import { fetchAgents } from "../lib/api/users"
import type { UpdateTicketInput, TicketStatus, TicketCategory } from "@helpdesk/shared"
import { RefreshCw, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
    if (ticket && ticket.category === "GENERAL" && !suggestedCategory) {
      handleClassify()
    }
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
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-sm font-medium ${statusColors[ticket.status as TicketStatus]}`}>
                {ticket.status}
              </span>
              <span className="text-sm text-muted-foreground">{ticket.category}</span>
              <EmailBadge email={ticket.supportEmail} />
              {ticket.assignee && (
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {ticket.assignee.name}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <Card className="bg-blue-50 border-blue-200 mt-2">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-blue-700">AI 总结</span>
                    {summary && (
                      <button
                        onClick={handleGenerateSummary}
                        disabled={isSummaryLoading}
                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                        title="刷新总结"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSummaryLoading ? "animate-spin" : ""}`} />
                      </button>
                    )}
                  </div>
                  {isSummaryLoading ? (
                    <p className="text-sm text-muted-foreground">生成中...</p>
                  ) : summaryError ? (
                    <p className="text-sm text-destructive">生成失败，请重试</p>
                  ) : summary ? (
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{summary}</p>
                  ) : (
                    <button
                      onClick={handleGenerateSummary}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      点击生成 AI 总结
                    </button>
                  )}
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
            <button
              onClick={handleSuggestReplies}
              disabled={isSuggestingReplies}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              {isSuggestingReplies ? "生成中..." : "AI 推荐回复"}
            </button>
          </div>

          {suggestedReplies.length > 0 && (
            <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
              <p className="text-xs font-medium text-purple-700 mb-2">推荐回复：</p>
              <div className="flex flex-wrap gap-2">
                {suggestedReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => {}}
                    className="text-xs text-left px-2 py-1 bg-white border border-purple-200 rounded hover:bg-purple-100 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ReplyForm ticketId={id!} onSubmit={handleReply} isPending={responseMutation.isPending} />
        </div>

        {/* Right column - Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Status</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  disabled={updateMutation.isPending}
                >
                  <option value="OPEN">Open</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Category</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={ticket.category}
                  onChange={(e) => handleCategoryChange(e.target.value as TicketCategory)}
                  disabled={updateMutation.isPending}
                >
                  <option value="GENERAL">General</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="REFUND">Refund</option>
                </select>
                {suggestedCategory && suggestedCategory !== ticket.category && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI建议: {suggestedCategory}
                    </span>
                    <button
                      onClick={applySuggestedCategory}
                      className="text-xs text-purple-600 hover:text-purple-800 underline"
                    >
                      应用
                    </button>
                  </div>
                )}
                {isClassifying && <span className="text-xs text-muted-foreground mt-1 block">AI分析中...</span>}
              </div>

              {isAdmin && agents && (
                <div>
                  <label className="text-sm font-medium block mb-1">Assigned To</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={ticket.assignedTo ?? ""}
                    onChange={(e) => handleAssignment(e.target.value || null)}
                    disabled={updateMutation.isPending}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
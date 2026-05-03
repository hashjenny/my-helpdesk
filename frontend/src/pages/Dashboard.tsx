import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { fetchDashboardStats, fetchDashboardRecent } from "@/lib/api/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import type { TicketStatus } from "@helpdesk/shared"

const statusLabels: Record<TicketStatus, string> = {
  OPEN: "待处理",
  RESOLVED: "已解决",
  CLOSED: "已关闭",
}


export function Dashboard() {
  const { session } = useAuth()
  const token = session?.session?.token ?? ""

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => fetchDashboardStats(token),
    enabled: Boolean(token),
    staleTime: 30_000,
  })

  const { data: recent, isLoading: recentLoading, isError: recentError } = useQuery({
    queryKey: ["dashboard", "recent"],
    queryFn: () => fetchDashboardRecent(token),
    enabled: Boolean(token),
    staleTime: 30_000,
  })

  const statCards = [
    { label: "总工单", value: stats?.total ?? 0, color: "bg-blue-50 border-blue-200" },
    { label: "待处理", value: stats?.byStatus.OPEN ?? 0, color: "bg-yellow-50 border-yellow-200" },
    { label: "已解决", value: stats?.byStatus.RESOLVED ?? 0, color: "bg-green-50 border-green-200" },
    { label: "已关闭", value: stats?.byStatus.CLOSED ?? 0, color: "bg-gray-50 border-gray-200" },
  ]

  const categoryCards = [
    { label: "一般咨询", key: "GENERAL" as const, color: "bg-blue-50 border-blue-200" },
    { label: "技术问题", key: "TECHNICAL" as const, color: "bg-orange-50 border-orange-200" },
    { label: "退款", key: "REFUND" as const, color: "bg-red-50 border-red-200" },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className={card.color}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {statsLoading ? (
                <div className="h-8 bg-black/10 animate-pulse rounded mt-1" />
              ) : statsError ? (
                <p className="text-sm text-destructive mt-1">加载失败</p>
              ) : (
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {categoryCards.map((card) => (
          <Card key={card.key} className={card.color}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {statsLoading ? (
                <span className="h-6 bg-black/10 animate-pulse rounded mt-1 inline-block w-8" />
              ) : statsError ? (
                <p className="text-sm text-destructive mt-1">-</p>
              ) : (
                <p className="text-2xl font-bold mt-1">{stats?.byCategory[card.key] ?? 0}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近工单</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : recentError ? (
            <p className="text-sm text-destructive">加载失败</p>
          ) : recent?.tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无工单</p>
          ) : (
            <div className="space-y-2">
              {recent?.tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.supportEmail ?? "无邮箱"} · {new Date(ticket.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      ticket.status === "OPEN" ? "bg-yellow-100 text-yellow-800" :
                      ticket.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {statusLabels[ticket.status as TicketStatus]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
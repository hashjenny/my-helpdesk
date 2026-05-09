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

function TerminalCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-amber-500/20 bg-[oklch(0.11_0_0)] hover:border-amber-500/40 transition-all duration-300 group">
      <CardContent className="pt-4">
        <p className="text-amber-500/60 font-mono text-xs uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-3xl font-bold font-mono text-amber-400 group-hover:text-amber-300 transition-colors">
          {value}
        </p>
        <div className="mt-2 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
      </CardContent>
    </Card>
  )
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
    { label: "总工单", value: stats?.total ?? 0 },
    { label: "待处理", value: stats?.byStatus.OPEN ?? 0 },
    { label: "已解决", value: stats?.byStatus.RESOLVED ?? 0 },
    { label: "已关闭", value: stats?.byStatus.CLOSED ?? 0 },
  ]

  const categoryCards = [
    { label: "一般咨询", key: "GENERAL" as const },
    { label: "技术问题", key: "TECHNICAL" as const },
    { label: "退款", key: "REFUND" as const },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-mono">
        <span className="text-amber-500">$</span>
        <span className="text-amber-400/80">dashboard</span>
        <span className="text-amber-500/40">--stats</span>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            {statsLoading ? (
              <Card className="border-amber-500/20 bg-[oklch(0.11_0_0)]">
                <CardContent className="pt-4">
                  <p className="text-amber-500/60 font-mono text-xs uppercase tracking-wider mb-1">
                    {card.label}
                  </p>
                  <div className="h-8 bg-amber-500/10 animate-pulse rounded" />
                </CardContent>
              </Card>
            ) : statsError ? (
              <Card className="border-red-500/30 bg-[oklch(0.11_0_0)]">
                <CardContent className="pt-4">
                  <p className="text-red-400 text-sm">加载失败</p>
                </CardContent>
              </Card>
            ) : (
              <TerminalCard label={card.label} value={card.value} />
            )}
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {categoryCards.map((card) => (
          <Card
            key={card.key}
            className="border-amber-500/10 bg-[oklch(0.08_0_0)]"
          >
            <CardContent className="pt-3">
              <p className="text-amber-500/40 font-mono text-xs uppercase tracking-wider">
                {card.label}
              </p>
              {statsLoading ? (
                <div className="h-6 w-8 bg-amber-500/10 animate-pulse rounded mt-1" />
              ) : statsError ? (
                <p className="text-red-400 text-sm">-</p>
              ) : (
                <p className="text-xl font-bold font-mono text-amber-400/70 mt-1">
                  {stats?.byCategory[card.key] ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent tickets */}
      <Card className="border-amber-500/20 bg-[oklch(0.11_0_0)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-500">{'//'}</span>
            <CardTitle className="text-sm font-mono text-amber-400/80 uppercase tracking-wider">
              最近工单
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-amber-500/5 animate-pulse rounded" />
              ))}
            </div>
          ) : recentError ? (
            <p className="text-red-400 font-mono text-sm">加载失败</p>
          ) : recent?.tickets.length === 0 ? (
            <p className="text-amber-500/40 font-mono text-sm italic">暂无工单</p>
          ) : (
            <div className="space-y-1">
              {recent?.tickets.map((ticket, idx) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded border border-transparent hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-amber-500/40 font-mono text-xs">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-400/90 font-mono text-sm truncate group-hover:text-amber-400 transition-colors">
                        {ticket.subject}
                      </p>
                      <p className="text-amber-500/40 font-mono text-xs truncate">
                        {ticket.supportEmail ?? "无邮箱"} · {new Date(ticket.createdAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono border ${
                        ticket.status === "OPEN"
                          ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                          : ticket.status === "RESOLVED"
                          ? "border-green-500/50 text-green-400 bg-green-500/10"
                          : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                      }`}
                    >
                      {statusLabels[ticket.status as TicketStatus]}
                    </span>
                    <span className="text-amber-500/30 group-hover:text-amber-500/60 transition-colors">
                      →
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
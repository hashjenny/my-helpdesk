import type { TicketResponse } from "@helpdesk/shared"
import { Card, CardContent } from "@/components/ui/card"

interface TicketResponsesProps {
  responses: TicketResponse[]
}

export function TicketResponses({ responses }: TicketResponsesProps) {
  if (responses.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No responses yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <Card key={response.id}>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${response.isCustomerReply ? "text-blue-600" : "text-gray-900"}`}>
                    {response.isCustomerReply ? "Customer" : "Agent"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(response.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap">{response.body}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

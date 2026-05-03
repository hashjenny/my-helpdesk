import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components"

interface TicketCreatedEmailProps {
  ticketId: string
  subject: string
  requesterEmail: string
  createdAt: string
  ticketUrl: string
}

export function TicketCreatedEmail({
  ticketId,
  subject,
  requesterEmail,
  createdAt,
  ticketUrl,
}: TicketCreatedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "24px" }}>
            <Text style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
              新工单通知
            </Text>
            <Text style={{ fontSize: "14px", color: "#525f7f" }}>
              有一个新的工单需要处理。
            </Text>
            <Hr style={{ margin: "16px 0" }} />
            <Text style={{ fontSize: "14px", fontWeight: "bold" }}>工单编号</Text>
            <Text style={{ fontSize: "14px", color: "#525f7f", marginBottom: "12px" }}>
              #{ticketId}
            </Text>
            <Text style={{ fontSize: "14px", fontWeight: "bold" }}>主题</Text>
            <Text style={{ fontSize: "14px", color: "#525f7f", marginBottom: "12px" }}>
              {subject}
            </Text>
            <Text style={{ fontSize: "14px", fontWeight: "bold" }}>提交人</Text>
            <Text style={{ fontSize: "14px", color: "#525f7f", marginBottom: "12px" }}>
              {requesterEmail}
            </Text>
            <Text style={{ fontSize: "14px", fontWeight: "bold" }}>创建时间</Text>
            <Text style={{ fontSize: "14px", color: "#525f7f", marginBottom: "20px" }}>
              {createdAt}
            </Text>
            <Link
              href={ticketUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              查看工单
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const subject = (ticketId: string, ticketSubject: string) =>
  `[新工单] #${ticketId} - ${ticketSubject}`
import "dotenv/config"
import { PrismaClient, TicketStatus, TicketCategory } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Clearing existing tickets...")
  await prisma.ticketResponse.deleteMany()
  await prisma.ticket.deleteMany()

  console.log("Seeding tickets...")

  const tickets = [
    {
      subject: "Unable to reset password",
      body: "I've been trying to reset my password for the past hour but the reset email never arrives. I've checked my spam folder. Please help urgently as I need to access my account for a work deadline.",
      status: TicketStatus.OPEN,
      category: TicketCategory.TECHNICAL,
      supportEmail: "john.smith@company.com",
      responses: {
        create: [
          {
            body: "I understand this is urgent. Let me check our email service status. Could you confirm which email address you registered with?",
          },
          {
            body: "We've checked our email logs and the reset email was sent at 10:32 AM. Please try again and also check if your email provider is blocking our domain.",
          },
        ],
      },
    },
    {
      subject: "Request for refund on order #12345",
      body: "I ordered a premium subscription 3 days ago but the service is not working as described. I would like a full refund. The billing page shows I'm still being charged.",
      status: TicketStatus.RESOLVED,
      category: TicketCategory.REFUND,
      supportEmail: "mary.johnson@email.com",
      responses: {
        create: [
          {
            body: "Thank you for contacting us. I've reviewed your account and confirmed the service issue. A full refund of $99 has been processed and will appear in 5-7 business days.",
          },
        ],
      },
    },
    {
      subject: "How to integrate API with React application",
      body: "We're building a new React application and want to integrate your API. Could you provide documentation or examples for authentication and basic API calls?",
      status: TicketStatus.OPEN,
      category: TicketCategory.TECHNICAL,
      supportEmail: "dev.team@startup.io",
      responses: {
        create: [
          {
            body: "Great question! You can find our API documentation at docs.example.com. For React integration, we recommend using our official SDK which handles authentication automatically.",
          },
        ],
      },
    },
    {
      subject: "Billing discrepancy on monthly invoice",
      body: "I noticed my invoice shows charges for 15 users but we only have 10 active users on our team. Please review and adjust accordingly.",
      status: TicketStatus.OPEN,
      category: TicketCategory.GENERAL,
      supportEmail: "finance@acmecorp.com",
      responses: {
        create: [],
      },
    },
    {
      subject: "Feature request: Dark mode support",
      body: "It would be great if the dashboard could support dark mode. Many of us work late hours and the bright interface is straining our eyes.",
      status: TicketStatus.CLOSED,
      category: TicketCategory.GENERAL,
      supportEmail: "lisa.wang@design.co",
      responses: {
        create: [
          {
            body: "Thank you for this suggestion! Dark mode is actually on our Q3 roadmap. We'll notify you when it's released.",
          },
          {
            body: "Dark mode is now available in the latest update! You can enable it in Settings > Appearance.",
          },
        ],
      },
    },
    {
      subject: "Data export not working",
      body: "When I click the Export button to download my data as CSV, the file downloads but it's empty. I've tried on both Chrome and Firefox.",
      status: TicketStatus.OPEN,
      category: TicketCategory.TECHNICAL,
      supportEmail: null,
      responses: {
        create: [
          {
            body: "I was able to reproduce this issue. It appears the export job is failing for accounts with more than 10,000 records. A fix is being deployed now.",
          },
        ],
      },
    },
    {
      subject: "Upgrade plan inquiry",
      body: "We're currently on the Starter plan and considering upgrading to Enterprise. Can you provide more details about the Enterprise features, especially regarding API rate limits and dedicated support?",
      status: TicketStatus.OPEN,
      category: TicketCategory.GENERAL,
      supportEmail: "cto@bigcorp.net",
      responses: {
        create: [],
      },
    },
    {
      subject: "Account hacked, suspicious activity detected",
      body: "I received alerts about login attempts from unknown locations (Russia and Brazil). I think someone has compromised my account. Please secure my account immediately.",
      status: TicketStatus.RESOLVED,
      category: TicketCategory.TECHNICAL,
      supportEmail: "panic@user.com",
      responses: {
        create: [
          {
            body: "I've immediately locked your account for security. Please change your password using the reset link. We've also invalidated all active sessions.",
          },
          {
            body: "Your account has been secured. The unauthorized access attempts have been blocked. We recommend enabling two-factor authentication for added security.",
          },
        ],
      },
    },
    {
      subject: "Partial refund request for defective product",
      body: "I purchased the Professional bundle last week but one of the software tools included doesn't work on macOS. I'd like a 30% partial refund since the other tools work fine.",
      status: TicketStatus.OPEN,
      category: TicketCategory.REFUND,
      supportEmail: "alex.chen@macuser.org",
      responses: {
        create: [],
      },
    },
    {
      subject: "Cannot upload profile photo",
      body: "Every time I try to upload a profile photo, I get an error message saying 'File type not supported'. I've tried JPG, PNG, and even GIF formats.",
      status: TicketStatus.CLOSED,
      category: TicketCategory.TECHNICAL,
      supportEmail: null,
      responses: {
        create: [
          {
            body: "This was a known bug that was fixed in yesterday's release. Please clear your browser cache and try again.",
          },
        ],
      },
    },
  ]

  for (const ticket of tickets) {
    await prisma.ticket.create({ data: ticket })
  }

  console.log(`Seeded ${tickets.length} tickets`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
import { PrismaClient } from '@prisma/client'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:toor@localhost:5432/helpdesk_test'

async function cleanup() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  })

  try {
    // Clean up test data by deleting records (keep database intact)
    await prisma.ticketResponse.deleteMany()
    await prisma.ticket.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()

    console.log('Test data cleaned up, database preserved')
  } catch (error) {
    console.error('Error cleaning up test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanup()
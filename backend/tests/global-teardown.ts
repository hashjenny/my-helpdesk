import { PrismaClient } from '@prisma/client'

const DATABASE_URL = 'postgresql://postgres:toor@localhost:5432/helpdesk_test'

async function globalTeardown() {
  // Clean up test database
  const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
  })

  try {
    // Delete all data from test database but keep schema
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `

    for (const { tablename } of tables) {
      if (tablename !== '_prisma_migrations') {
        await prisma.$executeRawUnsafe(`DELETE FROM "${tablename}"`)
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

export default globalTeardown

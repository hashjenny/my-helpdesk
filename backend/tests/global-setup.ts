import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

const DATABASE_URL = 'postgresql://postgres:toor@localhost:5432/helpdesk_test'

async function globalSetup() {
  // Create test database if it doesn't exist
  try {
    execSync(`createdb helpdesk_test 2>/dev/null || true`, { stdio: 'ignore' })
  } catch {
    // Database might already exist, ignore error
  }

  // Run migrations on test database
  const tempPrisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
  })

  try {
    // Push schema to test database
    execSync('bunx prisma db push --skip-generate --accept-data-loss', {
      env: {
        ...process.env,
        DATABASE_URL,
      },
      stdio: 'inherit',
    })
  } finally {
    await tempPrisma.$disconnect()
  }
}

export default globalSetup

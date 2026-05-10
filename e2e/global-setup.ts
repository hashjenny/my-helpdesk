import { execSync } from 'child_process'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:toor@localhost:5432/helpdesk_test'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'testpass123'

async function globalSetup() {
  // Create test database if it doesn't exist using psql with password
  const psqlPath = '/Library/PostgreSQL/18/bin/psql'
  execSync(
    `PGPASSWORD=toor ${psqlPath} -U postgres -h localhost -tc "SELECT 1 FROM pg_database WHERE datname = 'helpdesk_test'" | grep -q 1 || PGPASSWORD=toor ${psqlPath} -U postgres -h localhost -c "CREATE DATABASE helpdesk_test"`,
    { stdio: 'pipe' }
  )

  // Reset schema to test database
  execSync('./backend/node_modules/.bin/prisma db push --schema backend/prisma/schema.prisma --skip-generate --accept-data-loss --force-reset', {
    env: {
      ...process.env,
      DATABASE_URL,
    },
    stdio: 'inherit',
  })

  // Seed admin user - explicitly pass all required env vars without loading .env files
  execSync('./backend/node_modules/.bin/tsx backend/prisma/seed.ts', {
    env: {
      ...process.env,
      DATABASE_URL,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    },
    stdio: 'inherit',
  })

  // Seed tickets for E2E tests
  execSync('./backend/node_modules/.bin/tsx backend/prisma/seed-tickets.ts', {
    env: {
      ...process.env,
      DATABASE_URL,
    },
    stdio: 'inherit',
  })

  console.log('Test database setup completed')
}

export default globalSetup

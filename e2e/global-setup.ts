import { execSync } from 'child_process'

const DATABASE_URL = 'postgresql://postgres:toor@localhost:5432/helpdesk_test'

async function globalSetup() {
  // Create test database if it doesn't exist using psql with password
  execSync(
    'PGPASSWORD=toor psql -U postgres -h localhost -tc "SELECT 1 FROM pg_database WHERE datname = \'helpdesk_test\'" | grep -q 1 || PGPASSWORD=toor psql -U postgres -h localhost -c "CREATE DATABASE helpdesk_test"',
    { stdio: 'pipe' }
  )

  // Push schema to test database using Prisma
  execSync('./backend/node_modules/.bin/prisma db push --schema backend/prisma/schema.prisma --skip-generate --accept-data-loss --force-reset', {
    env: {
      ...process.env,
      DATABASE_URL,
    },
    stdio: 'inherit',
  })

  // Seed admin user using tsx
  execSync('./backend/node_modules/.bin/tsx backend/prisma/seed.ts', {
    env: {
      ...process.env,
      DATABASE_URL,
      ADMIN_EMAIL: 'admin@test.com',
      ADMIN_PASSWORD: 'testpass123',
    },
    stdio: 'inherit',
  })

  console.log('Test database setup completed')
}

export default globalSetup
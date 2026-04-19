import { execSync } from 'child_process'

const DATABASE_URL = 'postgresql://postgres:toor@localhost:5432/helpdesk_test'

async function globalTeardown() {
  // Clean up test data using Prisma script (keep database intact)
  // Use npx to run tsx from backend directory
  execSync('npx tsx backend/e2e-cleanup.ts', {
    cwd: '/Users/johnwick/Lecture/mosh-claude-code/my-helpdesk',
    env: {
      ...process.env,
      DATABASE_URL,
    },
    stdio: 'inherit',
  })
}

export default globalTeardown
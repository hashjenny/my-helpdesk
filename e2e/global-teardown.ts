import { execSync } from 'child_process'

const DATABASE_URL = 'postgresql://postgres:toor@localhost:5432/helpdesk_test'

async function globalTeardown() {
  // Clean up test data using Prisma script (keep database intact)
  // Use direct path to tsx from backend node_modules
  try {
    execSync('./backend/node_modules/.bin/tsx backend/e2e-cleanup.ts', {
      cwd: '/Users/johnwick/Code/my-helpdesk',
      env: {
        ...process.env,
        DATABASE_URL,
      },
      stdio: 'inherit',
    })
  } catch (error) {
    console.log('Cleanup script failed, continuing...')
  }
}

export default globalTeardown
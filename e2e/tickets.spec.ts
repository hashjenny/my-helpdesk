import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/auth.page'
import { TicketDetailPage } from './pages/ticket-detail.page'

const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'testpass123',
}

test.describe('Ticket Management - Core Tests', () => {
  let authPage: AuthPage
  let ticketDetailPage: TicketDetailPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
    ticketDetailPage = new TicketDetailPage(page)
  })

  // ==========================================================================
  // CORE: Login
  // ==========================================================================

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_ADMIN.email)
    await page.fill('input[name="password"]', TEST_ADMIN.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    // Login redirects to /tickets, /users, or / - not /login
    const url = page.url()
    expect(url).not.toContain('/login')
  })

  // ==========================================================================
  // CORE: Agent Response Flow
  // ==========================================================================

  test('should allow agent to add a response to a ticket', async ({ page }) => {
    // Login as admin
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)

    // Navigate to tickets list
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Click on first ticket's View link (the first link with href starting with /tickets/)
    const ticketLink = page.locator('a[href^="/tickets/"]').filter({ hasText: 'View' }).first()
    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Verify we're on ticket detail page by checking for Add Response form
    await page.waitForSelector('textarea[name="body"]', { timeout: 5000 })

    // Fill the response textarea
    const responseText = 'This is a test response from agent'
    await ticketDetailPage.replyTextarea.fill(responseText)

    // Submit the form
    await ticketDetailPage.sendResponseButton.click()
    await page.waitForLoadState('networkidle')

    // Verify the response appears on the page
    await expect(page.locator(`text=${responseText}`)).toBeVisible({ timeout: 5000 })
  })
})

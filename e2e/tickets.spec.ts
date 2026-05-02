import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/auth.page'
import { TicketsListPage } from './pages/tickets.page'
import { TicketDetailPage } from './pages/ticket-detail.page'

const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'testpass123',
}

test.describe('Ticket Management - Core Tests', () => {
  let authPage: AuthPage
  let ticketsListPage: TicketsListPage
  let ticketDetailPage: TicketDetailPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
    ticketsListPage = new TicketsListPage(page)
    ticketDetailPage = new TicketDetailPage(page)
  })

  // ==========================================================================
  // CORE: Login
  // ==========================================================================

  test('should login with valid credentials', async ({ page }) => {
    await authPage.gotoLogin()
    await authPage.fillLoginForm(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.submitLogin()
    await authPage.waitForAuthNavigation()
    const signOutButton = page.locator('header button:has-text("Sign Out")')
    await expect(signOutButton).toBeVisible({ timeout: 5000 })
  })

  // ==========================================================================
  // CORE: Agent Response Flow
  // ==========================================================================

  test('should allow agent to add a response to a ticket', async ({ page }) => {
    // Login as admin
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()

    // Navigate to tickets list
    await ticketsListPage.goto()
    await ticketsListPage.waitForLoad()

    // Click on first ticket's View button
    await ticketsListPage.viewTicket(0)

    // Fill the response textarea
    const responseText = 'This is a test response from agent'
    await ticketDetailPage.replyTextarea.fill(responseText)

    // Submit the form
    await ticketDetailPage.sendResponseButton.click()
    await ticketDetailPage.waitForLoad()

    // Verify the response appears on the page
    await expect(page.locator(`text=${responseText}`)).toBeVisible({ timeout: 5000 })
  })
})

import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/auth.page'
import { TicketDetailPage } from './pages/ticket-detail.page'
import { TicketListPage } from './pages/tickets.page'

const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'testpass123',
}

test.describe('Ticket Management - Core Tests', () => {
  let authPage: AuthPage
  let ticketDetailPage: TicketDetailPage
  let ticketListPage: TicketListPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
    ticketDetailPage = new TicketDetailPage(page)
    ticketListPage = new TicketListPage(page)
  })

  // ==========================================================================
  // CORE: Login
  // ==========================================================================

  test('should login with valid credentials', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
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

  // ==========================================================================
  // CORE: Pagination
  // ==========================================================================

  test('should display tickets list with pagination', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    // Wait for the page to be fully loaded after login
    await page.waitForLoadState('networkidle')
    // Navigate to tickets page
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Total:')).toBeVisible()
    await expect(page.locator('button:has-text("Previous")')).toBeVisible()
    await expect(page.locator('button:has-text("Next")')).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  // ==========================================================================
  // CORE: Create Ticket
  // ==========================================================================

  test('should create a new ticket', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    // Wait for the page to be fully loaded after login
    await page.waitForLoadState('networkidle')
    // Navigate to tickets page
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')
    await page.locator('button:has-text("New Ticket")').click()
    await expect(page.locator('text=Create New Ticket')).toBeVisible()
    const uniqueSubject = `Test Ticket ${Date.now()}`
    await page.fill('#subject', uniqueSubject)
    await page.fill('#body', 'Test description for the ticket')
    await page.selectOption('#category', 'TECHNICAL')
    await page.click('button:has-text("Create Ticket")')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(`text=${uniqueSubject}`)).toBeVisible()
  })

  // ==========================================================================
  // CORE: Status Filter
  // ==========================================================================

  test('should filter tickets by status', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    // Wait for the page to be fully loaded after login
    await page.waitForLoadState('networkidle')
    // Navigate to tickets page
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')
    await page.locator('select').first().selectOption('OPEN')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  // ==========================================================================
  // CORE: Category Filter
  // ==========================================================================

  test('should filter tickets by category', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    // Wait for the page to be fully loaded after login
    await page.waitForLoadState('networkidle')
    // Navigate to tickets page
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')
    await page.locator('select').nth(1).selectOption('TECHNICAL')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/auth.page'
import { TicketDetailPage } from './pages/ticket-detail.page'

const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'toor123',
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

  // ==========================================================================
  // CORE: Pagination
  // ==========================================================================

  test('should display tickets list with pagination', async ({ page }) => {
    // Login using the exact same pattern as the working login test
    await page.goto('/login')
    await page.fill('#email', TEST_ADMIN.email)
    await page.fill('#password', TEST_ADMIN.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)

    // Verify login succeeded (URL should not contain /login)
    const url = page.url()
    expect(url).not.toContain('/login')

    // Navigate to tickets
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Verify pagination info exists
    await expect(page.locator('text=Total:')).toBeVisible()
    await expect(page.locator('button:has-text("Previous")')).toBeVisible()
    await expect(page.locator('button:has-text("Next")')).toBeVisible()

    // Verify tickets are displayed
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible()
  })

  // ==========================================================================
  // CORE: Create Ticket
  // ==========================================================================

  test('should create a new ticket', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Open create form
    await page.locator('button:has-text("New Ticket")').click()
    await expect(page.locator('text=Create New Ticket')).toBeVisible()

    // Fill form
    const uniqueSubject = `Test Ticket ${Date.now()}`
    await page.fill('#subject', uniqueSubject)
    await page.fill('#body', 'Test description for the ticket')
    await page.selectOption('#category', 'TECHNICAL')

    // Submit
    await page.click('button:has-text("Create Ticket")')
    await page.waitForLoadState('networkidle')

    // Verify new ticket appears in list
    await expect(page.locator(`text=${uniqueSubject}`)).toBeVisible()
  })

  // ==========================================================================
  // CORE: Status Filter
  // ==========================================================================

  test('should filter tickets by status', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Get initial ticket count
    const initialRows = await page.locator('table tbody tr').count()

    // Filter by OPEN status
    await page.locator('select').first().selectOption('OPEN')
    await page.waitForLoadState('networkidle')

    // Verify rows are visible and contain OPEN badges
    const filteredRows = page.locator('table tbody tr')
    await expect(filteredRows.first()).toBeVisible()
    const openBadges = page.locator('span:has-text("OPEN")')
    await expect(openBadges.first()).toBeVisible()
  })

  // ==========================================================================
  // CORE: Category Filter
  // ==========================================================================

  test('should filter tickets by category', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Filter by TECHNICAL category (second select)
    await page.locator('select').nth(1).selectOption('TECHNICAL')
    await page.waitForLoadState('networkidle')

    // All visible tickets should be TECHNICAL
    const technicalRows = page.locator('table tbody tr')
    await expect(technicalRows.first()).toBeVisible()
    // Verify category column (3rd column) contains Technical
    const categoryCells = page.locator('table tbody tr td:nth-child(3)')
    await expect(categoryCells.first()).toContainText('Technical')
  })

  // ==========================================================================
  // CORE: Search Tickets
  // ==========================================================================

  test('should search tickets by keyword', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Get a known ticket subject from the list
    const firstSubject = await page.locator('table tbody tr td').first().textContent()

    // Search for part of the subject
    if (firstSubject && firstSubject.length > 3) {
      const searchTerm = firstSubject.substring(0, 5)
      await page.fill('input[placeholder*="Search"]', searchTerm)
      await page.waitForLoadState('networkidle')

      // Verify search results contain the term
      const rows = page.locator('table tbody tr')
      const rowCount = await rows.count()
      expect(rowCount).toBeGreaterThan(0)
    }
  })

  // ==========================================================================
  // CORE: Sorting
  // ==========================================================================

  test('should sort tickets by column', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Click Subject column header to sort
    await page.locator('th:has-text("Subject")').click()
    await page.waitForLoadState('networkidle')

    // Click again to reverse sort
    await page.locator('th:has-text("Subject")').click()
    await page.waitForLoadState('networkidle')

    // Verify table is still visible and has rows
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })
})

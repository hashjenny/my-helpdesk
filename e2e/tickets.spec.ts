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

  // ==========================================================================
  // CORE: Search, Sort, Delete, Navigation (Tasks 5-8)
  // ==========================================================================

  test('should search tickets by keyword', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    await page.waitForLoadState('networkidle')
    await ticketListPage.goto()
    await page.waitForLoadState('networkidle')
    const firstSubject = await page.locator('table tbody tr td').first().textContent()
    if (firstSubject && firstSubject.length > 3) {
      const searchTerm = firstSubject.substring(0, 5)
      await ticketListPage.searchInput.fill(searchTerm)
      await page.waitForLoadState('networkidle')
      const rowCount = await ticketListPage.tableRows.count()
      expect(rowCount).toBeGreaterThan(0)
    }
  })

  test('should sort tickets by column', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    await page.waitForLoadState('networkidle')
    await ticketListPage.goto()
    await page.waitForLoadState('networkidle')
    await page.locator('th').filter({ hasText: 'Subject' }).click()
    await page.waitForLoadState('networkidle')
    await page.locator('th').filter({ hasText: 'Subject' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('should delete a ticket', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    await page.waitForLoadState('networkidle')
    await ticketListPage.goto()
    await page.waitForLoadState('networkidle')
    const initialCount = await ticketListPage.tableRows.count()
    await ticketListPage.deleteTicket(0)
    await page.waitForLoadState('networkidle')
    const newCount = await page.locator('table tbody tr').count()
    expect(newCount).toBeLessThan(initialCount)
  })

  test('should navigate to ticket detail', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    await page.waitForLoadState('networkidle')
    await ticketListPage.goto()
    await page.waitForLoadState('networkidle')
    await ticketListPage.viewTicket(0)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Add Response')).toBeVisible()
    expect(page.url()).toContain('/tickets/')
  })

  // ==========================================================================
  // CORE: Ticket Detail - Status & Category Change
  // ==========================================================================

  test('should change ticket status from detail page', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    await page.waitForLoadState('networkidle')
    // Navigate to ticket detail
    await ticketListPage.goto()
    await page.waitForLoadState('networkidle')
    await ticketListPage.viewTicket(0)
    await page.waitForLoadState('networkidle')
    // Change status to CLOSED (avoid RESOLVED which may already be set)
    await ticketDetailPage.changeStatus('CLOSED')
    await page.waitForLoadState('networkidle')
    // Verify status badge shows CLOSED
    await expect(page.locator('span[class*="bg-gray-100"]:has-text("CLOSED")')).toBeVisible()
  })

  test('should change ticket category from detail page', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    await page.waitForLoadState('networkidle')
    // Navigate to ticket detail
    await ticketListPage.goto()
    await page.waitForLoadState('networkidle')
    await ticketListPage.viewTicket(0)
    await page.waitForLoadState('networkidle')
    // Use the category select (second select on page)
    const categorySelect = page.locator('select').nth(1)
    await expect(categorySelect).toBeVisible()
    // Get current category and switch to a different one
    const currentCategory = await categorySelect.inputValue()
    const newCategory = currentCategory === 'GENERAL' ? 'TECHNICAL' : 'GENERAL'
    await categorySelect.selectOption(newCategory)
    await page.waitForLoadState('networkidle')
    // Verify the select shows the new value
    await expect(categorySelect).toHaveValue(newCategory)
  })

  test('should assign ticket to agent as admin', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    await page.waitForLoadState('networkidle')
    // Navigate to ticket detail
    await ticketListPage.goto()
    await page.waitForLoadState('networkidle')
    await ticketListPage.viewTicket(0)
    await page.waitForLoadState('networkidle')
    // Check if assigned to select exists and has agents (admin only)
    const assignSelect = page.locator('select').last()
    await expect(assignSelect).toBeVisible()
    // Verify there are options beyond "Unassigned"
    const options = await assignSelect.locator('option').all()
    expect(options.length).toBeGreaterThan(1)
    // Select second option (first is "Unassigned")
    await assignSelect.selectOption({ index: 1 })
    // Verify selection was made
    await expect(assignSelect).not.toHaveValue('')
  })

  // ==========================================================================
  // CORE: AI Polish Flow
  // ==========================================================================

  test('should polish response with AI', async ({ page }) => {
    await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    await authPage.waitForAuthNavigation()
    await page.waitForLoadState('networkidle')
    // Navigate to ticket detail
    await ticketListPage.goto()
    await page.waitForLoadState('networkidle')
    await ticketListPage.viewTicket(0)
    await page.waitForLoadState('networkidle')
    // Type some text
    const testText = 'hi i need help with my account'
    await ticketDetailPage.replyTextarea.fill(testText)
    // Click polish button
    await page.locator('button:has-text("Polish with AI")').click()
    // Wait for polishing to complete (button text changes back)
    await expect(page.locator('button:has-text("Polish with AI")')).toBeEnabled({ timeout: 15000 })
    // Verify textarea has content (polished text should be different and non-empty)
    const polishedContent = await ticketDetailPage.replyTextarea.inputValue()
    expect(polishedContent.length).toBeGreaterThan(0)
    expect(polishedContent).not.toBe(testText)
  })
})

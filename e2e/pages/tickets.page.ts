import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Page Object for Ticket List page (/tickets)
 */
export class TicketListPage {
  readonly page: Page

  // Page heading
  readonly pageHeading: Locator

  // Toggle create form button
  readonly newTicketButton: Locator
  readonly cancelButton: Locator

  // Create form elements
  readonly createFormCard: Locator
  readonly subjectInput: Locator
  readonly bodyInput: Locator
  readonly categorySelect: Locator
  readonly createSubmitButton: Locator

  // Filters
  readonly searchInput: Locator
  readonly statusFilterSelect: Locator
  readonly categoryFilterSelect: Locator

  // Table
  readonly ticketTable: Locator
  readonly tableRows: Locator
  readonly noTicketsMessage: Locator

  // Pagination
  readonly paginationInfo: Locator
  readonly previousButton: Locator
  readonly nextButton: Locator

  // Error/Success alerts
  readonly errorAlert: Locator

  constructor(page: Page) {
    this.page = page

    // Page heading
    this.pageHeading = page.locator('h1:has-text("Tickets")')

    // Toggle buttons
    this.newTicketButton = page.locator('button:has-text("New Ticket")')
    this.cancelButton = page.locator('button:has-text("Cancel")')

    // Create form
    this.createFormCard = page.locator('text=Create New Ticket')
    this.subjectInput = page.locator('#subject')
    this.bodyInput = page.locator('#body')
    this.categorySelect = page.locator('#category')
    this.createSubmitButton = page.locator('button:has-text("Create Ticket")')

    // Filters
    this.searchInput = page.locator('input[placeholder*="Search"]')
    this.statusFilterSelect = page.locator('select').first()
    this.categoryFilterSelect = page.locator('select').nth(1)

    // Table
    this.ticketTable = page.locator('table')
    this.tableRows = page.locator('table tbody tr')
    this.noTicketsMessage = page.locator('text=No tickets found')

    // Pagination
    this.paginationInfo = page.locator('text=Total:')
    this.previousButton = page.locator('button:has-text("Previous")')
    this.nextButton = page.locator('button:has-text("Next")')

    // Alerts
    this.errorAlert = page.locator('[role="alert"]')
  }

  /**
   * Navigate to tickets page
   */
  async goto(): Promise<void> {
    await this.page.goto('/tickets')
  }

  /**
   * Open create form by clicking New Ticket button
   */
  async openCreateForm(): Promise<void> {
    await this.newTicketButton.click()
  }

  /**
   * Close create form by clicking Cancel button
   */
  async closeCreateForm(): Promise<void> {
    await this.cancelButton.click()
  }

  /**
   * Fill create ticket form
   */
  async fillCreateForm(subject: string, body: string, category: string = 'GENERAL'): Promise<void> {
    await this.subjectInput.fill(subject)
    await this.bodyInput.fill(body)
    await this.categorySelect.selectOption(category)
  }

  /**
   * Submit create form
   */
  async submitCreateForm(): Promise<void> {
    await this.createSubmitButton.click()
  }

  /**
   * Create a new ticket
   */
  async createTicket(subject: string, body: string, category: string = 'GENERAL'): Promise<void> {
    await this.openCreateForm()
    await this.fillCreateForm(subject, body, category)
    await this.submitCreateForm()
  }

  /**
   * Get ticket row data by index
   */
  async getTicketRow(index: number): Promise<{ subject: string; status: string; category: string }> {
    const row = this.tableRows.nth(index)
    const cells = row.locator('td')
    return {
      subject: await cells.nth(0).textContent() ?? '',
      status: await cells.nth(1).textContent() ?? '',
      category: await cells.nth(2).textContent() ?? '',
    }
  }

  /**
   * Click view button for a ticket by row index
   */
  async viewTicket(rowIndex: number = 0): Promise<void> {
    const viewButton = this.page.locator('button:has-text("View")').nth(rowIndex)
    await viewButton.click()
  }

  /**
   * Click delete button for a ticket by row index (handles confirmation)
   */
  async deleteTicket(rowIndex: number = 0): Promise<void> {
    this.page.on('dialog', dialog => dialog.accept())
    const deleteButton = this.page.locator('button:has-text("Delete")').nth(rowIndex)
    await deleteButton.click()
  }

  /**
   * Wait for table to load after action
   */
  async waitForTableUpdate(): Promise<void> {
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/tickets') && resp.status() === 200,
      { timeout: 10000 }
    )
  }

  /**
   * Wait for create response
   */
  async waitForCreateResponse(): Promise<void> {
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/tickets') && resp.status() === 201,
      { timeout: 10000 }
    ).catch(() => {})
  }

  /**
   * Filter tickets by status
   */
  async filterByStatus(status: string): Promise<void> {
    await this.statusFilterSelect.selectOption(status)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Filter tickets by category
   */
  async filterByCategory(category: string): Promise<void> {
    await this.categoryFilterSelect.selectOption(category)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Search tickets by keyword
   */
  async searchByKeyword(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if error alert is visible
   */
  async expectErrorAlert(): Promise<void> {
    await expect(this.errorAlert).toBeVisible({ timeout: 5000 })
  }
}

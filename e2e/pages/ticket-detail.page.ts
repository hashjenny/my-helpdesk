import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Page Object for Ticket Detail page (/tickets/:id)
 */
export class TicketDetailPage {
  readonly page: Page

  // Navigation
  readonly backLink: Locator

  // Ticket details
  readonly ticketHeading: Locator
  readonly ticketBody: Locator
  readonly statusBadge: Locator
  readonly categoryLabel: Locator
  readonly emailBadge: Locator
  readonly createdAt: Locator

  // Status and category selects
  readonly statusSelect: Locator
  readonly categorySelect: Locator

  // Responses section
  readonly responsesHeading: Locator
  readonly responsesList: Locator
  readonly noResponsesMessage: Locator

  // Reply form
  readonly replyForm: Locator
  readonly replyTextarea: Locator
  readonly sendResponseButton: Locator

  // Error/Success alerts
  readonly errorAlert: Locator

  constructor(page: Page) {
    this.page = page

    // Navigation
    this.backLink = page.locator('a:has-text("Back to tickets")')

    // Ticket details
    this.ticketHeading = page.locator('[class*="card"] h1')
    this.ticketBody = page.locator('.p-6 p, [class*="card"] p').first()
    this.statusBadge = page.locator('span[class*="bg-yellow-100"], span[class*="bg-green-100"], span[class*="bg-gray-100"]')
    this.categoryLabel = page.locator('span.text-muted-foreground').first()
    this.emailBadge = page.locator('span:has-text("📧")')
    this.createdAt = page.locator('span.text-muted-foreground').last()

    // Status and category selects
    this.statusSelect = page.locator('select').first()
    this.categorySelect = page.locator('select').nth(1)

    // Responses section
    this.responsesHeading = page.locator('text=Responses')
    this.responsesList = page.locator('[class*="space-y-4"]')
    this.noResponsesMessage = page.locator('text=No responses yet')

    // Reply form
    this.replyForm = page.locator('text=Add Response')
    this.replyTextarea = page.locator('#reply')
    this.sendResponseButton = page.locator('button:has-text("Send Response")')

    // Alerts
    this.errorAlert = page.locator('[role="alert"]')
  }

  /**
   * Navigate to ticket detail page
   */
  async goto(id: string): Promise<void> {
    await this.page.goto(`/tickets/${id}`)
  }

  /**
   * Go back to tickets list
   */
  async goBackToList(): Promise<void> {
    await this.backLink.click()
  }

  /**
   * Change ticket status
   */
  async changeStatus(status: string): Promise<void> {
    await this.statusSelect.selectOption(status)
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/tickets') && [200, 204].includes(resp.status()),
      { timeout: 10000 }
    ).catch(() => {})
  }

  /**
   * Change ticket category
   */
  async changeCategory(category: string): Promise<void> {
    await this.categorySelect.selectOption(category)
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/tickets') && [200, 204].includes(resp.status()),
      { timeout: 10000 }
    ).catch(() => {})
  }

  /**
   * Add a response to the ticket
   */
  async addResponse(body: string): Promise<void> {
    await this.replyTextarea.fill(body)
    await this.sendResponseButton.click()
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/tickets') && resp.status() === 201,
      { timeout: 10000 }
    ).catch(() => {})
  }

  /**
   * Check if email badge is visible
   */
  async hasEmailBadge(): Promise<boolean> {
    return this.emailBadge.isVisible().catch(() => false)
  }

  /**
   * Get ticket subject text
   */
  async getTicketSubject(): Promise<string> {
    return this.ticketHeading.textContent() ?? ''
  }

  /**
   * Get ticket status
   */
  async getTicketStatus(): Promise<string> {
    return this.statusBadge.textContent() ?? ''
  }

  /**
   * Check if responses section is visible
   */
  async isResponsesSectionVisible(): Promise<boolean> {
    return this.responsesHeading.isVisible().catch(() => false)
  }

  /**
   * Check if reply form is visible
   */
  async isReplyFormVisible(): Promise<boolean> {
    return this.replyForm.isVisible().catch(() => false)
  }

  /**
   * Wait for page to load
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if error alert is visible
   */
  async expectErrorAlert(): Promise<void> {
    await expect(this.errorAlert).toBeVisible({ timeout: 5000 })
  }
}

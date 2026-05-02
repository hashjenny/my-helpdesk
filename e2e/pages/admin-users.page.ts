import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Page Object for User Management page (/admin/users)
 */
export class AdminUsersPage {
  readonly page: Page

  // Page elements
  readonly pageHeading: Locator
  readonly addAgentButton: Locator

  // Create form
  readonly createFormCard: Locator
  readonly createNameInput: Locator
  readonly createEmailInput: Locator
  readonly createPasswordInput: Locator
  readonly createRoleSelect: Locator
  readonly createSubmitButton: Locator
  readonly createCancelButton: Locator

  // Edit modal
  readonly editModal: Locator
  readonly editNameInput: Locator
  readonly editRoleSelect: Locator
  readonly editPasswordInput: Locator
  readonly editSaveButton: Locator
  readonly editCancelButton: Locator

  // Table
  readonly userTable: Locator
  readonly tableRows: Locator
  readonly noUsersMessage: Locator

  // Filters
  readonly searchInput: Locator
  readonly roleFilterSelect: Locator

  // Pagination
  readonly paginationInfo: Locator
  readonly previousButton: Locator
  readonly nextButton: Locator
  readonly limitSelect: Locator

  // Error/Success alerts
  readonly errorAlert: Locator

  constructor(page: Page) {
    this.page = page

    // Page heading
    this.pageHeading = page.locator('h1:has-text("User Management")')

    // Add agent button (toggles form visibility)
    this.addAgentButton = page.locator('button:has-text("Add Agent"), button:has-text("Cancel")')

    // Create form (inside a Card)
    this.createFormCard = page.locator('text=Add New Agent')
    this.createNameInput = page.locator('#form-name')
    this.createEmailInput = page.locator('#form-email')
    this.createPasswordInput = page.locator('#form-password')
    this.createRoleSelect = page.locator('#form-role')
    this.createSubmitButton = page.locator('button[type="submit"]:has-text("Create")')
    this.createCancelButton = page.locator('button:has-text("Cancel")')

    // Edit modal (overlay)
    this.editModal = page.locator('text=Edit User')
    this.editNameInput = page.locator('#edit-name')
    this.editRoleSelect = page.locator('#edit-role')
    this.editPasswordInput = page.locator('#edit-password')
    this.editSaveButton = page.locator('button[type="submit"]:has-text("Save")')
    this.editCancelButton = page.locator('button:has-text("Cancel")')

    // Table
    this.userTable = page.locator('table')
    this.tableRows = page.locator('table tbody tr')
    this.noUsersMessage = page.locator('text=No users found')

    // Filters
    this.searchInput = page.locator('input[placeholder*="Search"]')
    this.roleFilterSelect = page.locator('select').first()

    // Pagination
    this.paginationInfo = page.locator('text=Total:')
    this.previousButton = page.locator('button:has-text("Previous")')
    this.nextButton = page.locator('button:has-text("Next")')
    this.limitSelect = page.locator('select').nth(1)

    // Alerts
    this.errorAlert = page.locator('[role="alert"]')
  }

  /**
   * Navigate to admin users page
   */
  async goto(): Promise<void> {
    await this.page.goto('/users')
  }

  /**
   * Open create form by clicking Add Agent button
   */
  async openCreateForm(): Promise<void> {
    await this.addAgentButton.click()
  }

  /**
   * Fill create user form
   */
  async fillCreateForm(name: string, email: string, password: string, role: string = 'AGENT'): Promise<void> {
    await this.createNameInput.fill(name)
    await this.createEmailInput.fill(email)
    await this.createPasswordInput.fill(password)
    await this.createRoleSelect.selectOption(role)
  }

  /**
   * Submit create form
   */
  async submitCreateForm(): Promise<void> {
    await this.createSubmitButton.click()
  }

  /**
   * Create a new agent user
   */
  async createAgent(name: string, email: string, password: string): Promise<void> {
    await this.openCreateForm()
    await this.fillCreateForm(name, email, password, 'AGENT')
    await this.submitCreateForm()
  }

  /**
   * Open edit modal for a user (by row index, 0-based)
   */
  async openEditModal(rowIndex: number = 0): Promise<void> {
    const editButtons = this.page.locator('button:has-text("Edit")')
    await editButtons.nth(rowIndex).click()
    await expect(this.editModal).toBeVisible()
  }

  /**
   * Edit user name
   */
  async editName(name: string): Promise<void> {
    await this.editNameInput.fill(name)
  }

  /**
   * Edit user role
   */
  async editRole(role: string): Promise<void> {
    await this.editRoleSelect.selectOption(role)
  }

  /**
   * Edit user password (optional)
   */
  async editPassword(password: string): Promise<void> {
    await this.editPasswordInput.fill(password)
  }

  /**
   * Submit edit form
   */
  async submitEdit(): Promise<void> {
    await this.editSaveButton.click()
  }

  /**
   * Close edit modal
   */
  async closeEditModal(): Promise<void> {
    await this.editCancelButton.click()
  }

  /**
   * Delete user (by row index, 0-based)
   */
  async deleteUser(rowIndex: number = 0): Promise<void> {
    // Handle confirmation dialog
    this.page.on('dialog', dialog => dialog.accept())
    const deleteButtons = this.page.locator('button:has-text("Delete")')
    await deleteButtons.nth(rowIndex).click()
  }

  /**
   * Get user row data by index
   */
  async getUserRow(index: number): Promise<{ name: string; email: string; role: string }> {
    const row = this.tableRows.nth(index)
    const cells = row.locator('td')
    return {
      name: await cells.nth(0).textContent() ?? '',
      email: await cells.nth(1).textContent() ?? '',
      role: await cells.nth(2).textContent() ?? '',
    }
  }

  /**
   * Wait for table to load after action
   */
  async waitForTableUpdate(): Promise<void> {
    // Wait for loading to finish (no skeleton rows)
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/users') && resp.status() === 200,
      { timeout: 10000 }
    )
  }

  /**
   * Check if error alert is visible
   */
  async expectErrorAlert(): Promise<void> {
    await expect(this.errorAlert).toBeVisible({ timeout: 5000 })
  }

  /**
   * Wait for dialog and accept/dismiss
   */
  handleDeleteDialog(accept: boolean = true): void {
    this.page.on('dialog', dialog => {
      accept ? dialog.accept() : dialog.dismiss()
    })
  }
}
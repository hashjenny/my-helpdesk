import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Page Object for authentication pages (Login and Register)
 */
export class AuthPage {
  readonly page: Page

  // Login form locators
  readonly loginEmailInput: Locator
  readonly loginPasswordInput: Locator
  readonly loginSubmitButton: Locator
  readonly loginForm: Locator
  readonly loginLinkToRegister: Locator

  // Register form locators
  readonly registerNameInput: Locator
  readonly registerEmailInput: Locator
  readonly registerPasswordInput: Locator
  readonly registerConfirmPasswordInput: Locator
  readonly registerSubmitButton: Locator
  readonly registerForm: Locator
  readonly registerLinkToLogin: Locator

  // Common locators
  readonly errorAlert: Locator
  readonly pageHeading: Locator

  constructor(page: Page) {
    this.page = page

    // Login form
    this.loginEmailInput = page.locator('#email')
    this.loginPasswordInput = page.locator('#password')
    this.loginSubmitButton = page.locator('button[type="submit"]')
    this.loginForm = page.locator('form')
    this.loginLinkToRegister = page.locator('a[href="/register"]')

    // Register form
    this.registerNameInput = page.locator('#name')
    this.registerEmailInput = page.locator('#email')
    this.registerPasswordInput = page.locator('#password')
    this.registerConfirmPasswordInput = page.locator('#confirmPassword')
    this.registerSubmitButton = page.locator('button[type="submit"]')
    this.registerForm = page.locator('form')
    this.registerLinkToLogin = page.locator('a[href="/login"]')

    // Common
    this.errorAlert = page.locator('.text-destructive, [role="alert"], .bg-red-100')
    this.pageHeading = page.locator('h1, [class*="card"] h1')
  }

  /**
   * Navigate to login page
   */
  async gotoLogin(): Promise<void> {
    await this.page.goto('/login')
  }

  /**
   * Navigate to register page
   */
  async gotoRegister(): Promise<void> {
    await this.page.goto('/register')
  }

  /**
   * Fill login form with credentials
   */
  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.loginEmailInput.fill(email)
    await this.loginPasswordInput.fill(password)
  }

  /**
   * Submit login form
   */
  async submitLogin(): Promise<void> {
    await this.loginSubmitButton.click()
  }

  /**
   * Login with email and password
   * Note: After successful login, better-auth redirects to "/" using window.location.href
   */
  async login(email: string, password: string): Promise<void> {
    await this.gotoLogin()
    await this.fillLoginForm(email, password)
    await this.submitLogin()
    // Wait for navigation to complete after form submission
    await this.page.waitForLoadState('networkidle')
    // If URL still contains /login, wait a bit more for potential client-side redirect
    if (this.page.url().includes('/login')) {
      await this.page.waitForTimeout(1000)
    }
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Fill register form with data
   */
  async fillRegisterForm(name: string, email: string, password: string, confirmPassword: string): Promise<void> {
    await this.registerNameInput.fill(name)
    await this.registerEmailInput.fill(email)
    await this.registerPasswordInput.fill(password)
    await this.registerConfirmPasswordInput.fill(confirmPassword)
  }

  /**
   * Submit register form
   */
  async submitRegister(): Promise<void> {
    await this.registerSubmitButton.click()
  }

  /**
   * Register with all fields
   */
  async register(name: string, email: string, password: string): Promise<void> {
    await this.gotoRegister()
    await this.fillRegisterForm(name, email, password, password)
    await this.submitRegister()
  }

  /**
   * Get validation error for a specific field
   */
  async getFieldValidationError(fieldName: 'email' | 'password' | 'name' | 'confirmPassword'): Promise<Locator> {
    const fieldMap = {
      email: this.loginEmailInput,
      password: this.loginPasswordInput,
      name: this.registerNameInput,
      confirmPassword: this.registerConfirmPasswordInput,
    }
    const field = fieldMap[fieldName]
    return field.locator('xpath=./following-sibling::p[contains(@class, "text-destructive")]')
  }

  /**
   * Check if error alert is visible with specific text
   */
  async expectErrorAlert(text?: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible()
    if (text) {
      await expect(this.errorAlert).toContainText(text)
    }
  }

  /**
   * Check that error alert is not visible
   */
  async expectNoErrorAlert(): Promise<void> {
    await expect(this.errorAlert).not.toBeVisible()
  }

  /**
   * Wait for navigation after successful auth
   */
  async waitForAuthNavigation(): Promise<void> {
    // After successful login/register, should redirect to home/dashboard
    await this.page.waitForURL(/(\/|$|\/tickets)/, { timeout: 10000 })
  }
}

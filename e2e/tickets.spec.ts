import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/auth.page'

const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'testpass123',
}

test.describe('Ticket Management - Core Tests', () => {
  let authPage: AuthPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
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
})

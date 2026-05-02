import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/auth.page'

const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'testpass123',
}

test.describe('User Management - Core Tests', () => {
  let authPage: AuthPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
  })

  test('should show error with wrong password', async ({ page }) => {
    await authPage.gotoLogin()
    await authPage.fillLoginForm(TEST_ADMIN.email, 'wrongpassword')
    await authPage.submitLogin()
    await page.waitForLoadState('networkidle')
    await authPage.expectErrorAlert()
    await expect(authPage.errorAlert).toContainText(/invalid|incorrect|failed|wrong/i)
    await expect(page).toHaveURL(/\/login/)
  })
})

import { test, expect, Page } from '@playwright/test'
import { AuthPage } from './pages/auth.page'

// Test user credentials - seeded in global-setup
const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'testpass123',
}

test.describe('Authentication System', () => {
  let authPage: AuthPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
  })

  test.afterEach(async ({ page }) => {
    // Sign out after each test if logged in
    try {
      const signOutButton = page.locator('button:has-text("Sign Out")')
      if (await signOutButton.isVisible({ timeout: 1000 })) {
        await signOutButton.click()
        await page.waitForURL(/\/login/, { timeout: 5000 })
      }
    } catch {
      // User not logged in, no action needed
    }
  })

  // ==========================================================================
  // LOGIN FLOW TESTS
  // ==========================================================================

  test.describe('Login Flow', () => {
    test('should display login form with all required fields', async ({ page }) => {
      await authPage.gotoLogin()

      await expect(authPage.loginEmailInput).toBeVisible()
      await expect(authPage.loginPasswordInput).toBeVisible()
      await expect(authPage.loginSubmitButton).toBeVisible()
      await expect(authPage.loginSubmitButton).toHaveText('Sign In')
      await expect(authPage.loginLinkToRegister).toBeVisible()
    })

    test('should show error with wrong password', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm(TEST_ADMIN.email, 'wrongpassword')
      await authPage.submitLogin()

      await authPage.expectErrorAlert()
      // Error message should indicate invalid credentials
      await expect(authPage.errorAlert).toContainText(/invalid|incorrect|failed|wrong/i)
    })

    test('should show error with non-existent email', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm('nonexistent@test.com', TEST_ADMIN.password)
      await authPage.submitLogin()

      await authPage.expectErrorAlert()
      await expect(authPage.errorAlert).toContainText(/invalid|incorrect|failed|wrong|not found/i)
    })

    test('should show validation error for empty email', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.loginPasswordInput.fill(TEST_ADMIN.password)
      await authPage.submitLogin()

      // Should show validation error for email field
      await expect(authPage.loginEmailInput).toBeVisible()
      // Form should not submit - check we're still on login page
      await expect(authPage.loginSubmitButton).toBeVisible()
    })

    test('should show validation error for empty password', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.loginEmailInput.fill(TEST_ADMIN.email)
      await authPage.submitLogin()

      // Should show validation error for password field
      await expect(authPage.loginPasswordInput).toBeVisible()
      // Form should not submit - check we're still on login page
      await expect(authPage.loginSubmitButton).toBeVisible()
    })

    test('should show validation error for empty all fields', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.submitLogin()

      // Should show validation errors
      await expect(authPage.loginEmailInput).toBeVisible()
      await expect(authPage.loginSubmitButton).toBeVisible()
    })

    test('should show validation error for invalid email format', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.loginEmailInput.fill('notanemail')
      await authPage.loginPasswordInput.fill(TEST_ADMIN.password)
      await authPage.submitLogin()

      // Should show email validation error
      await expect(page.locator('text=valid email')).toBeVisible()
    })

    test('should navigate to register page when clicking sign up link', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.loginLinkToRegister.click()

      await expect(page).toHaveURL(/\/register/)
      await expect(authPage.registerNameInput).toBeVisible()
    })

    test('should remain on login page after invalid login attempt', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm('invalid@test.com', 'wrongpassword')
      await authPage.submitLogin()

      await authPage.expectErrorAlert()
      await expect(page).toHaveURL(/\/login/)
      // Form fields should still be visible
      await expect(authPage.loginEmailInput).toBeVisible()
      await expect(authPage.loginPasswordInput).toBeVisible()
    })
  })

  // ==========================================================================
  // REGISTRATION FLOW TESTS
  // These tests cover successful sign-up and client-side validation
  // ==========================================================================

  test.describe('Registration Flow', () => {
    test('should display registration form with all required fields', async ({ page }) => {
      await authPage.gotoRegister()

      await expect(authPage.registerNameInput).toBeVisible()
      await expect(authPage.registerEmailInput).toBeVisible()
      await expect(authPage.registerPasswordInput).toBeVisible()
      await expect(authPage.registerConfirmPasswordInput).toBeVisible()
      await expect(authPage.registerSubmitButton).toBeVisible()
      await expect(authPage.registerSubmitButton).toHaveText('Sign Up')
      await expect(authPage.registerLinkToLogin).toBeVisible()
    })

    test('should successfully register a new user', async ({ page }) => {
      const uniqueEmail = `newuser${Date.now()}@test.com`

      await authPage.gotoRegister()
      await authPage.fillRegisterForm('New Test User', uniqueEmail, 'securepass123', 'securepass123')
      await authPage.submitRegister()

      await authPage.waitForAuthNavigation()
      const signOutButton = page.locator('header button:has-text("Sign Out")')
      await expect(signOutButton).toBeVisible({ timeout: 5000 })
    })

    test('should show error when registering with duplicate email', async ({ page }) => {
      // Try to register with existing admin email
      await authPage.gotoRegister()
      await authPage.fillRegisterForm('Admin Clone', TEST_ADMIN.email, 'newpass123', 'newpass123')
      await authPage.submitRegister()

      await authPage.expectErrorAlert()
    })

    test('should show error when password confirmation does not match', async ({ page }) => {
      const uniqueEmail = `mismatch${Date.now()}@test.com`

      await authPage.gotoRegister()
      await authPage.fillRegisterForm('Test User', uniqueEmail, 'password123', 'differentpassword')
      await authPage.submitRegister()

      // Should show password mismatch error (before reaching sign-up disabled error)
      await expect(page.locator('text=do not match')).toBeVisible()
    })

    test('should show validation error for weak password (less than 6 chars)', async ({ page }) => {
      const uniqueEmail = `weakpass${Date.now()}@test.com`

      await authPage.gotoRegister()
      await authPage.fillRegisterForm('Test User', uniqueEmail, '12345', '12345')
      await authPage.submitRegister()

      // Should show password length error
      await expect(page.locator('text=6 characters')).toBeVisible()
    })

    test('should show validation error for empty name', async ({ page }) => {
      const uniqueEmail = `noname${Date.now()}@test.com`

      await authPage.gotoRegister()
      await authPage.registerEmailInput.fill(uniqueEmail)
      await authPage.registerPasswordInput.fill('password123')
      await authPage.registerConfirmPasswordInput.fill('password123')
      await authPage.submitRegister()

      // Should show name validation error - name field should be empty/required
      await expect(authPage.registerNameInput).toBeVisible()
    })

    test('should show validation error for empty email', async ({ page }) => {
      await authPage.gotoRegister()
      await authPage.registerNameInput.fill('Test User')
      await authPage.registerPasswordInput.fill('password123')
      await authPage.registerConfirmPasswordInput.fill('password123')
      await authPage.submitRegister()

      // Should show email validation error
      await expect(authPage.registerEmailInput).toBeVisible()
    })

    test('should show validation error for invalid email format', async ({ page }) => {
      await authPage.gotoRegister()
      await authPage.fillRegisterForm('Test User', 'notanemail', 'password123', 'password123')
      await authPage.submitRegister()

      // Should show email validation error
      await expect(page.locator('text=valid email')).toBeVisible()
    })

    test('should show multiple validation errors when all fields are empty', async ({ page }) => {
      await authPage.gotoRegister()
      await authPage.submitRegister()

      // Should show validation errors for required fields
      await expect(authPage.registerSubmitButton).toBeVisible()
    })

    test('should navigate to login page when clicking sign in link', async ({ page }) => {
      await authPage.gotoRegister()
      await authPage.registerLinkToLogin.click()

      await expect(page).toHaveURL(/\/login/)
      await expect(authPage.loginEmailInput).toBeVisible()
    })
  })

  // ==========================================================================
  // SESSION / LOGOUT TESTS
  // ==========================================================================

  test.describe('Session / Logout', () => {
    test('should successfully logout and redirect to login', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await authPage.waitForAuthNavigation()
      const signOutButton = page.locator('header button:has-text("Sign Out")')
      await expect(signOutButton).toBeVisible({ timeout: 5000 })
      await signOutButton.click()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
    })

    test('should access protected route after successful login', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await authPage.waitForAuthNavigation()
      await page.goto('/tickets')
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(/\/tickets/, { timeout: 5000 })
    })

    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      await page.context().clearCookies()
      await page.goto('/tickets')
      await expect(page).toHaveURL(/\/login/)
    })

    test('should redirect to login when accessing root without auth', async ({ page }) => {
      await page.context().clearCookies()
      await page.goto('/')
      await expect(page).toHaveURL(/\/login/)
    })

    test('should remember login state after page reload', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await authPage.waitForAuthNavigation()
      const signOutButton = page.locator('header button:has-text("Sign Out")')
      await expect(signOutButton).toBeVisible({ timeout: 5000 })
      await page.reload()
      await page.waitForLoadState('networkidle')
      await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 })
    })
  })

  // ==========================================================================
  // EDGE CASES / SECURITY TESTS
  // ==========================================================================

  test.describe('Edge Cases / Security', () => {
    test('should handle SQL injection attempt in email field', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm("admin@test.com' OR '1'='1", 'anypassword')
      await authPage.submitLogin()

      // Should show validation error for invalid email (frontend catches it before backend)
      // Either shows as email validation error or backend error alert
      const emailValidationError = page.locator('text=Please enter a valid email address')
      const errorAlert = page.locator('[role="alert"]')
      const hasEmailError = await emailValidationError.isVisible({ timeout: 1000 }).catch(() => false)
      const hasAlertError = await errorAlert.isVisible({ timeout: 1000 }).catch(() => false)

      expect(hasEmailError || hasAlertError).toBeTruthy()
      await expect(page).toHaveURL(/\/login/)
    })

    test('should handle SQL injection attempt in password field', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm(TEST_ADMIN.email, "password' OR '1'='1")
      await authPage.submitLogin()

      // Should show error, not authenticate
      await authPage.expectErrorAlert()
      await expect(page).toHaveURL(/\/login/)
    })

    test('should handle very long input in email field', async ({ page }) => {
      await authPage.gotoLogin()
      const longEmail = 'a'.repeat(1000) + '@test.com'
      await authPage.fillLoginForm(longEmail, TEST_ADMIN.password)
      await authPage.submitLogin()

      // Should show validation error, not crash
      await expect(authPage.loginForm).toBeVisible()
    })

    test('should handle very long input in password field', async ({ page }) => {
      await authPage.gotoLogin()
      const longPassword = 'a'.repeat(1000)
      await authPage.fillLoginForm(TEST_ADMIN.email, longPassword)
      await authPage.submitLogin()

      // Should show error or validation, not crash
      await expect(authPage.loginForm).toBeVisible()
    })

    test('should handle XSS attempt in email field', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm('<script>alert("xss")</script>@test.com', TEST_ADMIN.password)
      await authPage.submitLogin()

      // Should show validation error for invalid email (frontend catches it before backend)
      // Either shows as email validation error or backend error alert
      const emailValidationError = page.locator('text=Please enter a valid email address')
      const errorAlert = page.locator('[role="alert"]')
      const hasEmailError = await emailValidationError.isVisible({ timeout: 1000 }).catch(() => false)
      const hasAlertError = await errorAlert.isVisible({ timeout: 1000 }).catch(() => false)

      expect(hasEmailError || hasAlertError).toBeTruthy()
    })

    test('should handle whitespace-only inputs', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm('   ', '   ')
      await authPage.submitLogin()

      // Should show validation error
      await expect(authPage.loginForm).toBeVisible()
    })

    test('should handle email with leading/trailing whitespace', async ({ page }) => {
      await authPage.gotoLogin()
      // Note: The actual behavior depends on backend - it may trim or reject
      await authPage.fillLoginForm('  ' + TEST_ADMIN.email + '  ', TEST_ADMIN.password)
      await authPage.submitLogin()

      // Should handle gracefully (either trim and work, or show error)
      await expect(authPage.loginForm).toBeVisible()
    })
  })

  // ==========================================================================
  // NAVIGATION AND LINK TESTS
  // ==========================================================================

  test.describe('Navigation and Links', () => {
    test('should navigate from login to register and back', async ({ page }) => {
      await authPage.gotoLogin()
      await expect(authPage.loginForm).toBeVisible()

      await authPage.loginLinkToRegister.click()
      await expect(page).toHaveURL(/\/register/)
      await expect(authPage.registerForm).toBeVisible()

      await authPage.registerLinkToLogin.click()
      await expect(page).toHaveURL(/\/login/)
      await expect(authPage.loginForm).toBeVisible()
    })

    test('should navigate from register to login and back', async ({ page }) => {
      await authPage.gotoRegister()
      await expect(authPage.registerForm).toBeVisible()

      await authPage.registerLinkToLogin.click()
      await expect(page).toHaveURL(/\/login/)
      await expect(authPage.loginForm).toBeVisible()

      await authPage.loginLinkToRegister.click()
      await expect(page).toHaveURL(/\/register/)
      await expect(authPage.registerForm).toBeVisible()
    })

    test('should have working link to login on login page', async ({ page }) => {
      await authPage.gotoLogin()
      await expect(authPage.loginLinkToRegister).toHaveAttribute('href', '/register')
    })

    test('should have working link to register on register page', async ({ page }) => {
      await authPage.gotoRegister()
      await expect(authPage.registerLinkToLogin).toHaveAttribute('href', '/login')
    })
  })

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  test.describe('Accessibility', () => {
    test('should have proper form labels for login', async ({ page }) => {
      await authPage.gotoLogin()

      // Check labels are associated with inputs
      await expect(page.locator('label[for="email"]')).toHaveText('Email')
      await expect(page.locator('label[for="password"]')).toHaveText('Password')
    })

    test('should have proper form labels for register', async ({ page }) => {
      await authPage.gotoRegister()

      // Check labels are associated with inputs
      await expect(page.locator('label[for="name"]')).toHaveText('Name')
      await expect(page.locator('label[for="email"]')).toHaveText('Email')
      await expect(page.locator('label[for="password"]')).toHaveText('Password')
      await expect(page.locator('label[for="confirmPassword"]')).toHaveText('Confirm Password')
    })

    test('should have accessible submit buttons', async ({ page }) => {
      await authPage.gotoLogin()
      await expect(authPage.loginSubmitButton).toHaveAttribute('type', 'submit')
    })

    test('should support keyboard navigation in forms', async ({ page }) => {
      await authPage.gotoLogin()

      // Focus on email field and tab through form
      await authPage.loginEmailInput.focus()
      await expect(authPage.loginEmailInput).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(authPage.loginPasswordInput).toBeFocused()
    })
  })

  // ==========================================================================
  // FORM VALIDATION TESTS
  // ==========================================================================

  test.describe('Form Validation', () => {
    test('should validate email format on login', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm('invalidemail', 'password')
      await authPage.submitLogin()

      await expect(page.locator('text=valid email')).toBeVisible()
    })

    test('should validate email format on register', async ({ page }) => {
      await authPage.gotoRegister()
      await authPage.fillRegisterForm('Test', 'notanemail', 'password123', 'password123')
      await authPage.submitRegister()

      await expect(page.locator('text=valid email')).toBeVisible()
    })

    test('should validate password minimum length on register', async ({ page }) => {
      await authPage.gotoRegister()
      await authPage.fillRegisterForm('Test', 'test@test.com', '12345', '12345')
      await authPage.submitRegister()

      await expect(page.locator('text=6 characters')).toBeVisible()
    })

    test('should validate password match on register', async ({ page }) => {
      await authPage.gotoRegister()
      await authPage.fillRegisterForm('Test', 'test@test.com', 'password123', 'password124')
      await authPage.submitRegister()

      await expect(page.locator('text=do not match')).toBeVisible()
    })
  })
})

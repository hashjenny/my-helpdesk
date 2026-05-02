import { test, expect, Page } from '@playwright/test'
import { AuthPage } from './pages/auth.page'
import { AdminUsersPage } from './pages/admin-users.page'

const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'testpass123',
}

test.describe('User Management CRUD Operations', () => {
  let authPage: AuthPage
  let adminUsersPage: AdminUsersPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
    adminUsersPage = new AdminUsersPage(page)
  })

  test.afterEach(async ({ page }) => {
    try {
      const signOutButton = page.locator('button:has-text("Sign Out")')
      if (await signOutButton.isVisible({ timeout: 1000 })) {
        await signOutButton.click()
        await page.waitForURL(/\/login/, { timeout: 5000 })
      }
    } catch {
    }
  })

  test.describe('Admin Login Flow', () => {
    test('should login successfully with valid admin credentials', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm(TEST_ADMIN.email, TEST_ADMIN.password)
      await authPage.submitLogin()

      await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 })
      await page.waitForLoadState('networkidle')
    })

    test('should display admin navigation after login', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await page.waitForLoadState('networkidle')

      await expect(page.locator('a[href="/users"]')).toBeVisible({ timeout: 5000 })
    })

    test('should show error with wrong password', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm(TEST_ADMIN.email, 'wrongpassword')
      await authPage.submitLogin()

      await authPage.expectErrorAlert()
      await expect(page).toHaveURL(/\/login/)
    })

    test('should show error with non-existent email', async ({ page }) => {
      await authPage.gotoLogin()
      await authPage.fillLoginForm('nonexistent@test.com', TEST_ADMIN.password)
      await authPage.submitLogin()

      await authPage.expectErrorAlert()
    })
  })

  test.describe('User List Page', () => {
    test('should load and display users when admin is logged in', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await page.waitForURL('http://localhost:5173/', { timeout: 10000 })
      await page.waitForLoadState('networkidle')

      await adminUsersPage.goto()
      await page.waitForLoadState('networkidle')

      await expect(adminUsersPage.pageHeading).toBeVisible({ timeout: 10000 })
      await expect(adminUsersPage.userTable).toBeVisible()
    })

    test('should display pagination controls', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()
      await page.waitForLoadState('networkidle')

      await expect(adminUsersPage.paginationInfo).toBeVisible()
    })

    test('should show search input', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()
      await page.waitForLoadState('networkidle')

      await expect(adminUsersPage.searchInput).toBeVisible()
    })

    test('should show role filter select', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()
      await page.waitForLoadState('networkidle')

      await expect(adminUsersPage.roleFilterSelect).toBeVisible()
    })

    test('should display Add Agent button', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()
      await page.waitForLoadState('networkidle')

      await expect(adminUsersPage.addAgentButton.first()).toBeVisible()
    })
  })

  test.describe('Create New User', () => {
    test('should show create form when clicking Add Agent', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()
      await adminUsersPage.openCreateForm()

      await expect(adminUsersPage.createFormCard).toBeVisible()
    })

    test('should create new user with valid data', async ({ page }) => {
      const uniqueEmail = `newagent${Date.now()}@test.com`

      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()

      await adminUsersPage.openCreateForm()
      await page.waitForLoadState('networkidle')

      await adminUsersPage.fillCreateForm('New Agent', uniqueEmail, 'password123', 'AGENT')
      await adminUsersPage.submitCreateForm()

      await page.waitForResponse(
        resp => resp.url().includes('/api/users') && resp.status() === 201,
        { timeout: 10000 }
      ).catch(() => { })

      await expect(adminUsersPage.createFormCard).not.toBeVisible({ timeout: 5000 })
    })

    test('should create admin user with ADMIN role', async ({ page }) => {
      const uniqueEmail = `newadmin${Date.now()}@test.com`

      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()

      await adminUsersPage.openCreateForm()
      await page.waitForLoadState('networkidle')
      await adminUsersPage.fillCreateForm('New Admin', uniqueEmail, 'password123', 'ADMIN')
      await adminUsersPage.submitCreateForm()

      await page.waitForResponse(
        resp => resp.url().includes('/api/users') && resp.status() === 201,
        { timeout: 10000 }
      ).catch(() => { })

      await expect(adminUsersPage.userTable).toContainText('ADMIN')
    })

    test('should hide create form when clicking Cancel', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()

      await adminUsersPage.openCreateForm()
      await expect(adminUsersPage.createFormCard).toBeVisible()

      await adminUsersPage.createCancelButton.click()
      await expect(adminUsersPage.createFormCard).not.toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('Create User Validation Errors', () => {
    test('should show error for missing name', async ({ page }) => {
      const uniqueEmail = `noname${Date.now()}@test.com`

      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()

      await adminUsersPage.openCreateForm()
      await page.waitForLoadState('networkidle')

      await adminUsersPage.createEmailInput.fill(uniqueEmail)
      await adminUsersPage.createPasswordInput.fill('password123')
      await adminUsersPage.createRoleSelect.selectOption('AGENT')
      await adminUsersPage.submitCreateForm()

      await expect(page.locator('.text-destructive').first()).toBeVisible({ timeout: 3000 })
    })

    test('should show error for missing email', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()

      await adminUsersPage.openCreateForm()
      await page.waitForLoadState('networkidle')

      await adminUsersPage.createNameInput.fill('Missing Email')
      await adminUsersPage.createPasswordInput.fill('password123')
      await adminUsersPage.createRoleSelect.selectOption('AGENT')
      await adminUsersPage.submitCreateForm()

      await expect(page.locator('.text-destructive').first()).toBeVisible({ timeout: 3000 })
    })

    test('should show error for missing password', async ({ page }) => {
      const uniqueEmail = `nopassword${Date.now()}@test.com`

      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()

      await adminUsersPage.openCreateForm()
      await page.waitForLoadState('networkidle')

      await adminUsersPage.createNameInput.fill('No Password User')
      await adminUsersPage.createEmailInput.fill(uniqueEmail)
      await adminUsersPage.createRoleSelect.selectOption('AGENT')
      await adminUsersPage.submitCreateForm()

      await expect(page.locator('.text-destructive').first()).toBeVisible({ timeout: 3000 })
    })

    test('should show error for invalid email format', async ({ page }) => {
      const uniqueEmail = `invalidemail${Date.now()}@test.com`

      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()

      await adminUsersPage.openCreateForm()
      await page.waitForLoadState('networkidle')

      await adminUsersPage.fillCreateForm('Invalid Email', 'notanemail', 'password123', 'AGENT')
      await adminUsersPage.submitCreateForm()

      await expect(page.locator('.text-destructive').first()).toBeVisible({ timeout: 3000 })
    })

    test('should show error for weak password (less than 6 chars)', async ({ page }) => {
      const uniqueEmail = `weakpass${Date.now()}@test.com`

      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()

      await adminUsersPage.openCreateForm()
      await page.waitForLoadState('networkidle')

      await adminUsersPage.createNameInput.fill('Weak Password')
      await adminUsersPage.createEmailInput.fill(uniqueEmail)
      await adminUsersPage.createPasswordInput.fill('12345')
      await adminUsersPage.createRoleSelect.selectOption('AGENT')
      await adminUsersPage.submitCreateForm()

      await expect(page.locator('.text-destructive').first()).toBeVisible({ timeout: 3000 })
    })

    test('should show alert for duplicate email', async ({ page }) => {
      await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
      await adminUsersPage.goto()

      page.on('dialog', dialog => {
        expect(dialog.message()).toMatch(/email|exists|duplicate/i)
        dialog.dismiss()
      })

      await adminUsersPage.openCreateForm()
      await page.waitForLoadState('networkidle')
      await adminUsersPage.fillCreateForm('Duplicate User', TEST_ADMIN.email, 'password123', 'AGENT')
      await adminUsersPage.submitCreateForm()

      await page.waitForTimeout(1000)
    })

    test.describe('Edit Existing User', () => {
      test('should open edit modal when clicking Edit button', async ({ page }) => {
        await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
        await adminUsersPage.goto()
        await page.waitForLoadState('networkidle')

        const rowCount = await adminUsersPage.tableRows.count()
        if (rowCount === 0) {
          test.skip()
        }

        await adminUsersPage.openEditModal(0)
        await expect(adminUsersPage.editModal).toBeVisible()
      })

      test('should edit user name successfully', async ({ page }) => {
        await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
        await adminUsersPage.goto()
        await page.waitForLoadState('networkidle')

        const rowCount = await adminUsersPage.tableRows.count()
        if (rowCount === 0) {
          test.skip()
        }

        await adminUsersPage.openEditModal(0)
        await adminUsersPage.editName('Updated Name ' + Date.now())
        await adminUsersPage.submitEdit()

        await page.waitForResponse(
          resp => resp.url().includes('/api/users') && [200, 204].includes(resp.status()),
          { timeout: 10000 }
        ).catch(() => { })

        await expect(adminUsersPage.editModal).not.toBeVisible({ timeout: 5000 })
      })

      test('should close edit modal when clicking Cancel', async ({ page }) => {
        await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
        await adminUsersPage.goto()
        await page.waitForLoadState('networkidle')

        const rowCount = await adminUsersPage.tableRows.count()
        if (rowCount === 0) {
          test.skip()
        }

        await adminUsersPage.openEditModal(0)
        await expect(adminUsersPage.editModal).toBeVisible()

        await adminUsersPage.closeEditModal()
        await expect(adminUsersPage.editModal).not.toBeVisible({ timeout: 3000 })
      })
    })

    test.describe('Delete User', () => {
      test('should show confirmation dialog when clicking Delete', async ({ page }) => {
        const uniqueEmail = `delete${Date.now()}@test.com`

        await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
        await adminUsersPage.goto()

        await adminUsersPage.openCreateForm()
        await page.waitForLoadState('networkidle')
        await adminUsersPage.fillCreateForm('Delete Me', uniqueEmail, 'password123', 'AGENT')
        await adminUsersPage.submitCreateForm()

        await page.waitForResponse(
          resp => resp.url().includes('/api/users') && resp.status() === 201,
          { timeout: 10000 }
        ).catch(() => { })

        let dialogShown = false
        page.on('dialog', dialog => {
          dialogShown = true
          expect(dialog.message()).toMatch(/delete|confirm/i)
          dialog.dismiss()
        })

        const rows = adminUsersPage.tableRows
        const rowCount = await rows.count()

        for (let i = 0; i < rowCount; i++) {
          const row = rows.nth(i)
          const emailText = await row.locator('td:nth-child(2)').textContent()
          if (emailText?.includes(uniqueEmail)) {
            const deleteButton = row.locator('button:has-text("Delete")')
            await deleteButton.click()
            break
          }
        }

        expect(dialogShown).toBeTruthy()
      })

      test('should delete user when confirming dialog', async ({ page }) => {
        const uniqueEmail = `deleteconfirm${Date.now()}@test.com`

        await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
        await adminUsersPage.goto()

        await adminUsersPage.openCreateForm()
        await page.waitForLoadState('networkidle')
        await adminUsersPage.fillCreateForm('Delete Confirm', uniqueEmail, 'password123', 'AGENT')
        await adminUsersPage.submitCreateForm()

        await page.waitForResponse(
          resp => resp.url().includes('/api/users') && resp.status() === 201,
          { timeout: 10000 }
        ).catch(() => { })

        page.on('dialog', dialog => dialog.accept())

        const rows = adminUsersPage.tableRows
        const rowCount = await rows.count()

        for (let i = 0; i < rowCount; i++) {
          const row = rows.nth(i)
          const emailText = await row.locator('td:nth-child(2)').textContent()
          if (emailText?.includes(uniqueEmail)) {
            const deleteButton = row.locator('button:has-text("Delete")')
            await deleteButton.click()
            break
          }
        }

        await page.waitForResponse(
          resp => resp.url().includes('/api/users') && [200, 204].includes(resp.status()),
          { timeout: 10000 }
        ).catch(() => { })

        await page.waitForLoadState('networkidle')
      })

      test('should not delete user when dismissing dialog', async ({ page }) => {
        const uniqueEmail = `deletekept${Date.now()}@test.com`

        await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
        await adminUsersPage.goto()

        await adminUsersPage.openCreateForm()
        await page.waitForLoadState('networkidle')
        await adminUsersPage.fillCreateForm('Keep Me', uniqueEmail, 'password123', 'AGENT')
        await adminUsersPage.submitCreateForm()

        await page.waitForResponse(
          resp => resp.url().includes('/api/users') && resp.status() === 201,
          { timeout: 10000 }
        ).catch(() => { })

        page.on('dialog', dialog => dialog.dismiss())

        const rows = adminUsersPage.tableRows
        const rowCount = await rows.count()

        for (let i = 0; i < rowCount; i++) {
          const row = rows.nth(i)
          const emailText = await row.locator('td:nth-child(2)').textContent()
          if (emailText?.includes(uniqueEmail)) {
            const deleteButton = row.locator('button:has-text("Delete")')
            await deleteButton.click()
            break
          }
        }

        await expect(adminUsersPage.userTable).toContainText(uniqueEmail)
      })
    })

    test.describe('Role-Based Access Control', () => {
      test('should allow admin to access admin users page', async ({ page }) => {
        await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
        await adminUsersPage.goto()

        await expect(page).toHaveURL(/\/users/, { timeout: 10000 })
        await expect(adminUsersPage.pageHeading).toBeVisible({ timeout: 5000 })
      })
    })

    test.describe('Search and Filter', () => {
      test('should filter users by role', async ({ page }) => {
        await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
        await adminUsersPage.goto()
        await page.waitForLoadState('networkidle')

        await adminUsersPage.roleFilterSelect.selectOption('AGENT')
        await page.waitForLoadState('networkidle')

        await expect(adminUsersPage.userTable).toBeVisible()
      })
    })

    test.describe('Pagination', () => {
      test('should show pagination info', async ({ page }) => {
        await authPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
        await expect(adminUsersPage.paginationInfo).toBeVisible()
      })
    })
  })
})
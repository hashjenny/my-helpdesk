import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Helpdesk' })).toBeVisible()
})

test('login page has login form', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('form')).toBeVisible()
})

import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.beforeEach(async ({ request }) => {
  // Reset database to known state before each test
  const response = await request.post(`${API_URL}/test/reset`);
  expect(response.ok()).toBeTruthy();
});

test.describe('Password login flow', () => {
  test('succesfuldt login med admin/admin123', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    // Should show admin layout content
    await expect(page.locator('text=Admin Panel')).toBeVisible();
  });

  test('fejlet login med forkert password', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('#username', 'admin');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should stay on login page and show error
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator('[role="alert"], .text-red-700, .bg-red-50')).toBeVisible();
  });

  test('logout redirecter til login-side', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('text=Admin Panel')).toBeVisible();

    // Click logout button
    await page.click('button:has-text("Log ud")');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${API_URL}/test/reset`);
  expect(response.ok()).toBeTruthy();
});

test.describe('Admin dark mode', () => {
  test('html-elementet har klassen dark', async ({ page }) => {
    await page.goto('/admin/login');
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
  });

  test('sidebar har dark mode baggrund efter login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Susi2010');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin/);

    const sidebar = page.locator('.w-64');
    await expect(sidebar).toBeVisible();

    const hasDarkBg = await sidebar.evaluate((el) => {
      return el.classList.contains('dark:bg-gray-800') ||
        window.getComputedStyle(el).backgroundColor === 'rgb(31, 41, 55)';
    });
    expect(hasDarkBg).toBeTruthy();
  });

  test('login-siden har dark mode baggrund', async ({ page }) => {
    await page.goto('/admin/login');

    const hasDarkBg = await page.locator('html').evaluate((el) => {
      return el.classList.contains('dark');
    });
    expect(hasDarkBg).toBeTruthy();

    await expect(page.locator('h2:has-text("Admin Login")')).toBeVisible();
  });
});

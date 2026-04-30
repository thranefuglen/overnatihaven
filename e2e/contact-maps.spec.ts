import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${API_URL}/test/reset`);
  expect(response.ok()).toBeTruthy();
});

test.describe('Google Maps link i kontakt-sektionen', () => {
  test('Google Maps-link i kontaktsektionen har korrekt href og target', async ({ page }) => {
    await page.goto('/');

    await page.locator('#contact').scrollIntoViewIfNeeded();

    const mapsLink = page.locator('a[aria-label="Åbn i Google Maps"]').first();
    await expect(mapsLink).toBeVisible();

    const href = await mapsLink.getAttribute('href');
    expect(href).toContain('google.com/maps');
    expect(href).toContain('Gredstedbro');

    const target = await mapsLink.getAttribute('target');
    expect(target).toBe('_blank');

    const rel = await mapsLink.getAttribute('rel');
    expect(rel).toContain('noopener');
  });
});

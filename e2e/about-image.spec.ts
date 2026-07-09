import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${API_URL}/test/reset`);
  expect(response.ok()).toBeTruthy();
});

test.describe('Om Elins Have', () => {
  test('sektionens billede renderer faktisk (ikke kun i DOM)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#about').scrollIntoViewIfNeeded();

    const img = page.locator('#about img[alt="Udsigt over haven"]');
    await expect(img).toBeVisible();

    // naturalWidth > 0 betyder at billedfilen reelt blev hentet og afkodet —
    // en død URL (fx en slettet blob-fil) ville give naturalWidth 0.
    await expect
      .poll(async () => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  });
});

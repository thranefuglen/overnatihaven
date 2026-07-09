import { test, expect, Page } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

// 1x1 transparent PNG som stand-in for blob-billeder
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const imgUrl = (n: number, variant: 'full' | 'thumb') =>
  `https://fake-blob.test/gallery/img-${n}${variant === 'thumb' ? '-thumb' : ''}.webp`;

const galleryData = [1, 2, 3, 4, 5].map((n) => ({
  id: n,
  title: `Billede ${n}`,
  description: null,
  image_url: imgUrl(n, 'full'),
  thumb_url: imgUrl(n, 'thumb'),
  file_path: null,
  is_active: true,
  show_in_hero: false,
  sort_order: n,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}));

/**
 * Mock galleri-API'et og blob-billederne, og registrér hvilke billed-URL'er
 * browseren faktisk henter — det er kernen i lazy-loading-adfærden vi tester.
 */
async function setupMocks(page: Page): Promise<string[]> {
  const requestedImages: string[] = [];

  await page.route('**/api/gallery', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: galleryData, count: galleryData.length }),
    })
  );

  // Hero'en henter sit eget endpoint; giv den et tomt svar så den ikke
  // blander sig i billed-requests i denne test.
  await page.route('**/api/gallery/hero', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [], count: 0 }),
    })
  );

  await page.route('https://fake-blob.test/**', (route) => {
    requestedImages.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'image/png', body: TINY_PNG });
  });

  return requestedImages;
}

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${API_URL}/test/reset`);
  expect(response.ok()).toBeTruthy();
});

test.describe('Galleri-karrusel', () => {
  test('viser første billede som thumbnail og henter ikke fjerne slides', async ({ page }) => {
    const requestedImages = await setupMocks(page);

    await page.goto('/');
    await page.locator('#gallery').scrollIntoViewIfNeeded();

    // Første slide vises med korrekt position
    const firstImg = page.locator('#gallery img[alt="Billede 1"]');
    await expect(firstImg).toBeVisible();
    await expect(page.locator('#gallery').getByText('(1 / 5)')).toBeVisible();

    // Den synlige slide hentes som thumbnail (960w-varianten), ikke fuld størrelse
    await expect.poll(() => requestedImages).toContain(imgUrl(1, 'thumb'));
    expect(requestedImages).not.toContain(imgUrl(1, 'full'));

    // Slides langt fra den aktuelle (3 og 4) har slet ikke fået src og hentes ikke
    expect(requestedImages).not.toContain(imgUrl(3, 'thumb'));
    expect(requestedImages).not.toContain(imgUrl(3, 'full'));
    expect(requestedImages).not.toContain(imgUrl(4, 'thumb'));
    expect(requestedImages).not.toContain(imgUrl(4, 'full'));
  });

  test('næste-knappen bladrer og henter først billedet dér', async ({ page }) => {
    const requestedImages = await setupMocks(page);

    await page.goto('/');
    await page.locator('#gallery').scrollIntoViewIfNeeded();
    await expect(page.locator('#gallery img[alt="Billede 1"]')).toBeVisible();

    await page.locator('#gallery').getByRole('button', { name: 'Næste billede' }).click();

    await expect(page.locator('#gallery').getByText('(2 / 5)')).toBeVisible();
    await expect.poll(() => requestedImages).toContain(imgUrl(2, 'thumb'));

    // Tilbage-bladring virker også (wrap-around til sidste billede fra nr. 1)
    await page.locator('#gallery').getByRole('button', { name: 'Forrige billede' }).click();
    await page.locator('#gallery').getByRole('button', { name: 'Forrige billede' }).click();
    await expect(page.locator('#gallery').getByText('(5 / 5)')).toBeVisible();
  });

  test('lightbox åbner med fuld-størrelses-varianten', async ({ page }) => {
    const requestedImages = await setupMocks(page);

    await page.goto('/');
    await page.locator('#gallery').scrollIntoViewIfNeeded();

    await page
      .locator('#gallery')
      .getByRole('button', { name: 'Vis Billede 1 i fuld størrelse' })
      .click();

    const lightbox = page.getByRole('dialog');
    await expect(lightbox).toBeVisible();
    await expect(lightbox.locator(`img[src="${imgUrl(1, 'full')}"]`)).toBeVisible();
    await expect.poll(() => requestedImages).toContain(imgUrl(1, 'full'));

    // Escape lukker lightboxen igen
    await page.keyboard.press('Escape');
    await expect(lightbox).not.toBeVisible();
  });
});

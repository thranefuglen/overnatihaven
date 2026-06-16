import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

// Vælg en dato der altid er synlig i den aktuelle måned uden at navigere:
// månedens sidste dag er altid >= i dag og dermed ikke "fortid".
function seedDateISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${API_URL}/test/reset`);
  expect(response.ok()).toBeTruthy();
});

test.describe('Tilgængelighedskalender', () => {
  test('offentlig kalender viser en optaget dag og detaljer ved klik', async ({ page }) => {
    const iso = seedDateISO();
    const y = new Date().getFullYear();

    // Mock API'et, så testen er deterministisk og uafhængig af den delte
    // test-database (andre parallelle tests nulstiller den via /test/reset).
    await page.route('**/api/availability', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            season: { season_start: `${y - 1}-01-01`, season_end: `${y + 1}-12-31` },
            days: [{ date: iso, shelter_occupied: true, tents_occupied: 2 }],
          },
        }),
      });
    });

    await page.goto('/');

    // Dagen er synlig i den aktuelle måned (kalenderen åbner på indeværende måned)
    const cell = page.locator(`#availability button[aria-label="${iso}"]`);
    await expect(cell).toBeVisible();
    // Delvist optaget → gul
    await expect(cell).toHaveClass(/bg-yellow-100/);

    // Klik viser detaljelinje med korrekt antal ledige teltpladser
    await cell.click();
    const detail = page.locator('#availability').getByText('Teltpladser: 1 af 3 ledige');
    await expect(detail).toBeVisible();
    await expect(page.locator('#availability').getByText('Shelter: optaget')).toBeVisible();
  });

  test('admin kan markere, lukke og nulstille en dag samt ændre sæson', async ({ page, request }) => {
    const iso = seedDateISO();

    // Log ind via UI
    await page.goto('/admin/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Susi2010');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);

    // Gå til kalenderen
    await page.click('a[href="/admin/calendar"]');
    await expect(page.getByRole('heading', { name: 'Kalender', level: 2 })).toBeVisible();

    // Vælg dagen og markér shelter optaget + 2 teltpladser
    await page.locator(`button[aria-label="${iso}"]`).click();
    await page.getByRole('button', { name: 'Optaget', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();

    await expect.poll(async () => {
      const data = await (await request.get(`${API_URL}/availability`)).json();
      return data.data.days.find((d: { date: string }) => d.date === iso) ?? null;
    }).toMatchObject({ shelter_occupied: true, tents_occupied: 2 });

    // Luk hele dagen → shelter optaget + 3 teltpladser
    await page.getByRole('button', { name: 'Luk hele dagen' }).click();
    await expect.poll(async () => {
      const data = await (await request.get(`${API_URL}/availability`)).json();
      return data.data.days.find((d: { date: string }) => d.date === iso) ?? null;
    }).toMatchObject({ shelter_occupied: true, tents_occupied: 3 });

    // Nulstil til ledig → rækken fjernes (sparsom lagring)
    await page.getByRole('button', { name: 'Nulstil til ledig' }).click();
    await expect.poll(async () => {
      const data = await (await request.get(`${API_URL}/availability`)).json();
      return data.data.days.some((d: { date: string }) => d.date === iso);
    }).toBe(false);

    // Ændr sæson via formen
    await page.fill('#season-start', '2027-05-01');
    await page.fill('#season-end', '2027-09-30');
    await page.getByRole('button', { name: 'Gem sæson' }).click();
    await expect(page.getByText('Gemt ✓')).toBeVisible();

    await expect.poll(async () => {
      const data = await (await request.get(`${API_URL}/availability`)).json();
      return data.data.season;
    }).toMatchObject({ season_start: '2027-05-01', season_end: '2027-09-30' });
  });
});

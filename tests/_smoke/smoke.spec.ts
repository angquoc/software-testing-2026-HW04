import { test, expect } from '../support/fixtures';
import { ADMIN_URL, API_URL } from '../support/urls';

// Test mẫu kiểm khung dự án (0.7): 3 server EShop chạy, 3 trình duyệt mở được, report có Run by + ISO.
// Không thuộc 12 TC của feature nào.

test('Web frontend loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('frontend-web');
});

test('Admin frontend shows a password field', async ({ page }) => {
  await page.goto(ADMIN_URL);
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('Backend API returns products', async ({ request }) => {
  const res = await request.get(`${API_URL}/api/products`);
  expect(res.ok()).toBeTruthy();
  expect((await res.json()).length).toBeGreaterThan(0);
});

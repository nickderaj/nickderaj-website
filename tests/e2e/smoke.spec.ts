import { expect, test } from '@playwright/test';

test('home, blog index and a post load', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Nick de Raj' })).toBeVisible();
  await page.getByRole('link', { name: 'blog', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Writing' })).toBeVisible();
  await page
    .getByRole('link', { name: /Pairs Trading/ })
    .first()
    .click();
  await expect(page.locator('article')).toBeVisible();
});

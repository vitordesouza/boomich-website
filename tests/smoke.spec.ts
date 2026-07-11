import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('foundation page loads without console errors and meets accessibility checks', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
  expect(errors).toEqual([]);
});

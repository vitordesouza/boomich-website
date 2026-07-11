import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('hero loads without console errors and meets accessibility checks', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Senior engineering for the hard parts.',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: /interactive structural test/i }),
  ).toBeVisible();
  await expect(page.locator('[data-readout-load]')).toHaveText(/^\d+\.\d$/);
  await expect(page.locator('[data-readout-deflection]')).toHaveText(
    /^\d+\.\d$/,
  );
  await expect(page.locator('[data-readout-status]')).toHaveText(
    /^(WITHIN TOLERANCE|APPROACHING LIMIT|AT RATED LIMIT)$/,
  );
  await expect(page.locator('.instrument__readout p')).toHaveText(
    /LOAD \d+\.\d kN · DEFLECTION \d+\.\d mm · (WITHIN TOLERANCE|APPROACHING LIMIT|AT RATED LIMIT)/,
  );

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
  expect(errors).toEqual([]);
});

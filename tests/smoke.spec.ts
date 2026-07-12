import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Exercise canvas input at Retina density: pointer events remain CSS pixels.
test.use({ deviceScaleFactor: 2 });

test('site loads, interactive controls work, and meets accessibility checks', async ({
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
  await expect(page.locator('[data-readout-live]')).toHaveText(
    /LOAD \d+\.\d kN · DEFLECTION \d+\.\d mm · (WITHIN TOLERANCE|APPROACHING LIMIT|AT RATED LIMIT)/,
  );

  await expect(
    page.getByRole('heading', { level: 2, name: 'What we build' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: "Where we've shipped" }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Built by someone who ships',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Bring us the hard part.' }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'joaovitor@boomich.pt' }),
  ).toHaveAttribute('href', 'mailto:joaovitor@boomich.pt');
  await expect(
    page.getByRole('link', { name: "Tell us what you're building" }).last(),
  ).toHaveAttribute(
    'href',
    'mailto:joaovitor@boomich.pt?subject=Project%20inquiry',
  );

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy address' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('joaovitor@boomich.pt');

  const hook = page.locator('[data-instrument-hook]');
  await hook.scrollIntoViewIfNeeded();
  await expect(hook).toBeVisible();
  const hookBox = await hook.boundingBox();
  if (!hookBox) throw new Error('Instrument hook control has no bounding box.');
  const startX = hookBox.x + hookBox.width / 2;
  const startY = hookBox.y + hookBox.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX, startY + 120, { steps: 12 });
  await expect
    .poll(async () =>
      Number.parseFloat(
        (await page.locator('[data-readout-load]').textContent()) ?? '0',
      ),
    )
    .toBeGreaterThan(1);
  await page.mouse.up();
  await expect
    .poll(
      async () =>
        Number.parseFloat(
          (await page.locator('[data-readout-load]').textContent()) ?? '99',
        ),
      { timeout: 3500 },
    )
    .toBeLessThan(0.3);

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('404 loads and meets accessibility checks', async ({ page }) => {
  await page.goto('/not-a-route');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Nothing at this address.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Back to the studio' }),
  ).toHaveAttribute('href', '/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

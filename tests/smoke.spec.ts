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
  await expect(page.getByRole('img', { name: /the net/i })).toBeVisible();
  await expect(page.locator('[data-net-status]')).toHaveText(
    'Push anywhere. It holds.',
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

  const hero = page.locator('[data-net-hero]');
  // Earlier steps scrolled to the contact section; the hero's observer
  // pauses the simulation offscreen. Return and let it resume.
  await hero.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const heroBox = await hero.boundingBox();
  if (!heroBox) throw new Error('Hero has no bounding box.');
  const startX = heroBox.x + heroBox.width * 0.5;
  const startY = heroBox.y + heroBox.height * 0.44;
  await page.mouse.move(startX - 80, startY);
  await page.mouse.down();
  // The status flips only while energy is high and reverts 2.5s after calm,
  // so keep the net under sustained load and observe the flip mid-drag.
  let sawHolding = false;
  for (let i = 1; i <= 40 && !sawHolding; i += 1) {
    await page.mouse.move(
      startX + Math.sin(i / 2) * 170,
      startY + (i % 20) * 12,
      { steps: 2 },
    );
    await page.waitForTimeout(16);
    sawHolding =
      (await page.locator('[data-net-status]').textContent())?.trim() ===
      'Still holding.';
  }
  expect(sawHolding).toBe(true);
  await page.mouse.up();
  await expect(page.locator('[data-net-status]')).toHaveText(
    'Push anywhere. It holds.',
    { timeout: 8_000 },
  );

  const loadControl = page.getByRole('button', { name: 'Load the structure' });
  await loadControl.focus();
  await expect(loadControl).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-net-status]')).toHaveText('Still holding.');

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

test('hash navigation remains correct with and without motion enhancement', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByLabel('Primary navigation')
    .getByRole('link', { name: 'What we build' })
    .click();
  await expect(page).toHaveURL(/#capabilities$/);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/has-scroll-reveals/);
  await page
    .getByLabel('Primary navigation')
    .getByRole('link', { name: 'What we build' })
    .click();
  await expect(page).toHaveURL(/#capabilities$/);
});

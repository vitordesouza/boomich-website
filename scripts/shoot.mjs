import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const route = process.argv[2] ?? '/';
const name = process.argv[3] ?? 'page';
const baseUrl = process.env.BASE_URL ?? 'http://localhost:4321';
const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const outputDirectory = path.join(rootDirectory, 'shots');
const url = new URL(route, baseUrl).toString();
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(outputDirectory, `${name}-${viewport.name}-viewport.png`),
    });
    await page.screenshot({
      path: path.join(outputDirectory, `${name}-${viewport.name}-full.png`),
      fullPage: true,
    });
    await page.close();
  }
} finally {
  await browser.close();
}

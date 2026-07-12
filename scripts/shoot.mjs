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
const outputPath = process.env.SHOOT_OUTPUT;
const width = Number.parseInt(process.env.SHOOT_WIDTH ?? '', 10);
const height = Number.parseInt(process.env.SHOOT_HEIGHT ?? '', 10);
const viewports =
  outputPath && Number.isFinite(width) && Number.isFinite(height)
    ? [{ name: 'capture', width, height }]
    : [
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'mobile', width: 390, height: 844 },
      ];

await mkdir(outputPath ? path.dirname(outputPath) : outputDirectory, {
  recursive: true,
});

const browser = await chromium.launch();

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    if (outputPath) {
      await page.screenshot({ path: outputPath });
    } else {
      await page.screenshot({
        path: path.join(
          outputDirectory,
          `${name}-${viewport.name}-viewport.png`,
        ),
      });
      await page.screenshot({
        path: path.join(outputDirectory, `${name}-${viewport.name}-full.png`),
        fullPage: true,
      });
    }
    await page.close();
  }
} finally {
  await browser.close();
}

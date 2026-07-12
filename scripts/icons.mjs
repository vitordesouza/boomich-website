import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const favicon = await readFile(path.join(rootDirectory, 'public/favicon.svg'));

await sharp(favicon)
  .resize(180, 180, { fit: 'contain' })
  .png()
  .toFile(path.join(rootDirectory, 'public/apple-touch-icon.png'));

import { once } from 'node:events';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const baseUrl = 'http://127.0.0.1:4322';
const preview = spawn(
  'pnpm',
  ['preview', '--host', '127.0.0.1', '--port', '4322'],
  {
    cwd: rootDirectory,
    stdio: 'inherit',
  },
);

const waitForPreview = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The preview server has not bound its port yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Astro preview did not become available in five seconds.');
};

try {
  await waitForPreview();
  const capture = spawn(process.execPath, ['scripts/shoot.mjs', '/og', 'og'], {
    cwd: rootDirectory,
    stdio: 'inherit',
    env: {
      ...process.env,
      BASE_URL: baseUrl,
      SHOOT_OUTPUT: path.join(rootDirectory, 'public', 'og.png'),
      SHOOT_WIDTH: '1200',
      SHOOT_HEIGHT: '630',
    },
  });
  const [code] = await once(capture, 'exit');
  if (code !== 0) process.exitCode = code ?? 1;
} finally {
  preview.kill('SIGTERM');
}

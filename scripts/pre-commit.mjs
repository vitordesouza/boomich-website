import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const stagedFiles = execFileSync(
  'git',
  ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter((file) => file && existsSync(file));

if (stagedFiles.length === 0) process.exit(0);

execFileSync(
  'pnpm',
  ['exec', 'prettier', '--write', '--ignore-unknown', ...stagedFiles],
  {
    stdio: 'inherit',
  },
);
execFileSync('git', ['add', '--', ...stagedFiles], { stdio: 'inherit' });

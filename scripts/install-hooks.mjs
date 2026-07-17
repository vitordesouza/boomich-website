import { execFileSync } from 'node:child_process';

try {
  execFileSync('git', ['rev-parse', '--show-toplevel'], { stdio: 'ignore' });
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
    stdio: 'inherit',
  });
} catch {
  // Installing dependencies outside a Git checkout should still work.
}

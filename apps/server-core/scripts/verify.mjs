import { spawnSync } from 'node:child_process';

for (const script of [
  'typecheck',
  'build',
  'lint',
  'test:unit',
  'test:e2e',
  'test:database',
]) {
  const result = spawnSync('npm', ['run', script], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    break;
  }
}

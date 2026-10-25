import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';

function docker(args) {
  const result = spawnSync('docker', args, {
    encoding: 'utf8',
    timeout: 30000,
  });
  if (result.status !== 0)
    throw new Error(
      'Disposable PostgreSQL setup failed. Check that Docker is running and postgres:17-alpine is available.',
    );
  return result.stdout.trim();
}
let container;
let result = 1;
try {
  let databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) {
    const password = randomUUID();
    container = docker([
      'run',
      '--detach',
      '--name',
      `piazza-test-${randomUUID()}`,
      '--publish',
      '127.0.0.1::5432',
      '--tmpfs',
      '/var/lib/postgresql/data:rw,size=256m',
      '--memory',
      '512m',
      '--env',
      'POSTGRES_USER=piazza_test',
      '--env',
      `POSTGRES_PASSWORD=${password}`,
      '--env',
      'POSTGRES_DB=piazza_test',
      'postgres:17-alpine',
    ]);
    if (!/^[a-f0-9]{64}$/.test(container))
      throw new Error('Invalid disposable container identifier.');
    const mapping = docker(['port', container, '5432/tcp']);
    const port = /^127\.0\.0\.1:(\d+)$/.exec(mapping)?.[1];
    if (!port)
      throw new Error(
        'Disposable database did not bind exclusively to localhost.',
      );
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (
        spawnSync(
          'docker',
          [
            'exec',
            container,
            'pg_isready',
            '-U',
            'piazza_test',
            '-d',
            'piazza_test',
          ],
          { stdio: 'ignore', timeout: 3000 },
        ).status === 0
      ) {
        ready = true;
        break;
      }
      await setTimeout(500);
    }
    if (!ready) throw new Error('Disposable PostgreSQL did not become ready.');
    databaseUrl = `postgresql://piazza_test:${password}@127.0.0.1:${port}/piazza_test`;
  }
  result =
    spawnSync('npm', ['run', 'test:integration'], {
      stdio: 'inherit',
      env: { ...process.env, TEST_DATABASE_URL: databaseUrl },
    }).status ?? 1;
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Database verification failed.'}\n`,
  );
} finally {
  if (container && /^[a-f0-9]{64}$/.test(container)) {
    const cleanup = spawnSync('docker', ['rm', '--force', container], {
      stdio: 'ignore',
      timeout: 30000,
    });
    if (cleanup.status !== 0) {
      process.stderr.write(
        `Could not remove disposable container ${container}.\n`,
      );
      result = 1;
    }
  }
}
process.exitCode = result;

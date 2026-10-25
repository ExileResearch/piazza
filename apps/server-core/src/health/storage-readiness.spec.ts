import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { parseRuntimeConfig } from '../configuration/environment.js';
import { StorageReadiness } from './storage-readiness.js';

const fixture = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgres://fixture:unused@127.0.0.1/piazza_test',
  APPWRITE_ENDPOINT: 'https://storage.example.test/v1',
  APPWRITE_PROJECT_ID: 'fixture-project',
  APPWRITE_API_KEY: 'fixture-private-key',
  APPWRITE_BUCKET_ID: 'fixture-bucket',
};
afterEach(() => {
  jest.restoreAllMocks();
});
describe('storage readiness', () => {
  it('requires all storage settings before making any provider request', async () => {
    const spy = jest.spyOn(globalThis, 'fetch');
    expect(
      await new StorageReadiness(
        parseRuntimeConfig({ ...fixture, APPWRITE_BUCKET_ID: '' }),
      ).ready(),
    ).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });
  it('checks bucket metadata with server credentials, a timeout and no redirect following', async () => {
    const spy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));
    expect(
      await new StorageReadiness(parseRuntimeConfig(fixture)).ready(),
    ).toBe(true);
    expect(spy).toHaveBeenCalledWith(
      'https://storage.example.test/v1/storage/buckets/fixture-bucket',
      expect.objectContaining({
        redirect: 'error',
        headers: {
          'X-Appwrite-Project': 'fixture-project',
          'X-Appwrite-Key': 'fixture-private-key',
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });
  it.each([401, 403, 404, 500, 503])(
    'is unready for provider status %s',
    async (status) => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          new Response('private provider diagnostic', { status }),
        );
      expect(
        await new StorageReadiness(parseRuntimeConfig(fixture)).ready(),
      ).toBe(false);
    },
  );
  it('treats network failures, redirects and timeouts as unavailable without returning their details', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('private provider diagnostics'));
    expect(
      await new StorageReadiness(parseRuntimeConfig(fixture)).ready(),
    ).toBe(false);
  });
});

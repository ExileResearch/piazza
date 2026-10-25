import { Inject, Injectable } from '@nestjs/common';
import { RUNTIME_CONFIG } from '../configuration/environment.js';
import type { RuntimeConfig } from '../configuration/environment.js';

/** Metadata-only bucket permission check; failures and provider responses are never exposed or logged. */
@Injectable()
export class StorageReadiness {
  constructor(@Inject(RUNTIME_CONFIG) private readonly config: RuntimeConfig) {}
  async ready(): Promise<boolean> {
    const { endpoint, projectId, apiKey, bucketId } = this.config.storage;
    if (!endpoint || !projectId || !apiKey || !bucketId) return false;
    try {
      const url = `${endpoint.replace(/\/$/, '')}/storage/buckets/${encodeURIComponent(bucketId)}`;
      const response = await fetch(url, {
        headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
        signal: AbortSignal.timeout(this.config.dependencyTimeoutMs),
        redirect: 'error',
      });
      // Metadata is not needed; cancel the body instead of retaining provider content.
      await response.body?.cancel();
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

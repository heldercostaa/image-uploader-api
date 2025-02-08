import { randomUUID } from 'node:crypto';
import { makeUploadFactory } from '@/test/factories/make-upload';
import { describe, it } from 'vitest';
import { exportUploadsService } from './export-uploads';

describe('export uploads', () => {
  it('should be able to export uploads', async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload2 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload3 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload4 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload5 = await makeUploadFactory({ name: `${namePattern}.webp` });

    const sut = await exportUploadsService({
      searchQuery: namePattern,
    });
  });
});

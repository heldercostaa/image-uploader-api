import { randomUUID } from 'node:crypto';
import { isRight, unwrapEither } from '@/shared/either';
import * as upload from '@/storage/upload-file';
import { makeUploadFactory } from '@/test/factories/make-upload';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { exportUploadsService } from './export-uploads';

describe('export uploads', () => {
  it('should be able to export uploads', async () => {
    const uploadStub = vi.spyOn(upload, 'uploadFile').mockImplementationOnce(async () => {
      return {
        key: `${randomUUID()}.csv`,
        url: 'http://example.com/file.csv',
      };
    });

    const namePattern = randomUUID();

    const upload1 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload2 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload3 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload4 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload5 = await makeUploadFactory({ name: `${namePattern}.webp` });

    const sut = await exportUploadsService({
      searchQuery: namePattern,
    });

    const generatedCSVStream = uploadStub.mock.calls[0][0].contentStream;

    const csvAsString = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];

      generatedCSVStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      generatedCSVStream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      generatedCSVStream.on('error', (error) => reject(error));
    });

    const csvAsArray = csvAsString
      .trim()
      .split('\n')
      .map((row) => row.split(','));

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut)).toEqual({
      reportUrl: 'http://example.com/file.csv',
    });
    expect(csvAsArray).toEqual([
      ['ID', 'Name', 'URL', 'Uploaded At'],
      [upload1.id, upload1.name, upload1.remoteUrl, expect.any(String)],
      [upload2.id, upload2.name, upload2.remoteUrl, expect.any(String)],
      [upload3.id, upload3.name, upload3.remoteUrl, expect.any(String)],
      [upload4.id, upload4.name, upload4.remoteUrl, expect.any(String)],
      [upload5.id, upload5.name, upload5.remoteUrl, expect.any(String)],
    ]);
  });
});

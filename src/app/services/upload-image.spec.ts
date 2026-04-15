import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { db } from '@/db';
import { schema } from '@/db/schemas';
import { isLeft, isRight, unwrapEither } from '@/shared/either';
import { InvalidFileFormat } from './errors/invalid-file-format';
import { uploadImageService } from './upload-image';

describe('upload image', () => {
  beforeAll(() => {
    vi.mock('@/storage/upload-file', () => {
      return {
        uploadFile: vi.fn().mockImplementation(() => {
          return {
            key: `${randomUUID()}.jpg`,
            url: `https://example.com/${randomUUID()}.jpg`,
          };
        }),
      };
    });
  });

  it('should be able to upload an image', async () => {
    const fileName = `${randomUUID()}.jpg`;

    const sut = await uploadImageService({
      fileName,
      contentType: 'image/jpg',
      contentStream: Readable.from([]),
    });

    expect(isRight(sut)).toBe(true);

    const uploads = await db.select().from(schema.uploads).where(eq(schema.uploads.name, fileName));
    expect(uploads).toHaveLength(1);
  });

  it('should not be able to upload an invalid file', async () => {
    const fileName = `${randomUUID()}.pdf`;

    const sut = await uploadImageService({
      fileName,
      contentType: 'document/pdf',
      contentStream: Readable.from([]),
    });

    expect(isLeft(sut)).toBe(true);
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormat);
  });
});

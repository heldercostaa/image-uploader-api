import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { schema } from '@/db/schemas';
import { isRight, unwrapEither } from '@/shared/either';
import { makeUploadFactory } from '@/test/factories/make-upload';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { getUploadsService } from './get-uploads';

describe('get uploads', () => {
  it('should be able to get the uploads', async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload2 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload3 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload4 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload5 = await makeUploadFactory({ name: `${namePattern}.webp` });

    const sut = await getUploadsService({
      searchQuery: namePattern,
    });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toBe(5);
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ]);
  });

  it('should be able to get the uploads with pagination', async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload2 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload3 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload4 = await makeUploadFactory({ name: `${namePattern}.webp` });
    const upload5 = await makeUploadFactory({ name: `${namePattern}.webp` });

    let sut = await getUploadsService({
      searchQuery: namePattern,
      page: 1,
      pageSize: 3,
    });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toBe(5);
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
    ]);

    sut = await getUploadsService({
      searchQuery: namePattern,
      page: 2,
      pageSize: 3,
    });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toBe(5);
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ]);
  });

  it('should be able to get sorted uploads', async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUploadFactory({
      name: `${namePattern}.webp`,
      createdAt: new Date(),
    });

    const upload2 = await makeUploadFactory({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(1, 'day').toDate(),
    });

    const upload3 = await makeUploadFactory({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(2, 'day').toDate(),
    });

    const upload4 = await makeUploadFactory({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(3, 'day').toDate(),
    });

    const upload5 = await makeUploadFactory({
      name: `${namePattern}.webp`,
      createdAt: dayjs().subtract(4, 'day').toDate(),
    });

    let sut = await getUploadsService({
      searchQuery: namePattern,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toBe(5);
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload1.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload5.id }),
    ]);

    sut = await getUploadsService({
      searchQuery: namePattern,
      sortBy: 'createdAt',
      sortDirection: 'asc',
    });

    expect(isRight(sut)).toBe(true);
    expect(unwrapEither(sut).total).toBe(5);
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ]);
  });
});

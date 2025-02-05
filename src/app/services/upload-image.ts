import { Readable } from 'node:stream';
import { db } from '@/db';
import { schema } from '@/db/schemas';
import { type Either, makeLeft, makeRight } from '@/shared/either';
import { uploadFile } from '@/storage/upload-file';
import { z } from 'zod';
import { InvalidFileFormat } from './errors/invalid-file-format';

const uploadImageParams = z.object({
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
});

type UploadImageParams = z.input<typeof uploadImageParams>;

const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

export async function uploadImageService(
  params: UploadImageParams
): Promise<Either<InvalidFileFormat, { url: string }>> {
  const { fileName, contentType, contentStream } = uploadImageParams.parse(params);

  if (!allowedMimeTypes.includes(contentType)) {
    return makeLeft(new InvalidFileFormat());
  }

  const { key, url } = await uploadFile({ folder: 'images', fileName, contentType, contentStream });

  await db.insert(schema.uploads).values({
    name: fileName,
    remoteKey: key,
    remoteUrl: url,
  });

  return makeRight({ url });
}

import { randomUUID } from 'node:crypto';
import { basename, extname } from 'node:path';
import { Readable } from 'node:stream';
import { env } from '@/env';
import { Upload } from '@aws-sdk/lib-storage';
import { z } from 'zod';
import { r2 } from './client';

const uploadFileParams = z.object({
  folder: z.enum(['images', 'downloads']),
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
});

type UploadFileParams = z.input<typeof uploadFileParams>;

export async function uploadFile(params: UploadFileParams) {
  const { folder, fileName, contentType, contentStream } = uploadFileParams.parse(params);

  const fileExtension = extname(fileName);
  const fileBasename = basename(fileName);
  const sanitizedFileName = fileBasename.replace(/[^a-zA-Z0-9]/g, '');
  const sanitizedFileNameWithExtension = sanitizedFileName.concat(fileExtension);

  const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileNameWithExtension}`;

  const upload = new Upload({
    client: r2,
    params: {
      Key: uniqueFileName,
      Bucket: env.CLOUDFLARE_BUCKET,
      Body: contentStream,
      ContentType: contentType,
    },
  });

  await upload.done();

  return {
    key: uniqueFileName,
    url: new URL(uniqueFileName, env.CLOUDFLARE_PUBLIC_URL).toString(),
  };
}

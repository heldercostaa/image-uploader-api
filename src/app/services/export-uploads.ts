import { PassThrough, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { stringify } from 'csv-stringify';
import { ilike } from 'drizzle-orm';
import { z } from 'zod';
import { db, pg } from '@/db';
import { schema } from '@/db/schemas';
import { type Either, makeRight } from '@/shared/either';
import { uploadFile } from '@/storage/upload-file';

const exportUploadsParams = z.object({
  searchQuery: z.string().optional(),
});

type ExportUploadsParams = z.input<typeof exportUploadsParams>;

type ExportUploadsResult = {
  reportUrl: string;
};

export async function exportUploadsService(
  params: ExportUploadsParams
): Promise<Either<never, ExportUploadsResult>> {
  const { searchQuery } = exportUploadsParams.parse(params);

  const { sql, params: queryParams } = db
    .select({
      id: schema.uploads.id,
      name: schema.uploads.name,
      remoteUrl: schema.uploads.remoteUrl,
      createdAt: schema.uploads.createdAt,
    })
    .from(schema.uploads)
    .where(searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined)
    .toSQL();

  const cursor = pg.unsafe(sql, queryParams as string[]).cursor(2);

  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'remote_url', header: 'URL' },
      { key: 'created_at', header: 'Uploaded At' },
    ],
  });

  const uploadToStorageStream = new PassThrough();

  const convertToCsvPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], _encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk);
        }
        callback();
      },
    }),
    csv,
    uploadToStorageStream
  );

  const uploadToStorage = uploadFile({
    contentType: 'text/csv',
    folder: 'downloads',
    fileName: `${new Date().toISOString()}-uploads.csv`,
    contentStream: uploadToStorageStream,
  });

  const [{ url }] = await Promise.all([uploadToStorage, convertToCsvPipeline]);

  await convertToCsvPipeline;

  return makeRight({ reportUrl: url });
}

import { db } from '@/db';
import { schema } from '@/db/schemas';
import { type Either, makeRight } from '@/shared/either';
import { asc, count, desc, ilike } from 'drizzle-orm';
import { z } from 'zod';

const getUploadsParams = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(['createdAt']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(20),
});

type GetUploadsParams = z.input<typeof getUploadsParams>;

type GetUploadsResult = {
  total: number;
  uploads: {
    id: string;
    name: string;
    remoteKey: string;
    remoteUrl: string;
    createdAt: Date;
  }[];
};

export async function getUploadsService(
  params: GetUploadsParams
): Promise<Either<never, GetUploadsResult>> {
  const { searchQuery, sortBy, sortDirection, page, pageSize } = getUploadsParams.parse(params);

  const [uploads, [{ total }]] = await Promise.all([
    db
      .select({
        id: schema.uploads.id,
        name: schema.uploads.name,
        remoteKey: schema.uploads.remoteKey,
        remoteUrl: schema.uploads.remoteUrl,
        createdAt: schema.uploads.createdAt,
      })
      .from(schema.uploads)
      .where(searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined)
      .orderBy((fields) => {
        if (sortBy && sortDirection === 'asc') {
          return asc(fields[sortBy]);
        }

        if (sortBy && sortDirection === 'desc') {
          return desc(fields[sortBy]);
        }

        return desc(fields.id);
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),

    db
      .select({ total: count(schema.uploads.id) })
      .from(schema.uploads)
      .where(searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined),
  ]);

  return makeRight({ uploads, total });
}

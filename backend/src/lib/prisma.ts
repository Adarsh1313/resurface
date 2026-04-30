import { PrismaClient } from '@prisma/client';

// Single shared PrismaClient instance.
// DATABASE_URL (pooled) is used for all queries.
// DATABASE_DIRECT_URL (non-pooled) is used by Prisma Migrate only.
const prisma = new PrismaClient();

export default prisma;

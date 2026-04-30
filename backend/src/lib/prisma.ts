import { PrismaClient } from '@prisma/client';

// Prisma 7: pass the connection URL explicitly via datasourceUrl.
// DATABASE_URL is the direct (non-pooled) Supabase URL.
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export default prisma;

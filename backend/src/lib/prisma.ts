import { PrismaClient } from '@prisma/client';

// Prisma 7: PrismaClient reads DATABASE_URL from the environment automatically.
// The datasource URL is configured in prisma.config.ts for CLI tooling; at
// runtime the client picks it up from process.env.DATABASE_URL directly.
const prisma = new PrismaClient();

export default prisma;

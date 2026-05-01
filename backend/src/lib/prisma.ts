import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 requires a driver adapter for runtime database access.
// The CLI (migrate, generate) uses prisma.config.ts for the URL;
// at runtime we pass the URL via the PrismaPg adapter.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;

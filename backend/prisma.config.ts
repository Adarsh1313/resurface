import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: datasource URL lives here, not in schema.prisma.
// DATABASE_URL should be the DIRECT (non-pooled) Supabase URL so that
// `prisma migrate deploy` works (pgbouncer/Transaction mode blocks DDL).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});

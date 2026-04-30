import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Read from env so prod (Postgres) and dev (SQLite) just swap DATABASE_URL.
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});

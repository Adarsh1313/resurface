import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL and DATABASE_DIRECT_URL are set in .env (local) or the
// host environment (Render). The schema.prisma reads them via env().
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});

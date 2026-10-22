// Local Postgres for development — no Docker or system install needed.
// Runs a real Postgres server from the embedded-postgres npm package and keeps
// its data in backend/.pgdata (gitignored). Leave it running in its own terminal.
//
//   npm run db:local
//
// Matches the DATABASE_URL in .env.example:
//   postgresql://postgres:postgres@localhost:5433/resurface
import path from 'path';
import fs from 'fs';
import EmbeddedPostgres from 'embedded-postgres';

const PORT = 5433; // 5433 so it never collides with a system Postgres on 5432
const DB_NAME = 'resurface';
const dataDir = path.join(__dirname, '..', '.pgdata');

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port: PORT,
    persistent: true,
  });

  const firstRun = !fs.existsSync(path.join(dataDir, 'PG_VERSION'));
  if (firstRun) await pg.initialise();
  await pg.start();
  if (firstRun) await pg.createDatabase(DB_NAME);

  console.log(`Postgres ready on postgresql://postgres:postgres@localhost:${PORT}/${DB_NAME}`);
  if (firstRun) console.log('First run: now run `npx prisma migrate deploy` and `npx prisma db seed`.');

  const shutdown = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

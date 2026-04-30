/**
 * One-time migration: preserves (bookmark_id, topic_id) pairs before the schema
 * switch to many-to-many topics, then writes them back into the join table.
 *
 * Usage:
 *   1. Run with OLD schema (topic_id present): `npx ts-node scripts/migrate-to-multi-topic.ts export`
 *      -> writes pairs to scripts/.topic-pairs.json
 *   2. Update schema to m2m + `npx prisma db push --accept-data-loss --schema=prisma/schema.prisma`
 *   3. Run again with NEW schema: `npx ts-node scripts/migrate-to-multi-topic.ts import`
 */
import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma';

const FILE = path.join(__dirname, '.topic-pairs.json');

async function exportPairs() {
  const rows = await prisma.$queryRawUnsafe<{ id: string; topic_id: string | null }[]>(
    `SELECT id, topic_id FROM bookmarks WHERE topic_id IS NOT NULL`
  );
  fs.writeFileSync(FILE, JSON.stringify(rows, null, 2));
  console.log(`Exported ${rows.length} bookmark-topic pairs to ${FILE}`);
}

async function importPairs() {
  if (!fs.existsSync(FILE)) {
    console.log('No pairs file found, skipping');
    return;
  }
  const pairs: { id: string; topic_id: string }[] = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  let ok = 0;
  for (const p of pairs) {
    try {
      await prisma.bookmark.update({
        where: { id: p.id },
        data: { topics: { connect: { id: p.topic_id } } },
      });
      ok++;
    } catch {
      // bookmark or topic was deleted — skip
    }
  }
  console.log(`Restored ${ok}/${pairs.length} bookmark-topic associations`);
}

const cmd = process.argv[2];
if (cmd === 'export') exportPairs().finally(() => prisma.$disconnect());
else if (cmd === 'import') importPairs().finally(() => prisma.$disconnect());
else console.log('Usage: ... export | import');

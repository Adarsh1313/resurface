import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create demo user
  const password_hash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@resurface.app' },
    update: {},
    create: {
      email: 'demo@resurface.app',
      name: 'Arjun',
      password_hash,
    },
  });

  // Use the seeding machine's timezone so the demo's evening saves read as evenings.
  await prisma.user.update({
    where: { id: user.id },
    data: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' },
  });
  console.log('Created user:', user.email);

  // Create topics
  const topicData = [
    { name: 'AI', color: '#8B5CF6' },
    { name: 'Entrepreneurship', color: '#F59E0B' },
    { name: 'Fitness', color: '#EF4444' },
    { name: 'Productivity', color: '#3B82F6' },
    { name: 'Programming', color: '#06B6D4' },
    { name: 'Finance', color: '#10B981' },
    { name: 'Design', color: '#EC4899' },
    { name: 'Health', color: '#14B8A6' },
    { name: 'Cooking', color: '#F97316' },
    { name: 'Science', color: '#6366F1' },
  ];

  const topics: Record<string, string> = {};
  for (const t of topicData) {
    const topic = await prisma.topic.upsert({
      where: { user_id_name: { user_id: user.id, name: t.name } },
      update: {},
      create: { user_id: user.id, name: t.name, color: t.color },
    });
    topics[t.name] = topic.id;
  }

  console.log('Created', Object.keys(topics).length, 'topics');

  // Create bookmarks
  const bookmarks = [
    { url: 'https://x.com/sama/status/1829384710293', platform: 'x', title: 'AGI timeline predictions and what it means for builders', author: '@sama', topic: 'AI', daysAgo: 0 },
    { url: 'https://x.com/elonmusk/status/9283710293847', platform: 'x', title: 'Thoughts on multiplanetary civilization', author: '@elonmusk', topic: 'Science', daysAgo: 1 },
    { url: 'https://youtube.com/watch?v=sleep123', platform: 'youtube', title: 'The Science of Sleep — Why 8 Hours Is Not Enough', author: 'Andrew Huberman', topic: 'Health', daysAgo: 1, duration: 3720 },
    { url: 'https://youtube.com/watch?v=react456', platform: 'youtube', title: 'React Server Components — The Complete Guide', author: 'Theo', topic: 'Programming', daysAgo: 2, duration: 2400 },
    { url: 'https://x.com/naval/status/182938471029', platform: 'x', title: 'Thread on wealth creation and leverage', author: '@naval', topic: 'Entrepreneurship', daysAgo: 3 },
    { url: 'https://youtube.com/watch?v=workout789', platform: 'youtube', title: 'Full Body Workout — No Equipment (45 min)', author: 'Jeff Nippard', topic: 'Fitness', daysAgo: 4, duration: 2700 },
    { url: 'https://x.com/paulg/status/827364918273', platform: 'x', title: 'Why founders should do things that don\'t scale', author: '@paulg', topic: 'Entrepreneurship', daysAgo: 5 },
    { url: 'https://youtube.com/watch?v=design101', platform: 'youtube', title: 'UI Design Fundamentals Every Developer Should Know', author: 'Juxtopposed', topic: 'Design', daysAgo: 6, duration: 1800, status: 'snoozed' },
    { url: 'https://x.com/karpathy/status/19283746182', platform: 'x', title: 'Why transformers are eating the world — long thread', author: '@karpathy', topic: 'AI', daysAgo: 6, status: 'reviewed' },
    { url: 'https://youtube.com/watch?v=brain789', platform: 'youtube', title: 'How to Build a Second Brain (complete guide)', author: 'Ali Abdaal', topic: 'Productivity', daysAgo: 6, duration: 2100, status: 'reviewed' },
    { url: 'https://youtube.com/watch?v=etf456', platform: 'youtube', title: 'Index Funds vs ETFs — What Nobody Tells You', author: 'Graham Stephan', topic: 'Finance', daysAgo: 8, duration: 960, status: 'reviewed' },
    { url: 'https://x.com/jasonfried/status/8172634918', platform: 'x', title: 'Remote work is not a trend, it is the future of work', author: '@jasonfried', topic: 'Productivity', daysAgo: 11, status: 'reviewed' },
    { url: 'https://youtube.com/watch?v=bread101', platform: 'youtube', title: 'Perfect Sourdough Bread — Beginner Friendly', author: 'Joshua Weissman', topic: 'Cooking', daysAgo: 8, duration: 1200, status: 'snoozed' },
  ];

  const now = new Date();
  for (const b of bookmarks) {
    const saved_at = new Date(now.getTime() - b.daysAgo * 24 * 60 * 60 * 1000);
    await prisma.bookmark.create({
      data: {
        user_id: user.id,
        url: b.url,
        platform: b.platform,
        title: b.title,
        author: b.author,
        topics: { connect: { id: topics[b.topic] } },
        status: b.status || 'pending',
        saved_at,
        duration_seconds: b.duration || null,
        reviewed_at: b.status === 'reviewed' ? saved_at : null,
      },
    });
  }

  console.log('Created', bookmarks.length, 'bookmarks');

  // ── 10 weeks of history so the dashboard insights have something to show ──
  // Deterministic PRNG so every seed produces the same demo.
  let s = 42;
  const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  const sources: { platform: 'x' | 'youtube'; author: string; topic: string; titles: string[] }[] = [
    { platform: 'x', author: '@naval', topic: 'Entrepreneurship', titles: ['On specific knowledge', 'Leverage is a force multiplier', 'How to get rich without getting lucky', 'Play long-term games with long-term people'] },
    { platform: 'x', author: '@karpathy', topic: 'AI', titles: ['Software 3.0 thread', 'Notes on training small LLMs', 'Vibe coding, a retrospective', 'Tokenization is the root of all evil'] },
    { platform: 'x', author: '@sama', topic: 'AI', titles: ['The intelligence age', 'Reflections on scaling', 'What I wish I knew at 25'] },
    { platform: 'x', author: '@levelsio', topic: 'Entrepreneurship', titles: ['How I ship 12 startups a year', 'My $0 tech stack', 'Pricing lessons from Photo AI'] },
    { platform: 'x', author: '@dan_abramov', topic: 'Programming', titles: ['Server components mental model', 'Why I stopped using useEffect for data'] },
    { platform: 'youtube', author: 'Andrew Huberman', topic: 'Health', titles: ['Master your sleep and be more alert', 'Dopamine and motivation', 'The science of focus'] },
    { platform: 'youtube', author: 'Jeff Nippard', topic: 'Fitness', titles: ['The most effective push day', 'Science-based full body routine', 'How to build muscle after 30'] },
    { platform: 'youtube', author: 'Fireship', topic: 'Programming', titles: ['Bun in 100 seconds', 'Every React concept explained', 'Postgres is all you need'] },
    { platform: 'youtube', author: 'Ali Abdaal', topic: 'Productivity', titles: ['How I manage my time', 'The 3-hour focus system', 'Feel-good productivity'] },
    { platform: 'youtube', author: 'Two Minute Papers', topic: 'AI', titles: ['This AI learned to walk', 'Video generation just leveled up'] },
  ];

  // Saves cluster on weekday nights; reviews happen mostly on weekend mornings.
  const eveningHours = [21, 22, 22, 23, 23, 0, 13, 8];
  const historyIds: string[] = [];
  for (let i = 0; i < 90; i++) {
    const src = pick(sources);
    const daysAgo = Math.floor(rand() * 70) + 1;
    const saved_at = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    saved_at.setHours(pick(eveningHours), Math.floor(rand() * 60), 0, 0);
    // Recent AI saves grow; old fitness saves never get reviewed (topic drift + graveyard).
    if (src.topic === 'AI' && daysAgo > 35 && rand() < 0.6) continue;
    const reviewChance = src.topic === 'Fitness' ? 0.05 : src.platform === 'youtube' ? 0.45 : 0.25;
    const isReviewed = rand() < reviewChance;
    let reviewed_at: Date | null = null;
    if (isReviewed) {
      const lag = 1 + Math.floor(rand() * 10);
      reviewed_at = new Date(saved_at.getTime() + lag * 24 * 60 * 60 * 1000);
      if (reviewed_at > now) reviewed_at = new Date(now.getTime() - 60 * 60 * 1000);
    }
    const status = isReviewed ? 'reviewed' : rand() < 0.08 ? 'snoozed' : 'pending';
    const created = await prisma.bookmark.create({
      data: {
        user_id: user.id,
        url: src.platform === 'x'
          ? `https://x.com/${src.author.slice(1)}/status/${1800000000000 + i}`
          : `https://youtube.com/watch?v=demo${i}`,
        platform: src.platform,
        title: pick(src.titles),
        author: src.author,
        topics: { connect: { id: topics[src.topic] } },
        status,
        saved_at,
        reviewed_at,
        duration_seconds: src.platform === 'youtube' ? 600 + Math.floor(rand() * 5400) : null,
        deleted_at: rand() < 0.04 ? new Date() : null,
      },
    });
    if (status === 'pending' && !created.deleted_at) historyIds.push(created.id);
  }
  console.log('Created history bookmarks');

  // A digest sent this Monday morning: 2 of 5 already cleared.
  const digestIds = historyIds.slice(0, 5);
  await prisma.bookmark.updateMany({
    where: { id: { in: digestIds.slice(0, 2) } },
    data: { status: 'reviewed', reviewed_at: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
  });
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(8, 0, 0, 0);
  await prisma.digestLog.create({
    data: { user_id: user.id, sent_at: monday, bookmark_ids: digestIds.join(','), items_reviewed: 2 },
  });

  console.log('\nDemo credentials: demo@resurface.app / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

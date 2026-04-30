import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
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
        topic_id: topics[b.topic],
        status: b.status || 'pending',
        saved_at,
        duration_seconds: b.duration || null,
        reviewed_at: b.status === 'reviewed' ? saved_at : null,
      },
    });
  }

  console.log('Created', bookmarks.length, 'bookmarks');
  console.log('\nDemo credentials: demo@resurface.app / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

// Realistic demo data for Resurface

const TOPICS = [
  { id: 't1', name: 'Entrepreneurship', count: 14 },
  { id: 't2', name: 'Fitness', count: 8 },
  { id: 't3', name: 'AI & Research', count: 11 },
  { id: 't4', name: 'Design', count: 6 },
  { id: 't5', name: 'Cooking', count: 3 },
  { id: 't6', name: 'Unsorted', count: 4 },
];

const BOOKMARKS = [
  {
    id: 'b1', platform: 'x', status: 'pending',
    title: 'A thread on value-based pricing for early-stage founders — 3 frameworks that actually survive first contact with customers.',
    author: '@sweatystartup', handle: 'Nick Huber',
    topic: 'Entrepreneurship', savedAgo: '2 hours ago', savedISO: '2026-04-18T08:14:00Z',
    excerpt: 'Most founders price by looking at competitors. Wrong. Here are the 3 pricing frameworks I\'ve seen actually work for bootstrapped SaaS — and the one trap that kills deals before they start. 🧵',
    thumb: null,
  },
  {
    id: 'b2', platform: 'youtube', status: 'pending',
    title: 'Full Body Workout — No Equipment (45 min, science-based)',
    author: 'Jeff Nippard', handle: 'Jeff Nippard',
    topic: 'Fitness', savedAgo: '5 hours ago', savedISO: '2026-04-18T05:02:00Z',
    excerpt: 'A full 45-minute full-body routine designed around compound movements, with recommended RPE and progression notes. No equipment needed beyond a mat.',
    thumb: null, duration: '45:12',
  },
  {
    id: 'b3', platform: 'x', status: 'pending',
    title: 'The unreasonable effectiveness of writing your LLM eval set by hand before you build anything.',
    author: '@HamelHusain', handle: 'Hamel Husain',
    topic: 'AI & Research', savedAgo: '1 day ago', savedISO: '2026-04-17T11:30:00Z',
    excerpt: 'Everyone wants to jump to fine-tuning. Start with 20 real examples, written by you, in a spreadsheet. It will change how you think about the problem.',
    thumb: null, reminder: 'Fri, Apr 24 · 9:00am',
  },
  {
    id: 'b4', platform: 'youtube', status: 'pending',
    title: 'How I designed a 50,000-subscriber newsletter — typography decisions explained',
    author: 'Tobias Frere-Jones', handle: 'Tobias Frere-Jones',
    topic: 'Design', savedAgo: '2 days ago', savedISO: '2026-04-16T14:00:00Z',
    excerpt: 'A deep dive into choosing a single serif face for a long-form newsletter. Why Mercury beat out 6 alternatives, and the 4 tests we ran.',
    thumb: null, duration: '22:08',
  },
  {
    id: 'b5', platform: 'x', status: 'pending',
    title: 'Three questions I ask every founder before I invest a dollar. Most fail #2.',
    author: '@jasonlk', handle: 'Jason Lemkin',
    topic: 'Entrepreneurship', savedAgo: '3 days ago', savedISO: '2026-04-15T09:15:00Z',
    excerpt: 'Quality of revenue matters more than quantity. I want to know: who renewed last month? who churned? and — the question nobody answers well — why?',
    thumb: null,
  },
  {
    id: 'b6', platform: 'youtube', status: 'reviewed',
    title: 'Zone 2 cardio explained: why 80% of your training should feel this easy',
    author: 'Peter Attia, MD', handle: 'Peter Attia',
    topic: 'Fitness', savedAgo: '4 days ago', savedISO: '2026-04-14T18:20:00Z',
    excerpt: 'Mitochondrial density, lactate threshold, and the one talk test that tells you whether you\'re actually in Zone 2 or kidding yourself.',
    thumb: null, duration: '18:34',
  },
  {
    id: 'b7', platform: 'x', status: 'pending',
    title: 'A short note on why I think GPT-5 still can\'t do research mathematics in the way a grad student can.',
    author: '@tylercowen', handle: 'Tyler Cowen',
    topic: 'AI & Research', savedAgo: '4 days ago', savedISO: '2026-04-14T07:00:00Z',
    excerpt: 'The models are astonishing at lookup, synthesis, and pattern-match. They are not yet good at sustained attention on a single conjecture for weeks.',
    thumb: null,
  },
  {
    id: 'b8', platform: 'youtube', status: 'snoozed',
    title: 'A quiet tour of the MUJI design archive — 40 years of quiet objects',
    author: 'Kenya Hara', handle: 'Kenya Hara',
    topic: 'Design', savedAgo: '5 days ago', savedISO: '2026-04-13T16:00:00Z',
    excerpt: 'A slow, deliberate walkthrough of the archive. No narration for the first 9 minutes — just objects on shelves, under fluorescent light.',
    thumb: null, duration: '32:45',
  },
  {
    id: 'b9', platform: 'x', status: 'reviewed',
    title: 'If your landing page doesn\'t answer these 4 questions above the fold, rewrite it tonight.',
    author: '@julian', handle: 'Julian Shapiro',
    topic: 'Entrepreneurship', savedAgo: '6 days ago', savedISO: '2026-04-12T12:00:00Z',
    excerpt: 'What is it. Who is it for. What changes after I use it. Why you over the incumbent. Miss one and your conversion will be terrible.',
    thumb: null,
  },
  {
    id: 'b10', platform: 'youtube', status: 'pending',
    title: 'The best pan I\'ve cooked with in 10 years, and it costs $24',
    author: 'Kenji López-Alt', handle: 'Kenji López-Alt',
    topic: 'Cooking', savedAgo: '1 week ago', savedISO: '2026-04-11T20:00:00Z',
    excerpt: 'Carbon steel, properly seasoned, beats every non-stick I\'ve tested. A 6-minute demonstration of why, with eggs, fish, and a stir fry.',
    thumb: null, duration: '6:12',
  },
  {
    id: 'b11', platform: 'x', status: 'snoozed',
    title: 'A short reading list on cooperative game theory that isn\'t Schelling.',
    author: '@patrickc', handle: 'Patrick Collison',
    topic: 'Unsorted', savedAgo: '1 week ago', savedISO: '2026-04-11T10:00:00Z',
    excerpt: '5 papers, a book, and one extended essay. You won\'t finish this in a weekend — and you shouldn\'t try.',
    thumb: null,
  },
  {
    id: 'b12', platform: 'x', status: 'pending',
    title: 'The one small UX decision that increased our activation 2.4x',
    author: '@rauchg', handle: 'Guillermo Rauch',
    topic: 'Design', savedAgo: '1 week ago', savedISO: '2026-04-11T08:30:00Z',
    excerpt: 'We moved the "create your first project" button from the header into an empty state inside the dashboard. That\'s it. 2.4x.',
    thumb: null, reminder: 'Mon, Apr 21 · 8:00am',
  },
];

const STATS = {
  savedThisWeek: 12,
  savedLastWeek: 9,
  pendingReview: 28,
  topTopic: 'Entrepreneurship',
  reviewStreak: 3,
  // sparkline data — saves per day over last 14 days
  spark: [2, 1, 3, 0, 4, 2, 5, 3, 1, 4, 2, 6, 3, 4],
  reviewSpark: [1, 0, 2, 1, 0, 1, 3, 2, 0, 1, 2, 1, 2, 1],
};

Object.assign(window, { TOPICS, BOOKMARKS, STATS });

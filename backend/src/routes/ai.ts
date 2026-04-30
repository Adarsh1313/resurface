import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const suggestTopicSchema = z.object({
  title: z.string().min(1),
  platform: z.string().min(1),
  author: z.string().optional(),
});

const KEYWORD_RULES: Record<string, string[]> = {
  Fitness: ['workout', 'exercise', 'gym', 'muscle', 'cardio', 'yoga', 'stretching', 'hiit', 'body', 'weight'],
  Programming: ['code', 'programming', 'developer', 'react', 'javascript', 'typescript', 'python', 'api', 'database', 'software', 'engineer', 'frontend', 'backend', 'web dev', 'tutorial'],
  AI: ['ai', 'artificial intelligence', 'gpt', 'llm', 'machine learning', 'neural', 'transformer', 'agi', 'chatgpt', 'claude', 'deep learning'],
  Entrepreneurship: ['startup', 'founder', 'business', 'saas', 'pricing', 'revenue', 'growth', 'venture', 'bootstrapped', 'indie hacker'],
  Finance: ['investing', 'stocks', 'etf', 'index fund', 'crypto', 'money', 'budget', 'wealth', 'portfolio', 'retirement'],
  Productivity: ['productivity', 'habits', 'focus', 'time management', 'workflow', 'notion', 'second brain', 'pkm', 'note-taking'],
  Design: ['design', 'ui', 'ux', 'figma', 'typography', 'color', 'layout', 'css', 'responsive', 'accessibility'],
  Health: ['health', 'sleep', 'nutrition', 'diet', 'mental health', 'meditation', 'stress', 'wellness'],
  Science: ['science', 'physics', 'biology', 'chemistry', 'research', 'space', 'quantum', 'climate', 'evolution'],
  Cooking: ['cooking', 'recipe', 'food', 'kitchen', 'baking', 'meal prep', 'chef', 'restaurant'],
};

function scoreCategories(title: string, platform: string): Record<string, number> {
  const lower = title.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(KEYWORD_RULES)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        score++;
      }
    }
    if (score > 0) {
      scores[category] = score;
    }
  }

  // Boost Fitness for YouTube videos with duration-like patterns (e.g. "10 min", "30min", "1 hour")
  if (platform.toLowerCase() === 'youtube' && /\d+\s*min|hour/i.test(title)) {
    scores['Fitness'] = (scores['Fitness'] || 0) + 2;
  }

  return scores;
}

router.post('/suggest-topic', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = suggestTopicSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { title, platform } = parsed.data;

    const scores = scoreCategories(title, platform);

    // Boost categories that match user's existing topics
    const userTopics = await prisma.topic.findMany({
      where: { user_id: req.user!.id },
      select: { name: true },
    });

    const userTopicNames = userTopics.map((t) => t.name.toLowerCase());

    for (const category of Object.keys(scores)) {
      if (userTopicNames.includes(category.toLowerCase())) {
        scores[category] += 2;
      }
    }

    // Only surface categories that clearly match. Score >= 1 passes but if the
    // top is a clear winner (>= 2x second), return just one. Otherwise up to 3,
    // and drop low-confidence tail entries so we don't overfit.
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    let suggestions: string[] = [];
    if (ranked.length > 0) {
      const topScore = ranked[0][1];
      // Keep entries whose score is at least 50% of the top score, min threshold 1
      const kept = ranked.filter(([, s]) => s >= Math.max(1, topScore * 0.5));
      suggestions = kept.slice(0, 3).map(([c]) => c);
    }

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

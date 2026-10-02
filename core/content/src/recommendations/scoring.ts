/**
 * GoalMills Content Recommendation Scoring
 */

export interface ScoredArticleCandidate {
  id: string;
  category: string;
  tags: string[];
  publishedAt: Date | string | number;
  viewCount?: number;
}

export function calculateRecommendationScore(
  candidate: ScoredArticleCandidate,
  target: { category: string; tags: string[] }
): number {
  let score = 0;

  // Category match (+50 points)
  if (candidate.category.toLowerCase() === target.category.toLowerCase()) {
    score += 50;
  }

  // Tag overlap (+15 points per matching tag)
  const matchingTags = candidate.tags.filter((t) =>
    target.tags.map((x) => x.toLowerCase()).includes(t.toLowerCase())
  );
  score += matchingTags.length * 15;

  // Recency decay (articles within last 48 hours get up to +20 points)
  const ageHours = (Date.now() - new Date(candidate.publishedAt).getTime()) / (1000 * 60 * 60);
  if (ageHours < 48) {
    score += Math.max(0, Math.round(20 * (1 - ageHours / 48)));
  }

  return score;
}

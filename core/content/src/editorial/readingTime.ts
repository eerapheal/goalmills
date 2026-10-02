/**
 * GoalMills Editorial Reading Time Estimator
 */

export interface ReadingTimeResult {
  minutes: number;
  words: number;
  text: string;
}

export function estimateReadingTime(content: string, wordsPerMinute = 200): ReadingTimeResult {
  if (!content) {
    return { minutes: 1, words: 0, text: '1 min read' };
  }
  const cleanContent = content.replace(/<[^>]*>/g, ' '); // Strip HTML tags
  const words = cleanContent.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return {
    minutes,
    words,
    text: `${minutes} min read`,
  };
}

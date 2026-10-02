/**
 * GoalMills Editorial Taxonomy & Categories
 */

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  sport?: string;
  icon?: string;
  description?: string;
}

export const CANONICAL_CONTENT_CATEGORIES: ContentCategory[] = [
  { id: 'football', name: 'Football', slug: 'football', sport: 'football', icon: '⚽' },
  { id: 'cricket', name: 'Cricket', slug: 'cricket', sport: 'cricket', icon: '🏏' },
  { id: 'basketball', name: 'Basketball', slug: 'basketball', sport: 'basketball', icon: '🏀' },
  { id: 'transfers', name: 'Transfers', slug: 'transfers', icon: '🔄' },
  { id: 'tactical-analysis', name: 'Tactical Analysis', slug: 'tactical-analysis', icon: '📊' },
  { id: 'betting-insights', name: 'Betting & Predictions', slug: 'betting-insights', icon: '🎯' },
];

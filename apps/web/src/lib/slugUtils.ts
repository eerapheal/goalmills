/**
 * Slug and SEO URL utilities for GoalMills
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (é → e, ü → u)
    .replace(/[^\w\s-]/g, '') // remove non-word chars except spaces & hyphens
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores into single dash
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

export interface SlugIdentifiable {
  _id?: string | { toString(): string };
  id?: string;
  slug?: string;
  title?: string;
}

/**
 * Returns canonical news article URL using slug for optimal SEO performance
 */
export function getNewsUrl(item?: SlugIdentifiable | string | null): string {
  if (!item) return '/news';
  if (typeof item === 'string') {
    return `/news/${item}`;
  }

  const slug = item.slug || (item.title ? slugify(item.title) : '') || item._id?.toString() || item.id;
  return slug ? `/news/${slug}` : '/news';
}

/**
 * Returns the primary slug or id string for an article
 */
export function getNewsSlug(item?: SlugIdentifiable | string | null): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.slug || (item.title ? slugify(item.title) : '') || item._id?.toString() || item.id || '';
}

// ─── Football-Specific Slug Utilities ──────────────────────────────────────────

/**
 * Build a match slug:  home-team-vs-away-team-YYYY-MM-DD-eventKey
 * e.g. "arsenal-vs-manchester-city-2026-08-31-12345"
 */
export function buildMatchSlug(match: {
  event_home_team?: string;
  event_away_team?: string;
  event_date?: string;
  event_key?: string | number;
}): string {
  const home = slugify(match.event_home_team || 'home');
  const away = slugify(match.event_away_team || 'away');
  const date = match.event_date || new Date().toISOString().split('T')[0];
  const key = match.event_key || '0';
  return `${home}-vs-${away}-${date}-${key}`;
}

/**
 * Extract the event key (numeric ID) from a match slug.
 * e.g. "arsenal-vs-manchester-city-2026-08-31-12345" → "12345"
 */
export function extractEventKeyFromSlug(slug: string): string {
  // Match pattern: ...-YYYY-MM-DD-{eventKey}
  const match = slug.match(/-(\d{4}-\d{2}-\d{2})-(\d+)$/);
  if (match) return match[2];

  // Fallback: last numeric segment
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  if (/^\d+$/.test(lastPart)) return lastPart;

  return slug; // Last resort: treat entire slug as ID
}

/**
 * Football route helpers — canonical URL builders
 */
export const footballRoutes = {
  match: (slug: string) => `/football/matches/${slug}`,
  matchFromEvent: (match: {
    event_home_team?: string;
    event_away_team?: string;
    event_date?: string;
    event_key?: string | number;
  }) => `/football/matches/${buildMatchSlug(match)}`,

  team: (slug: string) => `/football/teams/${slug}`,
  teamFromName: (name: string) => `/football/teams/${slugify(name)}`,

  player: (slug: string) => `/football/players/${slug}`,
  playerFromName: (name: string) => `/football/players/${slugify(name)}`,

  coach: (slug: string) => `/football/coaches/${slug}`,
  coachFromName: (name: string) => `/football/coaches/${slugify(name)}`,

  official: (slug: string) => `/football/officials/${slug}`,
  officialFromName: (name: string) => `/football/officials/${slugify(name)}`,

  competition: (slug: string) => `/football/${slug}`,
};


/**
 * Slug and SEO URL utilities for GoalMills
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
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

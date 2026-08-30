/**
 * Utility functions for slugifying and formatting news URLs in mobile.
 */

export function slugify(text?: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getNewsTarget(item?: { id?: string; _id?: string; slug?: string; title?: string } | null): string {
  if (!item) return '';
  if (item.slug && item.slug.trim()) return item.slug.trim();
  if (item.title && item.title.trim()) {
    const s = slugify(item.title);
    if (s) return s;
  }
  return item._id || item.id || '';
}

import {
  ALL_COMPETITIONS,
  COMPETITION_CATEGORY_LABELS,
  CompetitionCategory,
  CompetitionEntry,
} from '../competitionCategories';

export interface CompetitionDirectoryGroup {
  category: CompetitionCategory;
  title: string;
  icon: string;
  order: number;
  competitions: CompetitionEntry[];
}

/**
 * Returns all 75+ Major Competitions organized into structured regional groups
 * for the Competition Directory, prioritized for African & Global football.
 */
export function getCompetitionDirectoryGroups(): CompetitionDirectoryGroup[] {
  const groups: CompetitionDirectoryGroup[] = [];

  const categoryKeys = Object.keys(
    COMPETITION_CATEGORY_LABELS
  ) as CompetitionCategory[];

  for (const cat of categoryKeys) {
    const meta = COMPETITION_CATEGORY_LABELS[cat];
    const comps = ALL_COMPETITIONS.filter((c) => c.category === cat);

    if (comps.length > 0) {
      groups.push({
        category: cat,
        title: meta.label,
        icon: meta.icon,
        order: meta.order,
        competitions: comps,
      });
    }
  }

  // Sort groups by official order
  return groups.sort((a, b) => a.order - b.order);
}

/**
 * Search across all 75+ competitions by query
 */
export function searchCompetitions(query: string): CompetitionEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_COMPETITIONS;

  return ALL_COMPETITIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  );
}

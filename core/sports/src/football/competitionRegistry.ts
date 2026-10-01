/**
 * Canonical Football Competitions Registry
 */

export interface CanonicalCompetitionMetadata {
  id: string;
  name: string;
  slug: string;
  code: string;
  country: string;
  confederation: 'FIFA' | 'UEFA' | 'CAF' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'OFC';
  tier: 1 | 2 | 3 | 4;
  type: 'DOMESTIC_LEAGUE' | 'DOMESTIC_CUP' | 'CONTINENTAL_CLUB' | 'INTERNATIONAL';
  hasGroups?: boolean;
  hasKnockout?: boolean;
}

export const CANONICAL_MAJOR_COMPETITIONS: Record<string, CanonicalCompetitionMetadata> = {
  'premier-league': {
    id: 'premier-league',
    name: 'Premier League',
    slug: 'premier-league',
    code: 'PL',
    country: 'England',
    confederation: 'UEFA',
    tier: 1,
    type: 'DOMESTIC_LEAGUE',
  },
  'la-liga': {
    id: 'la-liga',
    name: 'La Liga',
    slug: 'la-liga',
    code: 'PD',
    country: 'Spain',
    confederation: 'UEFA',
    tier: 1,
    type: 'DOMESTIC_LEAGUE',
  },
  'uefa-champions-league': {
    id: 'uefa-champions-league',
    name: 'UEFA Champions League',
    slug: 'uefa-champions-league',
    code: 'UCL',
    country: 'Europe',
    confederation: 'UEFA',
    tier: 1,
    type: 'CONTINENTAL_CLUB',
    hasGroups: true,
    hasKnockout: true,
  },
  'caf-champions-league': {
    id: 'caf-champions-league',
    name: 'CAF Champions League',
    slug: 'caf-champions-league',
    code: 'CAF-CL',
    country: 'Africa',
    confederation: 'CAF',
    tier: 1,
    type: 'CONTINENTAL_CLUB',
    hasGroups: true,
    hasKnockout: true,
  },
  'nigeria-premier-league': {
    id: 'nigeria-premier-league',
    name: 'Nigeria Premier Football League',
    slug: 'nigeria-premier-league',
    code: 'NPFL',
    country: 'Nigeria',
    confederation: 'CAF',
    tier: 1,
    type: 'DOMESTIC_LEAGUE',
  },
};

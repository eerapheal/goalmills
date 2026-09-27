import { CanonicalCompetition, CompetitionAgeCategory } from '@goalmills/types';

const U23_REGEX = /\b(u[- ]?23|under[- ]?23)\b/i;
const U21_REGEX = /\b(u[- ]?21|under[- ]?21)\b/i;
const U20_REGEX = /\b(u[- ]?20|under[- ]?20)\b/i;
const U19_REGEX = /\b(u[- ]?19|under[- ]?19)\b/i;
const U18_REGEX = /\b(u[- ]?18|under[- ]?18)\b/i;
const U17_REGEX = /\b(u[- ]?17|under[- ]?17)\b/i;
const U16_REGEX = /\b(u[- ]?16|under[- ]?16)\b/i;
const U15_REGEX = /\b(u[- ]?15|under[- ]?15)\b/i;

/**
 * Authoritatively resolves the age group classification for a football fixture.
 * Priority: Canonical Competition metadata -> Explicit regex tags -> Default (SENIOR).
 */
export function resolveAgeCategory(
  competition?: CanonicalCompetition | null,
  leagueName?: string,
  homeTeamName?: string,
  awayTeamName?: string
): CompetitionAgeCategory {
  // 1. Authoritative: Competition Canonical Metadata
  if (competition) {
    if (competition.ageCategory) {
      return competition.ageCategory;
    }
    if (competition.isSenior) return 'SENIOR';
    if (competition.isYouth) return 'U21';
  }

  // 2. Explicit text markers in tournament name or team names
  const combined = `${leagueName || ''} ${homeTeamName || ''} ${awayTeamName || ''}`;

  if (U23_REGEX.test(combined)) return 'U23';
  if (U21_REGEX.test(combined)) return 'U21';
  if (U20_REGEX.test(combined)) return 'U20';
  if (U19_REGEX.test(combined)) return 'U19';
  if (U18_REGEX.test(combined)) return 'U18';
  if (U17_REGEX.test(combined)) return 'U17';
  if (U16_REGEX.test(combined)) return 'U16';
  if (U15_REGEX.test(combined)) return 'U15';

  // 3. Fallback default: Senior football
  return 'SENIOR';
}

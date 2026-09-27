import { CanonicalCompetition, CompetitionGender } from '@goalmills/types';

const FEMALE_REGEX = /\b(women|womens|women's|wsl|féminine|feminine|femminile|frauen|damas|femenino|femenil|ladies|wfc)\b/i;
const MIXED_REGEX = /\b(mixed)\b/i;

/**
 * Authoritatively resolves the gender classification for a fixture.
 * Priority: Canonical Competition metadata -> Explicit text markers -> Default (MALE).
 */
export function resolveGender(
  competition?: CanonicalCompetition | null,
  leagueName?: string,
  homeTeamName?: string,
  awayTeamName?: string
): CompetitionGender {
  // 1. Authoritative: Competition Canonical Metadata
  if (competition) {
    if (competition.gender) {
      return competition.gender;
    }
    if (competition.isWomens) return 'FEMALE';
    if (competition.isMens) return 'MALE';
  }

  // 2. Explicit text markers in league name or team names
  const combined = `${leagueName || ''} ${homeTeamName || ''} ${awayTeamName || ''}`;

  if (FEMALE_REGEX.test(combined)) {
    return 'FEMALE';
  }

  if (MIXED_REGEX.test(combined)) {
    return 'MIXED';
  }

  // 3. Fallback default
  return 'MALE';
}

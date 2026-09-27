import { CANONICAL_COMPETITIONS, CANONICAL_COMPETITIONS_LIST } from './competitionRegistry';
import { FixtureClassificationStatus } from '@goalmills/types';

/**
 * Bi-directional mapping table between AllSportsAPI provider league IDs (league_key)
 * and GoalMills canonical competition IDs.
 */
export const ALLSPORTS_TO_GOALMILLS_MAP: Record<number, string> = {};
export const GOALMILLS_TO_ALLSPORTS_MAP: Record<string, number> = {};

// Initialize bidirectional maps from canonical registry
for (const comp of CANONICAL_COMPETITIONS_LIST) {
  if (comp.providerId > 0) {
    ALLSPORTS_TO_GOALMILLS_MAP[comp.providerId] = comp.id;
    GOALMILLS_TO_ALLSPORTS_MAP[comp.id] = comp.providerId;
  }
}

/**
 * Strict exact-match dictionary for resolving competitions when providerId is missing/0.
 * Key is lowercase exact normalized string: `${normalizedCountry}:::${normalizedName}`
 * Strictly forbids partial substring matching.
 */
const EXACT_NAME_COUNTRY_MAP = new Map<string, string>();

for (const comp of CANONICAL_COMPETITIONS_LIST) {
  const normCountry = comp.countryName.trim().toLowerCase();
  const normName = comp.name.trim().toLowerCase();
  const normShort = comp.shortName.trim().toLowerCase();

  EXACT_NAME_COUNTRY_MAP.set(`${normCountry}:::${normName}`, comp.id);
  EXACT_NAME_COUNTRY_MAP.set(`${normCountry}:::${normShort}`, comp.id);
  // Also register direct full name if unique
  EXACT_NAME_COUNTRY_MAP.set(`*:::${normName}`, comp.id);
}

// Well-known alias overrides from provider quirks (exact match only)
EXACT_NAME_COUNTRY_MAP.set('england:::premier league', 'ENG-PREMIER-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('england:::championship', 'ENG-CHAMPIONSHIP');
EXACT_NAME_COUNTRY_MAP.set('spain:::la liga', 'ESP-LA-LIGA');
EXACT_NAME_COUNTRY_MAP.set('spain:::primera division', 'ESP-LA-LIGA');
EXACT_NAME_COUNTRY_MAP.set('italy:::serie a', 'ITA-SERIE-A');
EXACT_NAME_COUNTRY_MAP.set('germany:::bundesliga', 'GER-BUNDESLIGA');
EXACT_NAME_COUNTRY_MAP.set('france:::ligue 1', 'FRA-LIGUE-1');
EXACT_NAME_COUNTRY_MAP.set('nigeria:::npfl', 'NGA-NPFL');
EXACT_NAME_COUNTRY_MAP.set('nigeria:::nigeria premier league', 'NGA-NPFL');
EXACT_NAME_COUNTRY_MAP.set('south africa:::premier soccer league', 'ZAF-PSL');
EXACT_NAME_COUNTRY_MAP.set('south africa:::psl', 'ZAF-PSL');
EXACT_NAME_COUNTRY_MAP.set('africa:::caf champions league', 'CAF-CHAMPIONS-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('africa:::caf confederation cup', 'CAF-CONFEDERATION-CUP');
EXACT_NAME_COUNTRY_MAP.set('africa:::africa cup of nations', 'CAF-AFCON');

export interface ProviderResolutionResult {
  competitionId: string | null;
  status: FixtureClassificationStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'NONE';
}

/**
 * Resolves a fixture's canonical GoalMills competitionId deterministically.
 * Rule: Priority goes to providerId (league_key) -> exact match fallback -> UNRESOLVED.
 * Never uses loose substring matching.
 */
export function resolveCompetitionFromProvider(
  leagueKey?: number | string | null,
  leagueName?: string | null,
  countryName?: string | null
): ProviderResolutionResult {
  // Step 1: Resolve by provider league_key (Primary, deterministic)
  if (leagueKey !== undefined && leagueKey !== null) {
    const numericId = typeof leagueKey === 'string' ? parseInt(leagueKey, 10) : leagueKey;
    if (!isNaN(numericId) && numericId > 0) {
      const canonicalId = ALLSPORTS_TO_GOALMILLS_MAP[numericId];
      if (canonicalId && CANONICAL_COMPETITIONS[canonicalId]) {
        return {
          competitionId: canonicalId,
          status: 'RESOLVED',
          confidence: 'HIGH',
        };
      }
    }
  }

  // Step 2: Fallback to exact country + name matching (Never partial substring)
  if (leagueName) {
    const normCountry = (countryName || '').trim().toLowerCase();
    const normName = leagueName.trim().toLowerCase();

    // Check country + name exact match
    if (normCountry) {
      const exactMatch = EXACT_NAME_COUNTRY_MAP.get(`${normCountry}:::${normName}`);
      if (exactMatch && CANONICAL_COMPETITIONS[exactMatch]) {
        return {
          competitionId: exactMatch,
          status: 'RESOLVED',
          confidence: 'MEDIUM',
        };
      }
    }

    // Check global unique exact name
    const globalExactMatch = EXACT_NAME_COUNTRY_MAP.get(`*:::${normName}`);
    if (globalExactMatch && CANONICAL_COMPETITIONS[globalExactMatch]) {
      return {
        competitionId: globalExactMatch,
        status: 'RESOLVED',
        confidence: 'MEDIUM',
      };
    }
  }

  // Step 3: Unresolved — do not guess or pollute
  return {
    competitionId: null,
    status: 'UNRESOLVED',
    confidence: 'NONE',
  };
}

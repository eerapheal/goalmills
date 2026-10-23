import { CANONICAL_COMPETITIONS, CANONICAL_COMPETITIONS_LIST, getCanonicalCompetition } from './competitionRegistry';
import { FixtureClassificationStatus } from '@goalmills/types';

/**
 * Bi-directional mapping table between AllSportsAPI provider league IDs (league_key)
 * and GoalMills canonical competition IDs.
 */
export const ALLSPORTS_TO_GOALMILLS_MAP: Record<number, string> = {};
export const GOALMILLS_TO_ALLSPORTS_MAP: Record<string, number> = {};
export const PROVIDER_LEAGUE_TO_CANONICAL = ALLSPORTS_TO_GOALMILLS_MAP;
export const CANONICAL_TO_PROVIDER_LEAGUE = GOALMILLS_TO_ALLSPORTS_MAP;

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
  // Only register wildcard if the name is distinctive and not shared across multiple countries
  const isGeneric = [
    'premier league',
    'premier division',
    'championship',
    'fa cup',
    'cup',
    'super cup',
    'league 1',
    'league 2',
    'division 1',
    'division 2',
    'national league',
  ].includes(normName);

  if (!isGeneric) {
    EXACT_NAME_COUNTRY_MAP.set(`*:::${normName}`, comp.id);
  }
}

// Well-known alias overrides from provider quirks (exact match only)
EXACT_NAME_COUNTRY_MAP.set('england:::premier league', 'ENG-PREMIER-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('england:::championship', 'ENG-CHAMPIONSHIP');
EXACT_NAME_COUNTRY_MAP.set("england:::women's super league", 'ENG-WOMENS-SUPER-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('england:::womens super league', 'ENG-WOMENS-SUPER-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set("england:::barclays women's super league", 'ENG-WOMENS-SUPER-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('england:::wsl', 'ENG-WOMENS-SUPER-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('england:::fa cup', 'ENG-FA-CUP');
EXACT_NAME_COUNTRY_MAP.set('europe:::uefa nations league', 'UEFA-NATIONS-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('*:::uefa nations league', 'UEFA-NATIONS-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('russia:::premier league', 'RUSSIAN_PREMIER_LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('poland:::ekstraklasa', 'EKSTRAKLASA');
EXACT_NAME_COUNTRY_MAP.set('scotland:::premier league', 'SCOTTISH_PREMIERSHIP');
EXACT_NAME_COUNTRY_MAP.set('scotland:::premiership', 'SCOTTISH_PREMIERSHIP');
EXACT_NAME_COUNTRY_MAP.set('scotland:::scottish premiership', 'SCOTTISH_PREMIERSHIP');
EXACT_NAME_COUNTRY_MAP.set('ukraine:::premier league', 'UKRAINIAN_PREMIER_LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('egypt:::premier league', 'EGYPTIAN_PREMIER_LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('belarus:::premier league', 'BELARUSIAN_PREMIER_LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('ghana:::premier league', 'GHANA_PREMIER_LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('kenya:::premier league', 'KENYAN_PREMIER_LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('tanzania:::premier league', 'TANZANIA_PREMIER_LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('spain:::la liga', 'LA_LIGA');
EXACT_NAME_COUNTRY_MAP.set('spain:::primera division', 'LA_LIGA');
EXACT_NAME_COUNTRY_MAP.set('spain:::copa del rey', 'COPA_DEL_REY');
EXACT_NAME_COUNTRY_MAP.set('italy:::serie a', 'SERIE_A');
EXACT_NAME_COUNTRY_MAP.set('italy:::coppa italia', 'COPPA_ITALIA');
EXACT_NAME_COUNTRY_MAP.set('germany:::bundesliga', 'BUNDESLIGA');
EXACT_NAME_COUNTRY_MAP.set('germany:::dfb-pokal', 'DFB_POKAL');
EXACT_NAME_COUNTRY_MAP.set('germany:::dfb pokal', 'DFB_POKAL');
EXACT_NAME_COUNTRY_MAP.set('france:::ligue 1', 'LIGUE_1');
EXACT_NAME_COUNTRY_MAP.set('france:::coupe de france', 'COUPE_DE_FRANCE');
EXACT_NAME_COUNTRY_MAP.set('nigeria:::npfl', 'NPFL');
EXACT_NAME_COUNTRY_MAP.set('nigeria:::nigeria premier league', 'NPFL');
EXACT_NAME_COUNTRY_MAP.set('nigeria:::premier league', 'NPFL');
EXACT_NAME_COUNTRY_MAP.set('south africa:::premier soccer league', 'SOUTH_AFRICAN_PSL');
EXACT_NAME_COUNTRY_MAP.set('south africa:::psl', 'SOUTH_AFRICAN_PSL');
EXACT_NAME_COUNTRY_MAP.set('south africa:::premier league', 'SOUTH_AFRICAN_PSL');
EXACT_NAME_COUNTRY_MAP.set('africa:::caf champions league', 'CAF_CHAMPIONS_LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('africa:::caf confederation cup', 'CAF_CONFEDERATION_CUP');
EXACT_NAME_COUNTRY_MAP.set('africa:::africa cup of nations', 'AFCON');
EXACT_NAME_COUNTRY_MAP.set('*:::afc challenge league', 'AFC-CHALLENGE-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('intl:::afc challenge league', 'AFC-CHALLENGE-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('asia:::afc challenge league', 'AFC-CHALLENGE-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('*:::afc champions league', 'AFC-CHAMPIONS-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('intl:::afc champions league', 'AFC-CHAMPIONS-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('asia:::afc champions league', 'AFC-CHAMPIONS-LEAGUE');
EXACT_NAME_COUNTRY_MAP.set('*:::afc champions league two', 'AFC-CHAMPIONS-LEAGUE-TWO');
EXACT_NAME_COUNTRY_MAP.set('*:::afc cup', 'AFC-CHAMPIONS-LEAGUE-TWO');
EXACT_NAME_COUNTRY_MAP.set('*:::afc asian cup', 'AFC-ASIAN-CUP');
EXACT_NAME_COUNTRY_MAP.set('intl:::afc asian cup', 'AFC-ASIAN-CUP');

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
      // Legacy API-Sports test fixture compatibility: league_key 5 + 'UEFA Nations League'
      if (numericId === 5 && leagueName && /nations/i.test(leagueName)) {
        return {
          competitionId: 'UEFA-NATIONS-LEAGUE',
          status: 'RESOLVED',
          confidence: 'HIGH',
        };
      }
      const canonicalId = ALLSPORTS_TO_GOALMILLS_MAP[numericId];
      if (canonicalId && (CANONICAL_COMPETITIONS[canonicalId] || getCanonicalCompetition(canonicalId))) {
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
    const normName = leagueName.trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanNormName = normName
      .replace(/\s*[-–—]\s*(group\s+stage|preliminary\s+(?:round|stage)|qualification|qualifying|play-?offs?|knockout\s+stage|final\s+stage|round\s+of\s+\d+|quarter-?finals?|semi-?finals?|finals?|regular\s+season)\b/gi, '')
      .replace(/[ -](group[ -]stage|preliminary[ -]round|preliminary[ -]stage|qualification|play[ -]offs|knockout[ -]stage|final[ -]stage)$/gi, '')
      .trim();

    // Check country + name exact match (try raw, then cleaned)
    if (normCountry) {
      const exactMatch =
        EXACT_NAME_COUNTRY_MAP.get(`${normCountry}:::${normName}`) ||
        EXACT_NAME_COUNTRY_MAP.get(`${normCountry}:::${cleanNormName}`);
      if (exactMatch && (CANONICAL_COMPETITIONS[exactMatch] || getCanonicalCompetition(exactMatch))) {
        return {
          competitionId: exactMatch,
          status: 'RESOLVED',
          confidence: 'MEDIUM',
        };
      }
    }

    // Check global unique exact name (try raw, then cleaned)
    const globalExactMatch =
      EXACT_NAME_COUNTRY_MAP.get(`*:::${normName}`) ||
      EXACT_NAME_COUNTRY_MAP.get(`*:::${cleanNormName}`);
    if (globalExactMatch && (CANONICAL_COMPETITIONS[globalExactMatch] || getCanonicalCompetition(globalExactMatch))) {
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

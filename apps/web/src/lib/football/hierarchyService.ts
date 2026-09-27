import {
  CanonicalCompetition,
  ConfederationCode,
  CompetitionGender,
  CompetitionAgeCategory,
} from '@goalmills/types';
import {
  CANONICAL_COMPETITIONS_LIST,
  getCompetitionsByConfederation,
  getCompetitionsByCountry,
  getCanonicalCompetition,
} from './competitionRegistry';
import { CONFEDERATIONS } from './confederationRegistry';
import {
  CountryDomesticConfig,
  getTop5EuropeConfigs,
  getAfricaDomesticConfigs,
  getCountryDomesticConfig,
} from './countryDomesticConfigs';

export interface ConfederationCompetitionsGroup {
  confederationCode: ConfederationCode;
  name: string;
  slug: string;
  logoUrl: string;
  clubCompetitions: CanonicalCompetition[];
  nationalTeamCompetitions: CanonicalCompetition[];
  womensCompetitions: CanonicalCompetition[];
  youthCompetitions: CanonicalCompetition[];
  qualifierCompetitions: CanonicalCompetition[];
}

export interface EnrichedDomesticSlot {
  competitionId: string;
  role: string;
  displayName: string;
  slug: string;
  competition?: CanonicalCompetition;
}

export interface EnrichedCountryDomesticConfig {
  countryCode: string;
  countryName: string;
  confederationCode: ConfederationCode;
  flagUrl: string;
  priorityRank: number;
  priorityCompetitions: EnrichedDomesticSlot[];
}

export interface FootballHierarchyPayload {
  confederations: Record<ConfederationCode, ConfederationCompetitionsGroup>;
  top5Europe: EnrichedCountryDomesticConfig[];
  africa: {
    cafContinental: CanonicalCompetition[];
    domesticLeagues: EnrichedCountryDomesticConfig[];
  };
  genderBreakdown: {
    mensCount: number;
    womensCount: number;
  };
  ageCategoryBreakdown: {
    seniorCount: number;
    youthCount: number;
  };
}

/**
 * Builds a structured partition for a given confederation.
 */
export function buildConfederationGroup(
  code: ConfederationCode
): ConfederationCompetitionsGroup {
  const confedRecord = CONFEDERATIONS[code];
  const allForConfed = getCompetitionsByConfederation(code);

  const clubCompetitions = allForConfed.filter(
    (c) => (c.isContinental || c.level === 'GLOBAL') && !c.isNationalTeam && !c.isWomens && !c.isYouth
  );

  const nationalTeamCompetitions = allForConfed.filter(
    (c) => c.isNationalTeam && c.isMens && !c.isYouth && c.competitionType !== 'QUALIFIER'
  );

  const womensCompetitions = allForConfed.filter((c) => c.isWomens);

  const youthCompetitions = allForConfed.filter((c) => c.isYouth);

  const qualifierCompetitions = allForConfed.filter((c) => c.competitionType === 'QUALIFIER');

  return {
    confederationCode: code,
    name: confedRecord?.name || code,
    slug: confedRecord?.slug || code.toLowerCase(),
    logoUrl: confedRecord?.logoUrl || '',
    clubCompetitions,
    nationalTeamCompetitions,
    womensCompetitions,
    youthCompetitions,
    qualifierCompetitions,
  };
}

function enrichDomesticConfig(config: CountryDomesticConfig): EnrichedCountryDomesticConfig {
  return {
    ...config,
    priorityCompetitions: config.priorityCompetitions.map((slot) => ({
      ...slot,
      competition: getCanonicalCompetition(slot.competitionId),
    })),
  };
}

/**
 * Builds the complete multi-tier football hierarchy for GoalMills.
 */
export function getCompleteFootballHierarchy(): FootballHierarchyPayload {
  const confederations: Record<ConfederationCode, ConfederationCompetitionsGroup> = {
    FIFA: buildConfederationGroup('FIFA'),
    CAF: buildConfederationGroup('CAF'),
    UEFA: buildConfederationGroup('UEFA'),
    CONMEBOL: buildConfederationGroup('CONMEBOL'),
    CONCACAF: buildConfederationGroup('CONCACAF'),
    AFC: buildConfederationGroup('AFC'),
    OFC: buildConfederationGroup('OFC'),
  };

  const top5Europe = getTop5EuropeConfigs().map(enrichDomesticConfig);
  const africaDomestic = getAfricaDomesticConfigs().map(enrichDomesticConfig);

  const cafContinental = CANONICAL_COMPETITIONS_LIST.filter(
    (c) => c.confederationCode === 'CAF' && (c.isContinental || c.level === 'CONFEDERATION')
  );

  let mensCount = 0;
  let womensCount = 0;
  let seniorCount = 0;
  let youthCount = 0;

  for (const c of CANONICAL_COMPETITIONS_LIST) {
    if (c.isMens) mensCount++;
    if (c.isWomens) womensCount++;
    if (c.isSenior) seniorCount++;
    if (c.isYouth) youthCount++;
  }

  return {
    confederations,
    top5Europe,
    africa: {
      cafContinental,
      domesticLeagues: africaDomestic,
    },
    genderBreakdown: {
      mensCount,
      womensCount,
    },
    ageCategoryBreakdown: {
      seniorCount,
      youthCount,
    },
  };
}

/**
 * Filter competitions dynamically based on multi-dimensional hierarchy criteria.
 * Strict comparison rules prevent cross-category contamination.
 */
export function filterCompetitionsHierarchy(criteria: {
  confederationCode?: ConfederationCode | 'all';
  countryCode?: string | 'all';
  gender?: CompetitionGender | 'all';
  ageCategory?: CompetitionAgeCategory | 'youth' | 'senior' | 'all';
  tier?: number;
}): CanonicalCompetition[] {
  return CANONICAL_COMPETITIONS_LIST.filter((comp) => {
    // 1. Confederation
    if (
      criteria.confederationCode &&
      criteria.confederationCode !== 'all' &&
      comp.confederationCode !== criteria.confederationCode
    ) {
      return false;
    }

    // 2. Country
    if (
      criteria.countryCode &&
      criteria.countryCode !== 'all' &&
      comp.countryCode.toUpperCase() !== criteria.countryCode.toUpperCase()
    ) {
      return false;
    }

    // 3. Gender
    if (criteria.gender && criteria.gender !== 'all' && comp.gender !== criteria.gender) {
      return false;
    }

    // 4. Age Category
    if (criteria.ageCategory && criteria.ageCategory !== 'all') {
      if (criteria.ageCategory === 'youth') {
        if (!comp.isYouth) return false;
      } else if (criteria.ageCategory === 'senior') {
        if (!comp.isSenior) return false;
      } else if (comp.ageCategory !== criteria.ageCategory) {
        return false;
      }
    }

    // 5. Tier
    if (criteria.tier && comp.tier !== criteria.tier) {
      return false;
    }

    return true;
  });
}

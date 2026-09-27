import { ConfederationCode } from '@goalmills/types';

export interface DomesticCompetitionSlot {
  competitionId: string;
  role: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4' | 'DOMESTIC_CUP' | 'LEAGUE_CUP' | 'WOMENS_LEAGUE';
  displayName: string;
  slug: string;
  providerId: number;
}

export interface CountryDomesticConfig {
  countryCode: string;
  countryName: string;
  confederationCode: ConfederationCode;
  flagUrl: string;
  priorityRank: number;
  priorityCompetitions: DomesticCompetitionSlot[];
}

/**
 * Top 5 European Countries — 6 Priority Domestic Competitions per country.
 * Configured flexibly to respect domestic football nuances.
 */
export const TOP_5_EUROPE_DOMESTIC_CONFIGS: Record<string, CountryDomesticConfig> = {
  'GB-ENG': {
    countryCode: 'GB-ENG',
    countryName: 'England',
    confederationCode: 'UEFA',
    flagUrl: 'https://media.api-sports.io/flags/gb.svg',
    priorityRank: 1,
    priorityCompetitions: [
      {
        competitionId: 'ENG-PREMIER-LEAGUE',
        role: 'TIER_1',
        displayName: 'Premier League',
        slug: 'premier-league',
        providerId: 152,
      },
      {
        competitionId: 'ENG-CHAMPIONSHIP',
        role: 'TIER_2',
        displayName: 'EFL Championship',
        slug: 'championship',
        providerId: 153,
      },
      {
        competitionId: 'ENG-LEAGUE-ONE',
        role: 'TIER_3',
        displayName: 'EFL League One',
        slug: 'league-one',
        providerId: 154,
      },
      {
        competitionId: 'ENG-LEAGUE-TWO',
        role: 'TIER_4',
        displayName: 'EFL League Two',
        slug: 'league-two',
        providerId: 155,
      },
      {
        competitionId: 'ENG-FA-CUP',
        role: 'DOMESTIC_CUP',
        displayName: 'FA Cup',
        slug: 'fa-cup',
        providerId: 146,
      },
      {
        competitionId: 'ENG-WOMENS-SUPER-LEAGUE',
        role: 'WOMENS_LEAGUE',
        displayName: "Women's Super League",
        slug: 'womens-super-league',
        providerId: 0,
      },
    ],
  },
  ES: {
    countryCode: 'ES',
    countryName: 'Spain',
    confederationCode: 'UEFA',
    flagUrl: 'https://media.api-sports.io/flags/es.svg',
    priorityRank: 2,
    priorityCompetitions: [
      {
        competitionId: 'ESP-LA-LIGA',
        role: 'TIER_1',
        displayName: 'La Liga (EA Sports)',
        slug: 'la-liga',
        providerId: 302,
      },
      {
        competitionId: 'ESP-SEGUNDA',
        role: 'TIER_2',
        displayName: 'LaLiga Hypermotion',
        slug: 'segunda-division',
        providerId: 301,
      },
      {
        competitionId: 'ESP-PRIMERA-FEDERACION',
        role: 'TIER_3',
        displayName: 'Primera Federación',
        slug: 'primera-federacion',
        providerId: 0,
      },
      {
        competitionId: 'ESP-COPA-DEL-REY',
        role: 'DOMESTIC_CUP',
        displayName: 'Copa del Rey',
        slug: 'copa-del-rey',
        providerId: 300,
      },
      {
        competitionId: 'ESP-SEGUNDA-FEDERACION',
        role: 'TIER_4',
        displayName: 'Segunda Federación',
        slug: 'segunda-federacion',
        providerId: 0,
      },
      {
        competitionId: 'ESP-LIGA-F',
        role: 'WOMENS_LEAGUE',
        displayName: 'Liga F (Women)',
        slug: 'liga-f',
        providerId: 0,
      },
    ],
  },
  IT: {
    countryCode: 'IT',
    countryName: 'Italy',
    confederationCode: 'UEFA',
    flagUrl: 'https://media.api-sports.io/flags/it.svg',
    priorityRank: 3,
    priorityCompetitions: [
      {
        competitionId: 'ITA-SERIE-A',
        role: 'TIER_1',
        displayName: 'Serie A (Enilive)',
        slug: 'serie-a',
        providerId: 207,
      },
      {
        competitionId: 'ITA-SERIE-B',
        role: 'TIER_2',
        displayName: 'Serie BKT',
        slug: 'serie-b',
        providerId: 206,
      },
      {
        competitionId: 'ITA-SERIE-C',
        role: 'TIER_3',
        displayName: 'Serie C NOW',
        slug: 'serie-c',
        providerId: 0,
      },
      {
        competitionId: 'ITA-COPPA-ITALIA',
        role: 'DOMESTIC_CUP',
        displayName: 'Coppa Italia Frecciarossa',
        slug: 'coppa-italia',
        providerId: 205,
      },
      {
        competitionId: 'ITA-COPPA-ITALIA-SERIE-C',
        role: 'DOMESTIC_CUP',
        displayName: 'Coppa Italia Serie C',
        slug: 'coppa-italia-serie-c',
        providerId: 0,
      },
      {
        competitionId: 'ITA-SERIE-A-FEMMINILE',
        role: 'WOMENS_LEAGUE',
        displayName: 'Serie A Femminile',
        slug: 'serie-a-femminile',
        providerId: 0,
      },
    ],
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    confederationCode: 'UEFA',
    flagUrl: 'https://media.api-sports.io/flags/de.svg',
    priorityRank: 4,
    priorityCompetitions: [
      {
        competitionId: 'GER-BUNDESLIGA',
        role: 'TIER_1',
        displayName: 'Bundesliga',
        slug: 'bundesliga',
        providerId: 175,
      },
      {
        competitionId: 'GER-2-BUNDESLIGA',
        role: 'TIER_2',
        displayName: '2. Bundesliga',
        slug: '2-bundesliga',
        providerId: 176,
      },
      {
        competitionId: 'GER-3-LIGA',
        role: 'TIER_3',
        displayName: '3. Liga',
        slug: '3-liga',
        providerId: 0,
      },
      {
        competitionId: 'GER-REGIONALLIGA',
        role: 'TIER_4',
        displayName: 'Regionalliga',
        slug: 'regionalliga',
        providerId: 0,
      },
      {
        competitionId: 'GER-DFB-POKAL',
        role: 'DOMESTIC_CUP',
        displayName: 'DFB-Pokal',
        slug: 'dfb-pokal',
        providerId: 173,
      },
      {
        competitionId: 'GER-FRAUEN-BUNDESLIGA',
        role: 'WOMENS_LEAGUE',
        displayName: 'Frauen-Bundesliga',
        slug: 'frauen-bundesliga',
        providerId: 0,
      },
    ],
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    confederationCode: 'UEFA',
    flagUrl: 'https://media.api-sports.io/flags/fr.svg',
    priorityRank: 5,
    priorityCompetitions: [
      {
        competitionId: 'FRA-LIGUE-1',
        role: 'TIER_1',
        displayName: 'Ligue 1 McDonald’s',
        slug: 'ligue-1',
        providerId: 168,
      },
      {
        competitionId: 'FRA-LIGUE-2',
        role: 'TIER_2',
        displayName: 'Ligue 2 BKT',
        slug: 'ligue-2',
        providerId: 169,
      },
      {
        competitionId: 'FRA-NATIONAL',
        role: 'TIER_3',
        displayName: 'Championnat National',
        slug: 'national',
        providerId: 0,
      },
      {
        competitionId: 'FRA-NATIONAL-2',
        role: 'TIER_4',
        displayName: 'National 2',
        slug: 'championnat-national-2',
        providerId: 0,
      },
      {
        competitionId: 'FRA-COUPE-DE-FRANCE',
        role: 'DOMESTIC_CUP',
        displayName: 'Coupe de France',
        slug: 'coupe-de-france',
        providerId: 166,
      },
      {
        competitionId: 'FRA-DIVISION-1-FEMININE',
        role: 'WOMENS_LEAGUE',
        displayName: 'Arkema Première Ligue (D1)',
        slug: 'division-1-feminine',
        providerId: 0,
      },
    ],
  },
};

/**
 * Africa Priority Domestic League Configurations (16 Nations).
 */
export const AFRICA_DOMESTIC_CONFIGS: Record<string, CountryDomesticConfig> = {
  NG: {
    countryCode: 'NG',
    countryName: 'Nigeria',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/ng.svg',
    priorityRank: 6,
    priorityCompetitions: [
      {
        competitionId: 'NGA-NPFL',
        role: 'TIER_1',
        displayName: 'Nigeria Premier Football League (NPFL)',
        slug: 'npfl',
        providerId: 247,
      },
      {
        competitionId: 'NGA-FEDERATION-CUP',
        role: 'DOMESTIC_CUP',
        displayName: 'President Federation Cup',
        slug: 'nigeria-federation-cup',
        providerId: 0,
      },
    ],
  },
  ZA: {
    countryCode: 'ZA',
    countryName: 'South Africa',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/za.svg',
    priorityRank: 7,
    priorityCompetitions: [
      {
        competitionId: 'ZAF-PSL',
        role: 'TIER_1',
        displayName: 'Betway Premiership (PSL)',
        slug: 'south-african-psl',
        providerId: 288,
      },
      {
        competitionId: 'ZAF-NEDBANK-CUP',
        role: 'DOMESTIC_CUP',
        displayName: 'Nedbank Cup',
        slug: 'nedbank-cup',
        providerId: 0,
      },
    ],
  },
  EG: {
    countryCode: 'EG',
    countryName: 'Egypt',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/eg.svg',
    priorityRank: 8,
    priorityCompetitions: [
      {
        competitionId: 'EGY-PREMIER-LEAGUE',
        role: 'TIER_1',
        displayName: 'Egyptian Premier League',
        slug: 'egyptian-premier-league',
        providerId: 178,
      },
    ],
  },
  MA: {
    countryCode: 'MA',
    countryName: 'Morocco',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/ma.svg',
    priorityRank: 9,
    priorityCompetitions: [
      {
        competitionId: 'MAR-BOTOLA-PRO',
        role: 'TIER_1',
        displayName: 'Botola Pro Inwi',
        slug: 'botola-pro',
        providerId: 233,
      },
    ],
  },
  GH: {
    countryCode: 'GH',
    countryName: 'Ghana',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/gh.svg',
    priorityRank: 10,
    priorityCompetitions: [
      {
        competitionId: 'GHA-PREMIER-LEAGUE',
        role: 'TIER_1',
        displayName: 'Ghana Premier League',
        slug: 'ghanaian-premier-league',
        providerId: 198,
      },
    ],
  },
  DZ: {
    countryCode: 'DZ',
    countryName: 'Algeria',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/dz.svg',
    priorityRank: 11,
    priorityCompetitions: [
      {
        competitionId: 'DZA-LIGUE-1',
        role: 'TIER_1',
        displayName: 'Ligue 1 Mobilis (Algeria)',
        slug: 'algerian-ligue-1',
        providerId: 0,
      },
    ],
  },
  TN: {
    countryCode: 'TN',
    countryName: 'Tunisia',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/tn.svg',
    priorityRank: 12,
    priorityCompetitions: [
      {
        competitionId: 'TUN-LIGUE-1',
        role: 'TIER_1',
        displayName: 'Ligue Professionnelle 1',
        slug: 'tunisian-ligue-1',
        providerId: 0,
      },
    ],
  },
  TZ: {
    countryCode: 'TZ',
    countryName: 'Tanzania',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/tz.svg',
    priorityRank: 13,
    priorityCompetitions: [
      {
        competitionId: 'TZA-PREMIER-LEAGUE',
        role: 'TIER_1',
        displayName: 'Tanzanian Premier League (NBC)',
        slug: 'tanzania-premier-league',
        providerId: 0,
      },
    ],
  },
  CD: {
    countryCode: 'CD',
    countryName: 'DR Congo',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/cd.svg',
    priorityRank: 14,
    priorityCompetitions: [
      {
        competitionId: 'COD-LINAFOOT',
        role: 'TIER_1',
        displayName: 'Linafoot (DR Congo)',
        slug: 'dr-congo-linafoot',
        providerId: 0,
      },
    ],
  },
  CI: {
    countryCode: 'CI',
    countryName: 'Ivory Coast',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/ci.svg',
    priorityRank: 15,
    priorityCompetitions: [
      {
        competitionId: 'CIV-LIGUE-1',
        role: 'TIER_1',
        displayName: 'Ligue 1 (CIV)',
        slug: 'ivory-coast-ligue-1',
        providerId: 0,
      },
    ],
  },
  ZM: {
    countryCode: 'ZM',
    countryName: 'Zambia',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/zm.svg',
    priorityRank: 16,
    priorityCompetitions: [
      {
        competitionId: 'ZMB-SUPER-LEAGUE',
        role: 'TIER_1',
        displayName: 'Zambia Super League',
        slug: 'zambia-super-league',
        providerId: 0,
      },
    ],
  },
  KE: {
    countryCode: 'KE',
    countryName: 'Kenya',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/ke.svg',
    priorityRank: 17,
    priorityCompetitions: [
      {
        competitionId: 'KEN-PREMIER-LEAGUE',
        role: 'TIER_1',
        displayName: 'FKF Premier League (Kenya)',
        slug: 'kenya-premier-league',
        providerId: 0,
      },
    ],
  },
  AO: {
    countryCode: 'AO',
    countryName: 'Angola',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/ao.svg',
    priorityRank: 18,
    priorityCompetitions: [
      {
        competitionId: 'AGO-GIRABOLA',
        role: 'TIER_1',
        displayName: 'Girabola (Angola)',
        slug: 'angola-girabola',
        providerId: 0,
      },
    ],
  },
  UG: {
    countryCode: 'UG',
    countryName: 'Uganda',
    confederationCode: 'CAF',
    flagUrl: 'https://media.api-sports.io/flags/ug.svg',
    priorityRank: 19,
    priorityCompetitions: [
      {
        competitionId: 'UGA-PREMIER-LEAGUE',
        role: 'TIER_1',
        displayName: 'Uganda Premier League',
        slug: 'uganda-premier-league',
        providerId: 0,
      },
    ],
  },
};

export function getTop5EuropeConfigs(): CountryDomesticConfig[] {
  return Object.values(TOP_5_EUROPE_DOMESTIC_CONFIGS).sort((a, b) => a.priorityRank - b.priorityRank);
}

export function getAfricaDomesticConfigs(): CountryDomesticConfig[] {
  return Object.values(AFRICA_DOMESTIC_CONFIGS).sort((a, b) => a.priorityRank - b.priorityRank);
}

export function getCountryDomesticConfig(countryCode: string): CountryDomesticConfig | undefined {
  const code = countryCode.toUpperCase();
  return TOP_5_EUROPE_DOMESTIC_CONFIGS[code] || AFRICA_DOMESTIC_CONFIGS[code];
}

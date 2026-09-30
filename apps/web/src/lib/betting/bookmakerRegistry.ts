import { Bookmaker } from '@goalmills/types';

/**
 * Authoritative Canonical Bookmaker Registry
 * Single Source of Truth for bookmaker identities, branding, country eligibility,
 * and external provider mappings across GoalMills.
 */
export const CANONICAL_BOOKMAKERS: Record<string, Bookmaker> = {
  '1xbet': {
    id: '1xbet',
    slug: '1xbet',
    displayName: '1xBet',
    legalName: '1X Corp N.V.',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://1xbet.com',
    countries: ['ALL'],
    supportedSports: ['football', 'cricket', 'basketball', 'tennis'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: '1xBet',
      betloy: '1xbet',
    },
    priorityRank: 1,
    isFeatured: true,
    rating: 4.8,
    bonusText: '300% Welcome Bonus on First Deposit',
  },
  bet365: {
    id: 'bet365',
    slug: 'bet365',
    displayName: 'bet365',
    legalName: 'Hillside (UK Sports) ENC',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://bet365.com',
    countries: ['UK', 'EU', 'NG', 'GH', 'KE', 'ZA', 'ALL'],
    supportedSports: ['football', 'cricket', 'basketball', 'tennis'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'bet365',
      betloy: 'bet365',
    },
    priorityRank: 2,
    isFeatured: true,
    rating: 4.9,
    bonusText: 'Bet £10 & Get £30 in Free Bets',
  },
  betfair: {
    id: 'betfair',
    slug: 'betfair',
    displayName: 'Betfair',
    legalName: 'Flutter Entertainment plc',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://betfair.com',
    countries: ['UK', 'EU', 'ALL'],
    supportedSports: ['football', 'cricket', 'basketball'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'Betfair',
      betloy: 'betfair',
    },
    priorityRank: 3,
    isFeatured: true,
    rating: 4.7,
    bonusText: 'World Leading Betting Exchange & Sportsbook',
  },
  betano: {
    id: 'betano',
    slug: 'betano',
    displayName: 'Betano',
    legalName: 'Kaizen Gaming International Ltd',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://betano.com',
    countries: ['EU', 'BR', 'NG', 'ALL'],
    supportedSports: ['football', 'basketball', 'tennis'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'Betano',
      betloy: 'betano',
    },
    priorityRank: 4,
    isFeatured: true,
    isSponsored: false,
    rating: 4.6,
    bonusText: 'Official UEFA & FIFA Partner',
  },
  marathon: {
    id: 'marathon',
    slug: 'marathon',
    displayName: 'Marathonbet',
    legalName: 'Panbet Curacao N.V.',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://marathonbet.com',
    countries: ['ALL'],
    supportedSports: ['football', 'cricket', 'basketball'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'Marathon',
      betloy: 'marathon',
    },
    priorityRank: 5,
    rating: 4.5,
    bonusText: '0% Margin on Selected Major Matches',
  },
  betvictor: {
    id: 'betvictor',
    slug: 'betvictor',
    displayName: 'BetVictor',
    legalName: 'BV Gaming Limited',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://betvictor.com',
    countries: ['UK', 'EU', 'ALL'],
    supportedSports: ['football', 'cricket'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'BetVictor',
      betloy: 'betvictor',
    },
    priorityRank: 6,
    rating: 4.4,
    bonusText: 'Best Odds Guaranteed on Football & Racing',
  },
  williamhill: {
    id: 'williamhill',
    slug: 'williamhill',
    displayName: 'William Hill',
    legalName: 'William Hill Global PLC',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://williamhill.com',
    countries: ['UK', 'EU', 'ALL'],
    supportedSports: ['football', 'cricket', 'basketball'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'WilliamHill',
      betloy: 'williamhill',
    },
    priorityRank: 7,
    rating: 4.6,
    bonusText: 'Historic UK Bookmaker with Enhanced Odds',
  },
  pinnacle: {
    id: 'pinnacle',
    slug: 'pinnacle',
    displayName: 'Pinnacle',
    legalName: 'Ragnarok Corporation N.V.',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://pinnacle.com',
    countries: ['ALL'],
    supportedSports: ['football', 'basketball', 'cricket'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'Pncl',
      betloy: 'pinnacle',
    },
    priorityRank: 8,
    rating: 4.9,
    bonusText: 'Sharpest Margins & Highest Betting Limits',
  },
  sbobet: {
    id: 'sbobet',
    slug: 'sbobet',
    displayName: 'SBOBET',
    legalName: 'Celton Manx Limited',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://sbobet.com',
    countries: ['ALL'],
    supportedSports: ['football', 'basketball'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'Sbo',
      betloy: 'sbobet',
    },
    priorityRank: 9,
    rating: 4.5,
    bonusText: 'Asian Handicap Specialists with Live In-Play',
  },
  sportybet: {
    id: 'sportybet',
    slug: 'sportybet',
    displayName: 'SportyBet',
    legalName: 'Sporty Group',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://sportybet.com',
    countries: ['NG', 'GH', 'KE', 'UG', 'ZM', 'ALL'],
    supportedSports: ['football', 'basketball'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'SportyBet',
      betloy: 'sportybet',
    },
    priorityRank: 10,
    isFeatured: true,
    rating: 4.7,
    bonusText: 'Instant Payouts & Ultra-Fast Live Betting in Africa',
  },
  betway: {
    id: 'betway',
    slug: 'betway',
    displayName: 'Betway',
    legalName: 'Super Group (SGHC) Limited',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://betway.com',
    countries: ['UK', 'EU', 'ZA', 'NG', 'GH', 'ALL'],
    supportedSports: ['football', 'cricket', 'basketball'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: 'Betway',
      betloy: 'betway',
    },
    priorityRank: 11,
    rating: 4.6,
    bonusText: '100% Deposit Match up to £10 / R1000',
  },
  '888sport': {
    id: '888sport',
    slug: '888sport',
    displayName: '888sport',
    legalName: 'Evoke plc',
    logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=64&h=64&fit=crop&q=80',
    websiteUrl: 'https://888sport.com',
    countries: ['UK', 'EU', 'ALL'],
    supportedSports: ['football', 'basketball', 'tennis'],
    status: 'ACTIVE',
    externalProviderIds: {
      allsports: '888sport',
      betloy: '888sport',
    },
    priorityRank: 12,
    rating: 4.5,
    bonusText: 'Bet £10 Get £30 in Free Bets + £10 Casino',
  },
};

/**
 * Provider-specific raw string mapping dictionary.
 * Normalizes abbreviation variations into canonical bookmaker slugs.
 */
const PROVIDER_NAME_MAPPINGS: Record<string, string> = {
  // Allsports / Feed Variations
  '1xbet': '1xbet',
  bet365: 'bet365',
  betfair: 'betfair',
  betfairexchange: 'betfair',
  betfairsportsbook: 'betfair',
  betano: 'betano',
  marathon: 'marathon',
  marathonbet: 'marathon',
  betvictor: 'betvictor',
  victor: 'betvictor',
  williamhill: 'williamhill',
  pncl: 'pinnacle',
  pinnacle: 'pinnacle',
  pinnaclesports: 'pinnacle',
  sbo: 'sbobet',
  sbobet: 'sbobet',
  sportybet: 'sportybet',
  sporty: 'sportybet',
  betway: 'betway',
  '888sport': '888sport',
  '888': '888sport',
};

/**
 * Normalizes raw bookmaker strings from any provider feed into canonical slug.
 */
export function normalizeBookmakerSlug(rawName?: string): string {
  if (!rawName) return 'unknown';
  const clean = rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  if (PROVIDER_NAME_MAPPINGS[clean]) {
    return PROVIDER_NAME_MAPPINGS[clean];
  }

  // Check direct canonical key
  if (CANONICAL_BOOKMAKERS[clean]) {
    return clean;
  }

  // Fallback to slugified raw string
  return rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Retrieves authoritative canonical bookmaker entity by slug or raw name.
 */
export function getCanonicalBookmaker(identifier?: string): Bookmaker | undefined {
  if (!identifier) return undefined;
  const slug = normalizeBookmakerSlug(identifier);
  return CANONICAL_BOOKMAKERS[slug];
}

/**
 * Returns all active canonical bookmakers sorted by priority rank.
 */
export function getAllCanonicalBookmakers(): Bookmaker[] {
  return Object.values(CANONICAL_BOOKMAKERS)
    .filter((b) => b.status === 'ACTIVE')
    .sort((a, b) => a.priorityRank - b.priorityRank);
}

/**
 * Checks if a bookmaker is recognized and supported.
 */
export function isBookmakerSupported(identifier: string): boolean {
  const slug = normalizeBookmakerSlug(identifier);
  return Boolean(CANONICAL_BOOKMAKERS[slug]);
}

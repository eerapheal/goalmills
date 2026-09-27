import { ConfederationCode, CountryRecord } from '@goalmills/types';
import { COUNTRIES_REGISTRY, getCountry } from './countryRegistry';

export interface ResolvedCountry {
  countryCode: string;
  countryName: string;
  confederationCode: ConfederationCode;
  flagUrl: string;
  isRegistered: boolean;
  countryRecord?: CountryRecord;
}

const COUNTRY_NAME_MAP = new Map<string, CountryRecord>();
const COUNTRY_CODE_MAP = new Map<string, CountryRecord>();

for (const record of Object.values(COUNTRIES_REGISTRY)) {
  COUNTRY_CODE_MAP.set(record.code.toUpperCase(), record);
  COUNTRY_NAME_MAP.set(record.name.trim().toLowerCase(), record);
}

// Country name aliases from raw provider feeds
const COUNTRY_ALIASES: Record<string, string> = {
  england: 'GB-ENG',
  'great britain': 'GB-ENG',
  uk: 'GB-ENG',
  'united kingdom': 'GB-ENG',
  spain: 'ES',
  italy: 'IT',
  germany: 'DE',
  france: 'FR',
  nigeria: 'NG',
  'south africa': 'ZA',
  rsa: 'ZA',
  egypt: 'EG',
  morocco: 'MA',
  ghana: 'GH',
  algeria: 'DZ',
  tunisia: 'TN',
  tanzania: 'TZ',
  'dr congo': 'CD',
  congo: 'CD',
  'ivory coast': 'CI',
  "côte d'ivoire": 'CI',
  zambia: 'ZM',
  kenya: 'KE',
  angola: 'AO',
  uganda: 'UG',
  sudan: 'SD',
  cameroon: 'CM',
  netherlands: 'NL',
  holland: 'NL',
  portugal: 'PT',
  turkey: 'TR',
  türkiye: 'TR',
  brazil: 'BR',
  argentina: 'AR',
  'united states': 'US',
  usa: 'US',
  'saudi arabia': 'SA',
};

/**
 * Resolves raw country code or country name into a canonical ResolvedCountry.
 */
export function resolveCountry(rawCountryCodeOrName?: string): ResolvedCountry {
  if (!rawCountryCodeOrName) {
    return {
      countryCode: 'GLOBAL',
      countryName: 'Global',
      confederationCode: 'FIFA',
      flagUrl: 'https://media.api-sports.io/flags/world.svg',
      isRegistered: false,
    };
  }

  const raw = rawCountryCodeOrName.trim();
  const rawUpper = raw.toUpperCase();
  const rawLower = raw.toLowerCase();

  // 1. Direct code lookup
  if (COUNTRY_CODE_MAP.has(rawUpper)) {
    const rec = COUNTRY_CODE_MAP.get(rawUpper)!;
    return {
      countryCode: rec.code,
      countryName: rec.name,
      confederationCode: rec.confederationCode,
      flagUrl: rec.flagUrl,
      isRegistered: true,
      countryRecord: rec,
    };
  }

  // 2. Direct name lookup
  if (COUNTRY_NAME_MAP.has(rawLower)) {
    const rec = COUNTRY_NAME_MAP.get(rawLower)!;
    return {
      countryCode: rec.code,
      countryName: rec.name,
      confederationCode: rec.confederationCode,
      flagUrl: rec.flagUrl,
      isRegistered: true,
      countryRecord: rec,
    };
  }

  // 3. Alias lookup
  if (COUNTRY_ALIASES[rawLower]) {
    const code = COUNTRY_ALIASES[rawLower];
    const rec = getCountry(code);
    if (rec) {
      return {
        countryCode: rec.code,
        countryName: rec.name,
        confederationCode: rec.confederationCode,
        flagUrl: rec.flagUrl,
        isRegistered: true,
        countryRecord: rec,
      };
    }
  }

  return {
    countryCode: rawUpper,
    countryName: raw,
    confederationCode: 'FIFA',
    flagUrl: 'https://media.api-sports.io/flags/world.svg',
    isRegistered: false,
  };
}

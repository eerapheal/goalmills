/**
 * Top league priority order for GoalMills.
 *
 * This is the ONLY hand-maintained football list in the app: AllSportsAPI league IDs
 * in display priority order. IDs are stable across seasons — names, logos, seasons,
 * teams, standings and fixtures are all fetched live from the API.
 *
 * `slug` keeps existing public URLs stable (e.g. /football/premier-league).
 * Every other league from the API is still available, ranked after these.
 */
export interface TopLeagueRef {
  id: number;
  slug: string;
}

export const TOP_LEAGUES: readonly TopLeagueRef[] = [
  { id: 152, slug: 'premier-league' },
  { id: 302, slug: 'la-liga' },
  { id: 207, slug: 'serie-a' },
  { id: 175, slug: 'bundesliga' },
  { id: 168, slug: 'ligue-1' },
  { id: 3, slug: 'champions-league' },
  { id: 4, slug: 'europa-league' },
  { id: 683, slug: 'conference-league' },
  { id: 28, slug: 'fifa-world-cup' },
  { id: 1, slug: 'uefa-euro' },
  { id: 29, slug: 'afcon' },
  { id: 346, slug: 'caf-champions-league' },
  { id: 390, slug: 'caf-confederation-cup' },
  { id: 248, slug: 'npfl' },
  { id: 12614, slug: 'fifa-club-world-cup' },
  { id: 633, slug: 'uefa-nations-league' },
  { id: 18, slug: 'copa-libertadores' },
  { id: 17, slug: 'copa-america' },
  { id: 480, slug: 'chan' },
  { id: 619, slug: 'afcon-u20' },
  { id: 10253, slug: 'afcon-u17' },
  { id: 244, slug: 'eredivisie' },
  { id: 266, slug: 'liga-portugal' },
  { id: 278, slug: 'saudi-pro-league' },
  { id: 332, slug: 'mls' },
  { id: 153, slug: 'championship' },
  { id: 146, slug: 'fa-cup' },
  { id: 99, slug: 'brasileirao' },
  { id: 44, slug: 'liga-profesional' },
  { id: 322, slug: 'turkish-super-lig' },
  { id: 141, slug: 'egyptian-premier-league' },
  { id: 297, slug: 'south-african-psl' },
];

/** Rank used for leagues outside the priority list. */
export const UNRANKED = 999;

const RANK_BY_ID = new Map(TOP_LEAGUES.map((l, i) => [l.id, i + 1]));
const SLUG_BY_ID = new Map(TOP_LEAGUES.map((l) => [l.id, l.slug]));
const ID_BY_SLUG = new Map(TOP_LEAGUES.map((l) => [l.slug, l.id]));

function toId(id: string | number | undefined | null): number {
  const n = typeof id === 'number' ? id : parseInt(String(id ?? ''), 10);
  return Number.isFinite(n) ? n : NaN;
}

/** 1-based priority rank for a league ID, or UNRANKED. */
export function getLeagueRank(id: string | number | undefined | null): number {
  return RANK_BY_ID.get(toId(id)) ?? UNRANKED;
}

export function isTopLeague(id: string | number | undefined | null): boolean {
  return RANK_BY_ID.has(toId(id));
}

export function getTopLeagueSlug(id: string | number | undefined | null): string | undefined {
  return SLUG_BY_ID.get(toId(id));
}

export function getTopLeagueIdBySlug(slug: string): number | undefined {
  return ID_BY_SLUG.get(slug.toLowerCase().trim());
}

export const LEAGUE_SHORT_NAMES: Record<number, string> = {
  152: 'EPL',
  302: 'LaLiga',
  207: 'Serie A',
  175: 'Bundesliga',
  168: 'Ligue 1',
  3: 'UCL',
  4: 'UEL',
  683: 'UECL',
  28: 'World Cup',
  21: 'World Cup Qual.',
  1: 'Euro',
  354: 'Euro Qual.',
  29: 'AFCON',
  7098: 'AFCON Qual.',
  346: 'CAF CL',
  390: 'CAF CC',
  248: 'NPFL',
  12614: 'Club World Cup',
  633: 'Nations League',
  18: 'Libertadores',
  17: 'Copa America',
  480: 'CHAN',
  12618: 'CHAN Qual.',
  619: 'AFCON U20',
  10253: 'AFCON U17',
  244: 'Eredivisie',
  266: 'Liga Portugal',
  278: 'Saudi Pro League',
  332: 'MLS',
  153: 'Championship',
  146: 'FA Cup',
  147: 'Carabao Cup',
  99: 'Brasileirão',
  44: 'Liga Profesional',
  322: 'Süper Lig',
  141: 'Egypt PL',
  297: 'PSL',
  177: 'Ghana PL',
  397: 'Kenya PL',
  406: 'Tanzania PL',
  63: 'Pro League',
  279: 'Scottish Premiership',
  262: 'Liga MX',
  5: 'CONCACAF Champions',
};

/**
 * Returns a concise, standardized short form for a league (e.g. "EPL" for Premier League, "LaLiga", "UCL", etc.).
 * Strictly prevents non-English leagues from being mistakenly labeled as "Premier League" or "EPL".
 */
export function getLeagueShortName(
  id: string | number | undefined | null,
  rawName?: string | null,
  countryName?: string | null
): string {
  const numericId = toId(id);
  if (!isNaN(numericId) && LEAGUE_SHORT_NAMES[numericId]) {
    return LEAGUE_SHORT_NAMES[numericId];
  }

  const name = (rawName || '').trim();
  const country = (countryName || '').trim().toLowerCase();

  // Handle various domestic leagues called "Premier League" or "Premier Division"
  if (/premier\s+(league|division)/i.test(name)) {
    if (country === 'england' || country === 'gb-eng' || country === 'uk' || country === 'united kingdom') {
      return 'EPL';
    }
    if (country === 'egypt' || /egypt/i.test(name)) return 'Egypt PL';
    if (country === 'nigeria' || /nigeria/i.test(name)) return 'NPFL';
    if (country === 'south africa' || /south africa/i.test(name)) return 'PSL';
    if (country === 'ghana' || /ghana/i.test(name)) return 'Ghana PL';
    if (country === 'kenya' || /kenya/i.test(name)) return 'Kenya PL';
    if (country === 'tanzania' || /tanzania/i.test(name)) return 'Tanzania PL';
    if (country === 'scotland' || /scotland/i.test(name)) return 'Scottish PL';
    if (country === 'russia' || /russia/i.test(name)) return 'Russian PL';
    if (country === 'ukraine' || /ukraine/i.test(name)) return 'Ukrainian PL';
    if (country === 'wales' || /welsh/i.test(name)) return 'Cymru Premier';
    if (country === 'northern ireland' || /northern ireland/i.test(name)) return 'NIFL Premiership';
    if (country === 'ireland' || /ireland/i.test(name)) return 'LOI Premier';
    if (country) {
      return `${country.charAt(0).toUpperCase() + country.slice(1)} PL`;
    }
    return name.replace(/\s*-\s*(Regular Season|Relegation Round|Championship Round|Group\s+[A-Z0-9])/gi, '').trim() || 'Football League';
  }

  if (name) {
    return name.replace(/\s*-\s*(Regular Season|Relegation Round|Championship Round|Group\s+[A-Z0-9])/gi, '').trim();
  }

  return 'Football League';
}


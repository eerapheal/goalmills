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
  { id: 344, slug: 'russian-premier-league' },
  { id: 259, slug: 'ekstraklasa' },
  { id: 279, slug: 'scottish-premiership' },
  { id: 325, slug: 'ukrainian-premier-league' },
  { id: 61, slug: 'belarusian-premier-league' },
  { id: 177, slug: 'ghana-premier-league' },
  { id: 216, slug: 'kenyan-premier-league' },
  { id: 318, slug: 'tanzania-premier-league' },
  { id: 63, slug: 'belgian-pro-league' },
  { id: 312, slug: 'swiss-super-league' },
  { id: 47, slug: 'austrian-bundesliga' },
  { id: 136, slug: 'danish-superliga' },
  { id: 179, slug: 'greek-super-league' },
  { id: 133, slug: 'czech-first-league' },
  { id: 128, slug: 'croatian-hnl' },
  { id: 310, slug: 'allsvenskan' },
  { id: 255, slug: 'eliteserien' },
  { id: 262, slug: 'liga-mx' },
  { id: 238, slug: 'botola-pro' },
  { id: 40, slug: 'algerian-ligue-1' },
  { id: 321, slug: 'tunisian-ligue-1' },
  { id: 126, slug: 'dr-congo-linafoot' },
  { id: 196, slug: 'ivory-coast-ligue-1' },
  { id: 83, slug: 'cameroon-elite-one' },
  { id: 342, slug: 'zambia-super-league' },
  { id: 555, slug: 'uganda-premier-league' },
  { id: 556, slug: 'ethiopia-premier-league' },
  { id: 291, slug: 'senegal-ligue-1' },
  { id: 120, slug: 'colombian-primera-a' },
  { id: 111, slug: 'chilean-primera-division' },
  { id: 333, slug: 'uruguayan-primera-division' },
  { id: 258, slug: 'paraguayan-primera-division' },
  { id: 260, slug: 'peruvian-primera-division' },
  { id: 140, slug: 'ecuadorian-serie-a' },
  { id: 659, slug: 'canadian-premier-league' },
  { id: 5, slug: 'concacaf-champions-cup' },
  { id: 16, slug: 'afc-champions-league' },
  { id: 11, slug: 'afc-champions-league-two' },
  { id: 11699, slug: 'afc-challenge-league' },
  { id: 347, slug: 'afc-asian-cup' },
  { id: 11708, slug: 'afc-womens-champions-league' },
  { id: 201, slug: 'j1-league' },
  { id: 209, slug: 'k-league-1' },
  { id: 50, slug: 'a-league' },
  { id: 188, slug: 'indian-super-league' },
  { id: 114, slug: 'chinese-super-league' },
  { id: 268, slug: 'qatar-stars-league' },
  { id: 328, slug: 'uae-pro-league' },
  { id: 195, slug: 'persian-gulf-pro-league' },
  { id: 147, slug: 'carabao-cup' },
  { id: 300, slug: 'copa-del-rey' },
  { id: 206, slug: 'coppa-italia' },
  { id: 174, slug: 'dfb-pokal' },
  { id: 166, slug: 'coupe-de-france' },
  { id: 642, slug: 'uefa-super-cup' },
  { id: 391, slug: 'caf-super-cup' },
  { id: 154, slug: 'league-one' },
  { id: 155, slug: 'league-two' },
  { id: 301, slug: 'segunda-division' },
  { id: 208, slug: 'serie-b' },
  { id: 176, slug: '2-bundesliga' },
  { id: 169, slug: 'ligue-2' },
  { id: 269, slug: 'romanian-liga-i' },
  { id: 184, slug: 'hungarian-nb-i' },
  { id: 292, slug: 'serbian-superliga' },
  { id: 295, slug: 'slovak-super-liga' },
  { id: 296, slug: 'slovenian-prvaliga' },
  { id: 131, slug: 'cypriot-first-division' },
  { id: 200, slug: 'league-of-ireland-premier' },
  { id: 254, slug: 'nifl-premiership' },
  { id: 341, slug: 'cymru-premier' },
  { id: 160, slug: 'veikkausliiga' },
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
  // Qualifier tournaments
  7098: 'AFCON Qual.',
  12618: 'CHAN Qual.',
  21: 'World Cup Qual.',
  354: 'Euro Qual.',
  152: 'EPL',
  302: 'LaLiga',
  207: 'Serie A',
  175: 'Bundesliga',
  168: 'Ligue 1',
  3: 'UCL',
  4: 'UEL',
  683: 'UECL',
  28: 'World Cup',
  1: 'Euro',
  29: 'AFCON',
  346: 'CAF CL',
  390: 'CAF CC',
  248: 'NPFL',
  12614: 'Club World Cup',
  633: 'Nations League',
  18: 'Libertadores',
  17: 'Copa America',
  480: 'CHAN',
  619: 'AFCON U20',
  10253: 'AFCON U17',
  244: 'Eredivisie',
  266: 'Liga Portugal',
  278: 'Saudi Pro League',
  332: 'MLS',
  153: 'Championship',
  146: 'FA Cup',
  99: 'Brasileirão',
  44: 'Liga Profesional',
  322: 'Süper Lig',
  141: 'Egypt PL',
  297: 'PSL',
  344: 'Russian PL',
  259: 'Ekstraklasa',
  279: 'Scottish PL',
  325: 'Ukrainian PL',
  61: 'Belarusian PL',
  177: 'Ghana PL',
  216: 'Kenya PL',
  318: 'Tanzania PL',
  63: 'Pro League',
  312: 'Super League CH',
  47: 'Bundesliga AT',
  136: 'Superliga DK',
  179: 'Super League GR',
  133: 'First League CZ',
  128: 'HNL',
  310: 'Allsvenskan',
  255: 'Eliteserien',
  262: 'Liga MX',
  238: 'Botola Pro',
  40: 'Ligue 1 DZ',
  321: 'Ligue 1 TN',
  126: 'Linafoot',
  196: 'Ligue 1 CI',
  83: 'Elite One',
  342: 'Zambia SL',
  555: 'Uganda PL',
  556: 'Ethiopia PL',
  291: 'Ligue 1 SN',
  120: 'Primera A CO',
  111: 'Primera CL',
  333: 'Primera UY',
  258: 'Primera PY',
  260: 'Liga 1 PE',
  140: 'LigaPro EC',
  659: 'CPL',
  5: 'CONCACAF CC',
  16: 'ACL Elite',
  11: 'ACL Two',
  11699: 'AFC Challenge',
  347: 'Asian Cup',
  11708: 'AWCL',
  201: 'J1 League',
  209: 'K League 1',
  50: 'A-League',
  188: 'ISL',
  114: 'CSL',
  268: 'Stars League',
  328: 'UAE Pro',
  195: 'Persian Gulf PL',
  147: 'Carabao Cup',
  300: 'Copa del Rey',
  206: 'Coppa Italia',
  174: 'DFB-Pokal',
  166: 'Coupe de France',
  642: 'UEFA Super Cup',
  391: 'CAF Super Cup',
  154: 'League One',
  155: 'League Two',
  301: 'LaLiga 2',
  208: 'Serie B',
  176: '2. Bundesliga',
  169: 'Ligue 2',
  269: 'SuperLiga RO',
  184: 'NB I',
  292: 'SuperLiga RS',
  295: 'Nike Liga SK',
  296: 'PrvaLiga SI',
  131: 'Cyprus 1st',
  200: 'LOI Premier',
  254: 'NIFL Prem',
  341: 'Cymru Prem',
  160: 'Veikkausliiga',
};

const STAGE_SUFFIX_PATTERN = /\s*[-–—]\s*(Regular Season|Relegation Round|Championship Round|Group\s+[A-Z0-9]+|Group Stage|Preliminary (?:Round|Stage)|Qualification|Qualifying|Play-?offs?|Knockout Stage|Final Stage|Round of \d+|Quarter-?finals?|Semi-?finals?|Finals?)\b/gi;

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
    return name.replace(STAGE_SUFFIX_PATTERN, '').trim() || 'Football League';
  }

  if (name) {
    return name.replace(STAGE_SUFFIX_PATTERN, '').trim();
  }

  return 'Football League';
}

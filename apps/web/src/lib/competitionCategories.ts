/**
 * Competition Categories & Major League Registry for GoalMills Football Platform
 *
 * This file defines the comprehensive list of 75 major football competitions covered by GoalMills,
 * organized by confederation and category, prioritizing African football (CAF & Domestic Leagues)
 * for the 2026/2027 season. Each entry maps to an official high-resolution logo from API-Sports CDN.
 */

export const LEAGUE_LOGO_BASE = 'https://media.api-sports.io/football/leagues';
export const leagueLogo = (apiSportsId: number): string => `${LEAGUE_LOGO_BASE}/${apiSportsId}.png`;

export type CompetitionCategory =
  | 'caf'
  | 'european-top5'
  | 'european-club'
  | 'european-domestic'
  | 'domestic-cups'
  | 'fifa'
  | 'uefa-national'
  | 'conmebol'
  | 'concacaf'
  | 'afc'
  | 'other-leagues';

export type CompetitionType = 'league' | 'cup' | 'knockout';
export type Gender = 'men' | 'women' | 'mixed';
export type AgeGroup = 'senior' | 'u21' | 'u20' | 'u19' | 'u17' | 'u16';

export interface CompetitionEntry {
  id: number; // AllSports/Internal ID
  apiSportsId: number; // Verified API-Sports logo ID
  name: string;
  slug: string;
  country: string;
  flag: string;
  logo: string;
  season: string;
  featured: boolean;
  tier: 1 | 2 | 3;
  description: string;
  category: CompetitionCategory;
  competitionType: CompetitionType;
  hasGroups: boolean;
  hasKnockout: boolean;
  gender: Gender;
  ageGroup: AgeGroup;
}

export const COMPETITION_CATEGORY_LABELS: Record<CompetitionCategory, { label: string; icon: string; order: number }> = {
  'caf': { label: 'Africa (CAF & Premier Leagues)', icon: '🌍', order: 1 },
  'european-top5': { label: 'Top 5 European Leagues', icon: '⭐', order: 2 },
  'european-club': { label: 'European Club Cups', icon: '🏆', order: 3 },
  'fifa': { label: 'FIFA Competitions', icon: '🌐', order: 4 },
  'european-domestic': { label: 'European Domestic Leagues', icon: '⚽', order: 5 },
  'domestic-cups': { label: 'Domestic Cups', icon: '🥇', order: 6 },
  'uefa-national': { label: 'UEFA National Team', icon: '🇪🇺', order: 7 },
  'conmebol': { label: 'South America (CONMEBOL)', icon: '🌎', order: 8 },
  'concacaf': { label: 'North America (CONCACAF)', icon: '🌎', order: 9 },
  'afc': { label: 'Asia (AFC)', icon: '🌏', order: 10 },
  'other-leagues': { label: 'Major Global Leagues', icon: '⚡', order: 11 },
};

/**
 * Full 75-competition registry with verified, 100% valid CDN logo URLs
 * 2026/2027 Season Active Campaign
 */
export const ALL_COMPETITIONS: CompetitionEntry[] = [
  // ─── Africa (CAF & Major National Leagues) ──────────────────────────────────
  { id: 6, apiSportsId: 6, name: 'Africa Cup of Nations', slug: 'afcon', country: 'Africa', flag: '🌍', logo: leagueLogo(6), season: '2027', featured: true, tier: 1, description: "Africa's premier national team football tournament.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 19, apiSportsId: 12, name: 'CAF Champions League', slug: 'caf-champions-league', country: 'Africa', flag: '🌍', logo: leagueLogo(12), season: '2026/2027', featured: true, tier: 1, description: "Africa's most prestigious club competition featuring continental giants.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 20, apiSportsId: 20, name: 'CAF Confederation Cup', slug: 'caf-confederation-cup', country: 'Africa', flag: '🌍', logo: leagueLogo(20), season: '2026/2027', featured: true, tier: 1, description: "Africa's elite second-tier continental club championship.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 288, apiSportsId: 288, name: 'Betway Premiership (PSL)', slug: 'south-african-psl', country: 'South Africa', flag: '🇿🇦', logo: leagueLogo(288), season: '2026/2027', featured: true, tier: 1, description: "South Africa's premier league, home to Mamelodi Sundowns and Orlando Pirates.", category: 'caf', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 247, apiSportsId: 234, name: 'NPFL (Nigeria)', slug: 'npfl', country: 'Nigeria', flag: '🇳🇬', logo: leagueLogo(234), season: '2026/2027', featured: true, tier: 1, description: "Nigeria Premier Football League — the bedrock of Nigerian domestic talent.", category: 'caf', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 178, apiSportsId: 233, name: 'Egyptian Premier League', slug: 'egyptian-premier-league', country: 'Egypt', flag: '🇪🇬', logo: leagueLogo(233), season: '2026/2027', featured: true, tier: 1, description: "Egypt's top flight featuring African dynasties Al Ahly and Zamalek.", category: 'caf', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 233, apiSportsId: 200, name: 'Botola Pro Inwi', slug: 'botola-pro', country: 'Morocco', flag: '🇲🇦', logo: leagueLogo(200), season: '2026/2027', featured: true, tier: 1, description: "Morocco's top professional football league featuring Wydad and Raja Casablanca.", category: 'caf', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 198, apiSportsId: 387, name: 'Ghana Premier League', slug: 'ghanaian-premier-league', country: 'Ghana', flag: '🇬🇭', logo: leagueLogo(387), season: '2026/2027', featured: false, tier: 2, description: "Ghana's top professional football league featuring Asante Kotoko and Hearts of Oak.", category: 'caf', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 360, apiSportsId: 321, name: 'CHAN', slug: 'chan', country: 'Africa', flag: '🌍', logo: leagueLogo(321), season: '2026/2027', featured: true, tier: 2, description: 'African Nations Championship exclusively for domestic-based players.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 362, apiSportsId: 322, name: 'AFCON U-20', slug: 'afcon-u20', country: 'Africa', flag: '🌍', logo: leagueLogo(322), season: '2026/2027', featured: false, tier: 3, description: 'Africa Cup of Nations for emerging under-20 talents.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u20' },
  { id: 363, apiSportsId: 325, name: 'AFCON U-17', slug: 'afcon-u17', country: 'Africa', flag: '🌍', logo: leagueLogo(325), season: '2026/2027', featured: false, tier: 3, description: 'Africa Cup of Nations for under-17 rising stars.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u17' },
  { id: 365, apiSportsId: 365, name: 'WAFCON', slug: 'afcon-women', country: 'Africa', flag: '🌍', logo: leagueLogo(365), season: '2026/2027', featured: false, tier: 2, description: "Women's Africa Cup of Nations celebrating elite women's football.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'women', ageGroup: 'senior' },
  { id: 631, apiSportsId: 631, name: 'WAFU-B Nations Cup', slug: 'wafu-b-nations-cup', country: 'West Africa', flag: '🌍', logo: leagueLogo(631), season: '2026/2027', featured: false, tier: 3, description: 'West African Football Union (Zone B) tournament.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── European Top 5 ────────────────────────────────────────────────────────
  { id: 152, apiSportsId: 39, name: 'Premier League', slug: 'premier-league', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(39), season: '2026/2027', featured: true, tier: 1, description: 'The top tier of English football showcasing global and African superstars.', category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 302, apiSportsId: 140, name: 'La Liga', slug: 'la-liga', country: 'Spain', flag: '🇪🇸', logo: leagueLogo(140), season: '2026/2027', featured: true, tier: 1, description: 'The pinnacle of Spanish domestic football.', category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 207, apiSportsId: 135, name: 'Serie A', slug: 'serie-a', country: 'Italy', flag: '🇮🇹', logo: leagueLogo(135), season: '2026/2027', featured: true, tier: 1, description: 'The top league in Italian football with tactical mastery.', category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 175, apiSportsId: 78, name: 'Bundesliga', slug: 'bundesliga', country: 'Germany', flag: '🇩🇪', logo: leagueLogo(78), season: '2026/2027', featured: true, tier: 1, description: "Germany's top flight known for high-tempo attacking football.", category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 168, apiSportsId: 61, name: 'Ligue 1', slug: 'ligue-1', country: 'France', flag: '🇫🇷', logo: leagueLogo(61), season: '2026/2027', featured: true, tier: 1, description: "France's premier football division with deep African football ties.", category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },

  // ─── European Club Cups ────────────────────────────────────────────────────
  { id: 3, apiSportsId: 2, name: 'UEFA Champions League', slug: 'champions-league', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(2), season: '2026/2027', featured: true, tier: 1, description: "Europe's most prestigious club football competition.", category: 'european-club', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 4, apiSportsId: 3, name: 'UEFA Europa League', slug: 'europa-league', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(3), season: '2026/2027', featured: true, tier: 1, description: "Europe's secondary club competition with fierce knockout drama.", category: 'european-club', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 683, apiSportsId: 848, name: 'UEFA Conference League', slug: 'conference-league', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(848), season: '2026/2027', featured: false, tier: 2, description: "UEFA's third-tier European club competition.", category: 'european-club', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 2, apiSportsId: 531, name: 'UEFA Super Cup', slug: 'uefa-super-cup', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(531), season: '2026', featured: false, tier: 2, description: 'Annual match between UCL and UEL winners.', category: 'european-club', competitionType: 'knockout', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── European Domestic Leagues ──────────────────────────────────────────────
  { id: 244, apiSportsId: 88, name: 'Eredivisie', slug: 'eredivisie', country: 'Netherlands', flag: '🇳🇱', logo: leagueLogo(88), season: '2026/2027', featured: false, tier: 2, description: 'The top division of Dutch football.', category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 266, apiSportsId: 94, name: 'Liga Portugal', slug: 'liga-portugal', country: 'Portugal', flag: '🇵🇹', logo: leagueLogo(94), season: '2026/2027', featured: false, tier: 2, description: "Portugal's top flight featuring elite European and African talent.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 179, apiSportsId: 179, name: 'Scottish Premiership', slug: 'scottish-premiership', country: 'Scotland', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(179), season: '2026/2027', featured: false, tier: 2, description: "Scotland's top domestic football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 322, apiSportsId: 203, name: 'Turkish Süper Lig', slug: 'turkish-super-lig', country: 'Turkey', flag: '🇹🇷', logo: leagueLogo(203), season: '2026/2027', featured: false, tier: 2, description: "Turkey's premier football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 344, apiSportsId: 144, name: 'Belgian Pro League', slug: 'belgian-pro-league', country: 'Belgium', flag: '🇧🇪', logo: leagueLogo(144), season: '2026/2027', featured: false, tier: 2, description: "Belgium's top flight, premier European gateway for African talents.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 308, apiSportsId: 207, name: 'Swiss Super League', slug: 'swiss-super-league', country: 'Switzerland', flag: '🇨🇭', logo: leagueLogo(207), season: '2026/2027', featured: false, tier: 3, description: "Switzerland's premier football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 148, apiSportsId: 218, name: 'Austrian Bundesliga', slug: 'austrian-bundesliga', country: 'Austria', flag: '🇦🇹', logo: leagueLogo(218), season: '2026/2027', featured: false, tier: 3, description: "Austria's top football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 197, apiSportsId: 197, name: 'Greek Super League', slug: 'greek-super-league', country: 'Greece', flag: '🇬🇷', logo: leagueLogo(197), season: '2026/2027', featured: false, tier: 3, description: "Greece's top football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 283, apiSportsId: 235, name: 'Russian Premier League', slug: 'russian-premier-league', country: 'Russia', flag: '🇷🇺', logo: leagueLogo(235), season: '2026/2027', featured: false, tier: 2, description: "Russia's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 164, apiSportsId: 345, name: 'Czech First League', slug: 'czech-first-league', country: 'Czech Republic', flag: '🇨🇿', logo: leagueLogo(345), season: '2026/2027', featured: false, tier: 3, description: 'Top division in Czech football.', category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 259, apiSportsId: 106, name: 'Polish Ekstraklasa', slug: 'polish-ekstraklasa', country: 'Poland', flag: '🇵🇱', logo: leagueLogo(106), season: '2026/2027', featured: false, tier: 3, description: "Poland's premier football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 165, apiSportsId: 119, name: 'Danish Superliga', slug: 'danish-superliga', country: 'Denmark', flag: '🇩🇰', logo: leagueLogo(119), season: '2026/2027', featured: false, tier: 3, description: "Denmark's top football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 249, apiSportsId: 103, name: 'Norwegian Eliteserien', slug: 'norwegian-eliteserien', country: 'Norway', flag: '🇳🇴', logo: leagueLogo(103), season: '2026/2027', featured: false, tier: 3, description: "Norway's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 310, apiSportsId: 113, name: 'Swedish Allsvenskan', slug: 'swedish-allsvenskan', country: 'Sweden', flag: '🇸🇪', logo: leagueLogo(113), season: '2026/2027', featured: false, tier: 3, description: "Sweden's premier football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 332, apiSportsId: 333, name: 'Ukrainian Premier League', slug: 'ukrainian-premier-league', country: 'Ukraine', flag: '🇺🇦', logo: leagueLogo(333), season: '2026/2027', featured: false, tier: 3, description: "Ukraine's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 161, apiSportsId: 210, name: 'Croatian First League', slug: 'croatian-first-league', country: 'Croatia', flag: '🇭🇷', logo: leagueLogo(210), season: '2026/2027', featured: false, tier: 3, description: "Croatia's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 286, apiSportsId: 286, name: 'Serbian SuperLiga', slug: 'serbian-superliga', country: 'Serbia', flag: '🇷🇸', logo: leagueLogo(286), season: '2026/2027', featured: false, tier: 3, description: "Serbia's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 271, apiSportsId: 283, name: 'Romanian Liga 1', slug: 'romanian-liga-1', country: 'Romania', flag: '🇷🇴', logo: leagueLogo(283), season: '2026/2027', featured: false, tier: 3, description: "Romania's top football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },

  // ─── Domestic Cups ──────────────────────────────────────────────────────────
  { id: 146, apiSportsId: 45, name: 'FA Cup', slug: 'fa-cup', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(45), season: '2026/2027', featured: true, tier: 1, description: "The world's oldest domestic cup competition.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 151, apiSportsId: 48, name: 'EFL League Cup', slug: 'efl-league-cup', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(48), season: '2026/2027', featured: false, tier: 2, description: 'English League Cup (Carabao Cup).', category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 300, apiSportsId: 143, name: 'Copa del Rey', slug: 'copa-del-rey', country: 'Spain', flag: '🇪🇸', logo: leagueLogo(143), season: '2026/2027', featured: false, tier: 2, description: "Spain's prestigious domestic knockout cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 173, apiSportsId: 81, name: 'DFB-Pokal', slug: 'dfb-pokal', country: 'Germany', flag: '🇩🇪', logo: leagueLogo(81), season: '2026/2027', featured: false, tier: 2, description: "Germany's knockout domestic cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 205, apiSportsId: 137, name: 'Coppa Italia', slug: 'coppa-italia', country: 'Italy', flag: '🇮🇹', logo: leagueLogo(137), season: '2026/2027', featured: false, tier: 2, description: "Italy's main domestic cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 166, apiSportsId: 66, name: 'Coupe de France', slug: 'coupe-de-france', country: 'France', flag: '🇫🇷', logo: leagueLogo(66), season: '2026/2027', featured: false, tier: 2, description: "France's national football cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── FIFA International Competitions ────────────────────────────────────────
  { id: 28, apiSportsId: 1, name: 'FIFA World Cup', slug: 'fifa-world-cup', country: 'International', flag: '🌐', logo: leagueLogo(1), season: '2026', featured: true, tier: 1, description: "The greatest show on earth — FIFA's premier international tournament.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 140, apiSportsId: 141, name: 'FIFA World Cup Women', slug: 'fifa-world-cup-women', country: 'International', flag: '🌐', logo: leagueLogo(141), season: '2027', featured: true, tier: 1, description: "FIFA Women's World Cup — the pinnacle of women's international football.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'women', ageGroup: 'senior' },
  { id: 139, apiSportsId: 21, name: 'FIFA U-20 World Cup', slug: 'fifa-u20-world-cup', country: 'International', flag: '🌐', logo: leagueLogo(21), season: '2027', featured: false, tier: 2, description: "FIFA's premier youth competition for under-20 national teams.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u20' },
  { id: 138, apiSportsId: 23, name: 'FIFA U-17 World Cup', slug: 'fifa-u17-world-cup', country: 'International', flag: '🌐', logo: leagueLogo(23), season: '2026', featured: false, tier: 2, description: "FIFA's youth tournament for under-17 teams.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u17' },
  { id: 531, apiSportsId: 15, name: 'FIFA Club World Cup', slug: 'fifa-club-world-cup', country: 'International', flag: '🌐', logo: leagueLogo(15), season: '2026/2027', featured: true, tier: 1, description: "The expanded FIFA Club World Cup featuring top clubs from all confederations including African powerhouses.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 29, apiSportsId: 32, name: 'FIFA World Cup Qualifiers (CAF & Global)', slug: 'fifa-wc-qualifiers', country: 'International', flag: '🌐', logo: leagueLogo(32), season: '2026', featured: false, tier: 2, description: 'World Cup qualification matches across all confederations.', category: 'fifa', competitionType: 'league', hasGroups: true, hasKnockout: false, gender: 'men', ageGroup: 'senior' },

  // ─── UEFA National Team Competitions ────────────────────────────────────────
  { id: 1, apiSportsId: 4, name: 'UEFA EURO', slug: 'uefa-euro', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(4), season: '2028', featured: true, tier: 1, description: 'The European Championship for senior national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 5, apiSportsId: 5, name: 'UEFA Nations League', slug: 'uefa-nations-league', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(5), season: '2026/2027', featured: true, tier: 1, description: "UEFA's competitive national team league format.", category: 'uefa-national', competitionType: 'league', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 373, apiSportsId: 24, name: 'UEFA EURO U-21', slug: 'uefa-euro-u21', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(24), season: '2027', featured: false, tier: 2, description: 'European Championship for U-21 national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u21' },
  { id: 374, apiSportsId: 25, name: 'UEFA EURO U-19', slug: 'uefa-euro-u19', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(25), season: '2027', featured: false, tier: 3, description: 'European Championship for U-19 national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u19' },
  { id: 375, apiSportsId: 26, name: 'UEFA EURO U-17', slug: 'uefa-euro-u17', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(26), season: '2027', featured: false, tier: 3, description: 'European Championship for U-17 national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u17' },
  { id: 141, apiSportsId: 142, name: "UEFA Women's EURO", slug: 'uefa-womens-euro', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(142), season: '2027', featured: false, tier: 2, description: "The European Women's Championship.", category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'women', ageGroup: 'senior' },

  // ─── CONMEBOL (South America) ───────────────────────────────────────────────
  { id: 17, apiSportsId: 9, name: 'Copa América', slug: 'copa-america', country: 'South America', flag: '🌎', logo: leagueLogo(9), season: '2028', featured: true, tier: 1, description: "South America's premier international football tournament.", category: 'conmebol', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 13, apiSportsId: 13, name: 'Copa Libertadores', slug: 'copa-libertadores', country: 'South America', flag: '🌎', logo: leagueLogo(13), season: '2026/2027', featured: true, tier: 1, description: "South America's most prestigious club competition.", category: 'conmebol', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 14, apiSportsId: 11, name: 'Copa Sudamericana', slug: 'copa-sudamericana', country: 'South America', flag: '🌎', logo: leagueLogo(11), season: '2026/2027', featured: false, tier: 2, description: "South America's secondary club competition.", category: 'conmebol', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── CONCACAF ───────────────────────────────────────────────────────────────
  { id: 18, apiSportsId: 22, name: 'CONCACAF Gold Cup', slug: 'concacaf-gold-cup', country: 'North America', flag: '🌎', logo: leagueLogo(22), season: '2027', featured: false, tier: 2, description: 'Championship for CONCACAF senior national teams.', category: 'concacaf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 487, apiSportsId: 34, name: 'CONCACAF Nations League', slug: 'concacaf-nations-league', country: 'North America', flag: '🌎', logo: leagueLogo(34), season: '2026/2027', featured: false, tier: 2, description: "CONCACAF's competitive league-format national team competition.", category: 'concacaf', competitionType: 'league', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 489, apiSportsId: 16, name: 'CONCACAF Champions Cup', slug: 'concacaf-champions-cup', country: 'North America', flag: '🌎', logo: leagueLogo(16), season: '2026/2027', featured: false, tier: 2, description: "CONCACAF's premier club competition.", category: 'concacaf', competitionType: 'knockout', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── AFC (Asia) ─────────────────────────────────────────────────────────────
  { id: 15, apiSportsId: 7, name: 'AFC Asian Cup', slug: 'afc-asian-cup', country: 'Asia', flag: '🌏', logo: leagueLogo(7), season: '2027', featured: false, tier: 2, description: "Asia's premier national team tournament.", category: 'afc', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 16, apiSportsId: 17, name: 'AFC Champions League Elite', slug: 'afc-champions-league', country: 'Asia', flag: '🌏', logo: leagueLogo(17), season: '2026/2027', featured: false, tier: 2, description: "Asia's elite club competition.", category: 'afc', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── Major Global Leagues ───────────────────────────────────────────────────
  { id: 330, apiSportsId: 253, name: 'MLS', slug: 'mls', country: 'USA', flag: '🇺🇸', logo: leagueLogo(253), season: '2026/2027', featured: false, tier: 2, description: "Major League Soccer — America's top-flight football.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 99, apiSportsId: 71, name: 'Brasileirão Série A', slug: 'brasileirao', country: 'Brazil', flag: '🇧🇷', logo: leagueLogo(71), season: '2026/2027', featured: false, tier: 2, description: "Brazil's premier football division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 135, apiSportsId: 128, name: 'Liga Profesional', slug: 'liga-profesional', country: 'Argentina', flag: '🇦🇷', logo: leagueLogo(128), season: '2026/2027', featured: false, tier: 2, description: "Argentina's top division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 278, apiSportsId: 307, name: 'Saudi Pro League', slug: 'saudi-pro-league', country: 'Saudi Arabia', flag: '🇸🇦', logo: leagueLogo(307), season: '2026/2027', featured: false, tier: 2, description: "Saudi Arabia's top-flight — home to global & African superstars.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 210, apiSportsId: 98, name: 'J1 League', slug: 'j1-league', country: 'Japan', flag: '🇯🇵', logo: leagueLogo(98), season: '2026/2027', featured: false, tier: 3, description: "Japan's top football division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 211, apiSportsId: 292, name: 'K League 1', slug: 'k-league-1', country: 'South Korea', flag: '🇰🇷', logo: leagueLogo(292), season: '2026/2027', featured: false, tier: 3, description: "South Korea's premier football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 188, apiSportsId: 323, name: 'Indian Super League', slug: 'indian-super-league', country: 'India', flag: '🇮🇳', logo: leagueLogo(323), season: '2026/2027', featured: false, tier: 3, description: "India's premier football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 147, apiSportsId: 188, name: 'A-League', slug: 'a-league', country: 'Australia', flag: '🇦🇺', logo: leagueLogo(188), season: '2026/2027', featured: false, tier: 3, description: "Australia's top professional football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 153, apiSportsId: 40, name: 'Championship', slug: 'championship', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(40), season: '2026/2027', featured: false, tier: 2, description: "England's second tier of professional football.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
];

/**
 * Helper: Get competitions grouped by category (sorted by category order, then by tier)
 */
export function getCompetitionsByCategory(): { category: CompetitionCategory; label: string; icon: string; competitions: CompetitionEntry[] }[] {
  const categoryOrder = Object.entries(COMPETITION_CATEGORY_LABELS)
    .sort(([, a], [, b]) => a.order - b.order);

  return categoryOrder.map(([cat, meta]) => ({
    category: cat as CompetitionCategory,
    label: meta.label,
    icon: meta.icon,
    competitions: ALL_COMPETITIONS
      .filter(c => c.category === cat)
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name)),
  })).filter(g => g.competitions.length > 0);
}

/**
 * Helper: Get a flat map of slug → CompetitionEntry for O(1) lookups
 */
export function getCompetitionMap(): Map<string, CompetitionEntry> {
  const map = new Map<string, CompetitionEntry>();
  for (const comp of ALL_COMPETITIONS) {
    map.set(comp.slug, comp);
  }
  return map;
}

/**
 * Helper: Get all league IDs for priority sorting in live scoreboards
 */
export function getAllLeagueIds(): string[] {
  return ALL_COMPETITIONS.map(c => String(c.id));
}

/**
 * Helper: Get featured/tier-1 competition IDs for quick switcher
 */
export function getFeaturedLeagueIds(): string[] {
  return ALL_COMPETITIONS
    .filter(c => c.featured || c.tier === 1)
    .map(c => String(c.id));
}

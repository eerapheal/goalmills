/**
 * Competition Categories & 80 Major League Registry for GoalMills Football Platform
 *
 * This file defines the full list of 80 major football competitions covered by GoalMills,
 * organized by category. Each entry maps to an AllSports API league ID.
 */

export const ALLSPORTS_LEAGUE_LOGO_BASE = 'https://apiv2.allsportsapi.com/logo/logo_leagues';
export const leagueLogo = (id: number, filename: string): string => `${ALLSPORTS_LEAGUE_LOGO_BASE}/${id}_${filename}.png`;

export type CompetitionCategory =
  | 'european-top5'
  | 'european-club'
  | 'european-domestic'
  | 'domestic-cups'
  | 'fifa'
  | 'uefa-national'
  | 'conmebol'
  | 'caf'
  | 'concacaf'
  | 'afc'
  | 'other-leagues';

export type CompetitionType = 'league' | 'cup' | 'knockout';
export type Gender = 'men' | 'women' | 'mixed';
export type AgeGroup = 'senior' | 'u21' | 'u20' | 'u19' | 'u17' | 'u16';

export interface CompetitionEntry {
  id: number; // AllSports API league ID
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
  'european-top5': { label: 'Top 5 European Leagues', icon: '⭐', order: 1 },
  'european-club': { label: 'European Club Cups', icon: '🏆', order: 2 },
  'european-domestic': { label: 'European Domestic Leagues', icon: '🌍', order: 3 },
  'domestic-cups': { label: 'Domestic Cups', icon: '🥇', order: 4 },
  'fifa': { label: 'FIFA Competitions', icon: '🌐', order: 5 },
  'uefa-national': { label: 'UEFA National Team', icon: '🇪🇺', order: 6 },
  'conmebol': { label: 'South America (CONMEBOL)', icon: '🌎', order: 7 },
  'caf': { label: 'Africa (CAF)', icon: '🌍', order: 8 },
  'concacaf': { label: 'North America (CONCACAF)', icon: '🌎', order: 9 },
  'afc': { label: 'Asia (AFC)', icon: '🌏', order: 10 },
  'other-leagues': { label: 'Major Global Leagues', icon: '⚽', order: 11 },
};

/**
 * Full 80-competition registry with standardized AllSportsAPI logo helper
 */
export const ALL_COMPETITIONS: CompetitionEntry[] = [
  // ─── European Top 5 ────────────────────────────────────────────────────────
  { id: 152, name: 'Premier League', slug: 'premier-league', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(152, 'premier-league'), season: '2025/2026', featured: true, tier: 1, description: 'The top tier of English football featuring 20 premier clubs.', category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 302, name: 'La Liga', slug: 'la-liga', country: 'Spain', flag: '🇪🇸', logo: leagueLogo(302, 'la-liga'), season: '2025/2026', featured: true, tier: 1, description: 'The pinnacle of Spanish domestic football.', category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 207, name: 'Serie A', slug: 'serie-a', country: 'Italy', flag: '🇮🇹', logo: leagueLogo(207, 'serie-a'), season: '2025/2026', featured: true, tier: 1, description: 'The top league in Italian football with tactical mastery.', category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 175, name: 'Bundesliga', slug: 'bundesliga', country: 'Germany', flag: '🇩🇪', logo: leagueLogo(175, 'bundesliga'), season: '2025/2026', featured: true, tier: 1, description: "Germany's top flight known for high-tempo attacking football.", category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 168, name: 'Ligue 1', slug: 'ligue-1', country: 'France', flag: '🇫🇷', logo: leagueLogo(168, 'ligue-1'), season: '2025/2026', featured: true, tier: 1, description: "France's premier football division.", category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },

  // ─── European Club Cups ────────────────────────────────────────────────────
  { id: 3, name: 'UEFA Champions League', slug: 'champions-league', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(3, 'uefa_champions_league'), season: '2025/2026', featured: true, tier: 1, description: "Europe's most prestigious club football competition.", category: 'european-club', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 4, name: 'UEFA Europa League', slug: 'europa-league', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(4, 'uefa-europa-league'), season: '2025/2026', featured: true, tier: 1, description: "Europe's secondary club competition with fierce knockout drama.", category: 'european-club', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 683, name: 'UEFA Conference League', slug: 'conference-league', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(683, 'uefa-europa-conference-league'), season: '2025/2026', featured: false, tier: 2, description: "UEFA's third-tier European club competition.", category: 'european-club', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 2, name: 'UEFA Super Cup', slug: 'uefa-super-cup', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(2, 'uefa-super-cup'), season: '2025/2026', featured: false, tier: 2, description: 'Annual match between UCL and UEL winners.', category: 'european-club', competitionType: 'knockout', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── European Domestic Leagues ──────────────────────────────────────────────
  { id: 244, name: 'Eredivisie', slug: 'eredivisie', country: 'Netherlands', flag: '🇳🇱', logo: leagueLogo(244, 'eredivisie'), season: '2025/2026', featured: false, tier: 2, description: 'The top division of Dutch football.', category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 266, name: 'Liga Portugal', slug: 'liga-portugal', country: 'Portugal', flag: '🇵🇹', logo: leagueLogo(266, 'liga-portugal'), season: '2025/2026', featured: false, tier: 2, description: "Portugal's top flight featuring elite European talent.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 179, name: 'Scottish Premiership', slug: 'scottish-premiership', country: 'Scotland', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(179, 'scottish-premiership'), season: '2025/2026', featured: false, tier: 2, description: "Scotland's top domestic football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 322, name: 'Turkish Süper Lig', slug: 'turkish-super-lig', country: 'Turkey', flag: '🇹🇷', logo: leagueLogo(322, 'super-lig'), season: '2025/2026', featured: false, tier: 2, description: "Turkey's premier football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 344, name: 'Belgian Pro League', slug: 'belgian-pro-league', country: 'Belgium', flag: '🇧🇪', logo: leagueLogo(344, 'pro-league'), season: '2025/2026', featured: false, tier: 2, description: "Belgium's top flight, producer of world-class talent.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 308, name: 'Swiss Super League', slug: 'swiss-super-league', country: 'Switzerland', flag: '🇨🇭', logo: leagueLogo(308, 'super-league'), season: '2025/2026', featured: false, tier: 3, description: "Switzerland's premier football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 148, name: 'Austrian Bundesliga', slug: 'austrian-bundesliga', country: 'Austria', flag: '🇦🇹', logo: leagueLogo(148, 'bundesliga'), season: '2025/2026', featured: false, tier: 3, description: "Austria's top football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 197, name: 'Greek Super League', slug: 'greek-super-league', country: 'Greece', flag: '🇬🇷', logo: leagueLogo(197, 'super-league'), season: '2025/2026', featured: false, tier: 3, description: "Greece's top football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 283, name: 'Russian Premier League', slug: 'russian-premier-league', country: 'Russia', flag: '🇷🇺', logo: leagueLogo(283, 'premier-league'), season: '2025/2026', featured: false, tier: 2, description: "Russia's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 164, name: 'Czech First League', slug: 'czech-first-league', country: 'Czech Republic', flag: '🇨🇿', logo: leagueLogo(164, 'first-league'), season: '2025/2026', featured: false, tier: 3, description: 'Top division in Czech football.', category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 259, name: 'Polish Ekstraklasa', slug: 'polish-ekstraklasa', country: 'Poland', flag: '🇵🇱', logo: leagueLogo(259, 'ekstraklasa'), season: '2025/2026', featured: false, tier: 3, description: "Poland's premier football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 165, name: 'Danish Superliga', slug: 'danish-superliga', country: 'Denmark', flag: '🇩🇰', logo: leagueLogo(165, 'superliga'), season: '2025/2026', featured: false, tier: 3, description: "Denmark's top football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 249, name: 'Norwegian Eliteserien', slug: 'norwegian-eliteserien', country: 'Norway', flag: '🇳🇴', logo: leagueLogo(249, 'eliteserien'), season: '2025/2026', featured: false, tier: 3, description: "Norway's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 310, name: 'Swedish Allsvenskan', slug: 'swedish-allsvenskan', country: 'Sweden', flag: '🇸🇪', logo: leagueLogo(310, 'allsvenskan'), season: '2025/2026', featured: false, tier: 3, description: "Sweden's premier football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 332, name: 'Ukrainian Premier League', slug: 'ukrainian-premier-league', country: 'Ukraine', flag: '🇺🇦', logo: leagueLogo(332, 'premier-league'), season: '2025/2026', featured: false, tier: 3, description: "Ukraine's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 161, name: 'Croatian First League', slug: 'croatian-first-league', country: 'Croatia', flag: '🇭🇷', logo: leagueLogo(161, '1-hnl'), season: '2025/2026', featured: false, tier: 3, description: "Croatia's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 286, name: 'Serbian SuperLiga', slug: 'serbian-superliga', country: 'Serbia', flag: '🇷🇸', logo: leagueLogo(286, 'super-liga'), season: '2025/2026', featured: false, tier: 3, description: "Serbia's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 271, name: 'Romanian Liga 1', slug: 'romanian-liga-1', country: 'Romania', flag: '🇷🇴', logo: leagueLogo(271, 'liga-1'), season: '2025/2026', featured: false, tier: 3, description: "Romania's top football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },

  // ─── Domestic Cups ──────────────────────────────────────────────────────────
  { id: 146, name: 'FA Cup', slug: 'fa-cup', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(146, 'fa-cup'), season: '2025/2026', featured: true, tier: 1, description: "The world's oldest domestic cup competition.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 151, name: 'EFL League Cup', slug: 'efl-league-cup', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(151, 'efl-cup'), season: '2025/2026', featured: false, tier: 2, description: 'English League Cup (Carabao Cup).', category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 300, name: 'Copa del Rey', slug: 'copa-del-rey', country: 'Spain', flag: '🇪🇸', logo: leagueLogo(300, 'copa-del-rey'), season: '2025/2026', featured: false, tier: 2, description: "Spain's prestigious domestic knockout cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 173, name: 'DFB-Pokal', slug: 'dfb-pokal', country: 'Germany', flag: '🇩🇪', logo: leagueLogo(173, 'dfb-pokal'), season: '2025/2026', featured: false, tier: 2, description: "Germany's knockout domestic cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 205, name: 'Coppa Italia', slug: 'coppa-italia', country: 'Italy', flag: '🇮🇹', logo: leagueLogo(205, 'coppa-italia'), season: '2025/2026', featured: false, tier: 2, description: "Italy's main domestic cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 166, name: 'Coupe de France', slug: 'coupe-de-france', country: 'France', flag: '🇫🇷', logo: leagueLogo(166, 'coupe-de-france'), season: '2025/2026', featured: false, tier: 2, description: "France's national football cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── FIFA International Competitions ────────────────────────────────────────
  { id: 28, name: 'FIFA World Cup', slug: 'fifa-world-cup', country: 'International', flag: '🌐', logo: leagueLogo(28, 'fifa-world-cup'), season: '2026', featured: true, tier: 1, description: "The greatest show on earth — FIFA's premier international tournament.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 140, name: 'FIFA World Cup Women', slug: 'fifa-world-cup-women', country: 'International', flag: '🌐', logo: leagueLogo(140, 'fifa-womens-world-cup'), season: '2027', featured: true, tier: 1, description: "FIFA Women's World Cup — the pinnacle of women's international football.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'women', ageGroup: 'senior' },
  { id: 139, name: 'FIFA U-20 World Cup', slug: 'fifa-u20-world-cup', country: 'International', flag: '🌐', logo: leagueLogo(139, 'fifa-u20-world-cup'), season: '2025', featured: false, tier: 2, description: "FIFA's premier youth competition for under-20 national teams.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u20' },
  { id: 138, name: 'FIFA U-17 World Cup', slug: 'fifa-u17-world-cup', country: 'International', flag: '🌐', logo: leagueLogo(138, 'fifa-u17-world-cup'), season: '2025', featured: false, tier: 2, description: "FIFA's youth tournament for under-17 teams.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u17' },
  { id: 531, name: 'FIFA Club World Cup', slug: 'fifa-club-world-cup', country: 'International', flag: '🌐', logo: leagueLogo(531, 'fifa-club-world-cup'), season: '2025', featured: true, tier: 1, description: "The expanded FIFA Club World Cup featuring top clubs from all confederations.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 29, name: 'FIFA World Cup Qualifiers', slug: 'fifa-wc-qualifiers', country: 'International', flag: '🌐', logo: leagueLogo(29, 'world-cup-qualification'), season: '2025/2026', featured: false, tier: 2, description: 'World Cup qualification matches across all confederations.', category: 'fifa', competitionType: 'league', hasGroups: true, hasKnockout: false, gender: 'men', ageGroup: 'senior' },

  // ─── UEFA National Team Competitions ────────────────────────────────────────
  { id: 1, name: 'UEFA EURO', slug: 'uefa-euro', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(1, 'european-championship'), season: '2028', featured: true, tier: 1, description: 'The European Championship for senior national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 5, name: 'UEFA Nations League', slug: 'uefa-nations-league', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(5, 'uefa-nations-league'), season: '2025/2026', featured: true, tier: 1, description: "UEFA's competitive national team league format.", category: 'uefa-national', competitionType: 'league', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 373, name: 'UEFA EURO U-21', slug: 'uefa-euro-u21', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(373, 'u21-european-championship'), season: '2025', featured: false, tier: 2, description: 'European Championship for U-21 national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u21' },
  { id: 374, name: 'UEFA EURO U-19', slug: 'uefa-euro-u19', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(374, 'u19-european-championship'), season: '2025', featured: false, tier: 3, description: 'European Championship for U-19 national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u19' },
  { id: 375, name: 'UEFA EURO U-17', slug: 'uefa-euro-u17', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(375, 'u17-european-championship'), season: '2025', featured: false, tier: 3, description: 'European Championship for U-17 national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u17' },
  { id: 141, name: "UEFA Women's EURO", slug: 'uefa-womens-euro', country: 'Europe', flag: '🇪🇺', logo: leagueLogo(141, 'uefa-womens-euro'), season: '2025', featured: false, tier: 2, description: "The European Women's Championship.", category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'women', ageGroup: 'senior' },

  // ─── CONMEBOL (South America) ───────────────────────────────────────────────
  { id: 17, name: 'Copa América', slug: 'copa-america', country: 'South America', flag: '🌎', logo: leagueLogo(17, 'copa-america'), season: '2028', featured: true, tier: 1, description: "South America's premier international football tournament.", category: 'conmebol', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 13, name: 'Copa Libertadores', slug: 'copa-libertadores', country: 'South America', flag: '🌎', logo: leagueLogo(13, 'copa-libertadores'), season: '2025', featured: true, tier: 1, description: "South America's most prestigious club competition.", category: 'conmebol', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 14, name: 'Copa Sudamericana', slug: 'copa-sudamericana', country: 'South America', flag: '🌎', logo: leagueLogo(14, 'copa-sudamericana'), season: '2025', featured: false, tier: 2, description: "South America's secondary club competition.", category: 'conmebol', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── CAF (Africa) ───────────────────────────────────────────────────────────
  { id: 6, name: 'Africa Cup of Nations', slug: 'afcon', country: 'Africa', flag: '🌍', logo: leagueLogo(6, 'africa-cup-of-nations'), season: '2025', featured: true, tier: 1, description: "Africa's premier national team football tournament.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 19, name: 'CAF Champions League', slug: 'caf-champions-league', country: 'Africa', flag: '🌍', logo: leagueLogo(19, 'caf-champions-league'), season: '2025', featured: true, tier: 1, description: "Africa's most prestigious club competition.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 20, name: 'CAF Confederation Cup', slug: 'caf-confederation-cup', country: 'Africa', flag: '🌍', logo: leagueLogo(20, 'caf-confederation-cup'), season: '2025', featured: false, tier: 2, description: "Africa's second-tier club competition.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 360, name: 'CHAN', slug: 'chan', country: 'Africa', flag: '🌍', logo: leagueLogo(360, 'chan'), season: '2025', featured: false, tier: 2, description: 'African Nations Championship for domestic-based players.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 362, name: 'AFCON U-20', slug: 'afcon-u20', country: 'Africa', flag: '🌍', logo: leagueLogo(362, 'africa-u20-cup-of-nations'), season: '2025', featured: false, tier: 3, description: 'Africa Cup of Nations for under-20 teams.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u20' },
  { id: 363, name: 'AFCON U-17', slug: 'afcon-u17', country: 'Africa', flag: '🌍', logo: leagueLogo(363, 'africa-u17-cup-of-nations'), season: '2025', featured: false, tier: 3, description: 'Africa Cup of Nations for under-17 teams.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u17' },
  { id: 365, name: 'AFCON Women', slug: 'afcon-women', country: 'Africa', flag: '🌍', logo: leagueLogo(365, 'africa-womens-cup-of-nations'), season: '2025', featured: false, tier: 2, description: "Africa Women's Cup of Nations.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'women', ageGroup: 'senior' },
  { id: 631, name: 'WAFU-B Nations Cup', slug: 'wafu-b-nations-cup', country: 'West Africa', flag: '🌍', logo: leagueLogo(631, 'wafu'), season: '2025', featured: false, tier: 3, description: 'West African Football Union (Zone B) tournament.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── CONCACAF ───────────────────────────────────────────────────────────────
  { id: 18, name: 'CONCACAF Gold Cup', slug: 'concacaf-gold-cup', country: 'North America', flag: '🌎', logo: leagueLogo(18, 'concacaf-gold-cup'), season: '2025', featured: false, tier: 2, description: 'Championship for CONCACAF senior national teams.', category: 'concacaf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 487, name: 'CONCACAF Nations League', slug: 'concacaf-nations-league', country: 'North America', flag: '🌎', logo: leagueLogo(487, 'concacaf-nations-league'), season: '2025/2026', featured: false, tier: 2, description: "CONCACAF's competitive league-format national team competition.", category: 'concacaf', competitionType: 'league', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 489, name: 'CONCACAF Champions Cup', slug: 'concacaf-champions-cup', country: 'North America', flag: '🌎', logo: leagueLogo(489, 'concacaf-champions-cup'), season: '2025', featured: false, tier: 2, description: "CONCACAF's premier club competition.", category: 'concacaf', competitionType: 'knockout', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── AFC (Asia) ─────────────────────────────────────────────────────────────
  { id: 15, name: 'AFC Asian Cup', slug: 'afc-asian-cup', country: 'Asia', flag: '🌏', logo: leagueLogo(15, 'afc-asian-cup'), season: '2027', featured: false, tier: 2, description: "Asia's premier national team tournament.", category: 'afc', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 16, name: 'AFC Champions League Elite', slug: 'afc-champions-league', country: 'Asia', flag: '🌏', logo: leagueLogo(16, 'afc-champions-league'), season: '2025', featured: false, tier: 2, description: "Asia's elite club competition.", category: 'afc', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── Major Global Leagues ───────────────────────────────────────────────────
  { id: 330, name: 'MLS', slug: 'mls', country: 'USA', flag: '🇺🇸', logo: leagueLogo(330, 'mls'), season: '2026', featured: false, tier: 2, description: "Major League Soccer — America's top-flight football.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 99, name: 'Brasileirão Série A', slug: 'brasileirao', country: 'Brazil', flag: '🇧🇷', logo: leagueLogo(99, 'serie-a'), season: '2026', featured: false, tier: 2, description: "Brazil's premier football division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 135, name: 'Liga Profesional', slug: 'liga-profesional', country: 'Argentina', flag: '🇦🇷', logo: leagueLogo(135, 'liga-profesional'), season: '2026', featured: false, tier: 2, description: "Argentina's top division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 278, name: 'Saudi Pro League', slug: 'saudi-pro-league', country: 'Saudi Arabia', flag: '🇸🇦', logo: leagueLogo(278, 'pro-league'), season: '2025/2026', featured: false, tier: 2, description: "Saudi Arabia's top-flight — home to global superstars.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 210, name: 'J1 League', slug: 'j1-league', country: 'Japan', flag: '🇯🇵', logo: leagueLogo(210, 'j1-league'), season: '2026', featured: false, tier: 3, description: "Japan's top football division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 211, name: 'K League 1', slug: 'k-league-1', country: 'South Korea', flag: '🇰🇷', logo: leagueLogo(211, 'k-league-1'), season: '2026', featured: false, tier: 3, description: "South Korea's premier football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 188, name: 'Indian Super League', slug: 'indian-super-league', country: 'India', flag: '🇮🇳', logo: leagueLogo(188, 'indian-super-league'), season: '2025/2026', featured: false, tier: 3, description: "India's premier football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 147, name: 'A-League', slug: 'a-league', country: 'Australia', flag: '🇦🇺', logo: leagueLogo(147, 'a-league'), season: '2025/2026', featured: false, tier: 3, description: "Australia's top professional football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 178, name: 'Egyptian Premier League', slug: 'egyptian-premier-league', country: 'Egypt', flag: '🇪🇬', logo: leagueLogo(178, 'premier-league'), season: '2025/2026', featured: false, tier: 2, description: "Egypt's top football division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 288, name: 'South African PSL', slug: 'south-african-psl', country: 'South Africa', flag: '🇿🇦', logo: leagueLogo(288, 'premier-soccer-league'), season: '2025/2026', featured: false, tier: 3, description: "South Africa's Premier Soccer League.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 233, name: 'Botola Pro', slug: 'botola-pro', country: 'Morocco', flag: '🇲🇦', logo: leagueLogo(233, 'botola-pro'), season: '2025/2026', featured: false, tier: 3, description: "Morocco's top professional football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 247, name: 'NPFL', slug: 'npfl', country: 'Nigeria', flag: '🇳🇬', logo: leagueLogo(247, 'npfl'), season: '2025/2026', featured: false, tier: 3, description: "Nigeria's premier football league (NPFL).", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 198, name: 'Ghanaian Premier League', slug: 'ghanaian-premier-league', country: 'Ghana', flag: '🇬🇭', logo: leagueLogo(198, 'ghana-premier-league'), season: '2025/2026', featured: false, tier: 3, description: "Ghana's top professional football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 153, name: 'Championship', slug: 'championship', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: leagueLogo(153, 'championship'), season: '2025/2026', featured: false, tier: 2, description: "England's second tier of professional football.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
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

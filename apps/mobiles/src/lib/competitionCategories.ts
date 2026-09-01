/**
 * Competition Categories & 80 Major League Registry for GoalMills Football Platform
 *
 * This file defines the full list of 80 major football competitions covered by GoalMills,
 * organized by category. Each entry maps to an AllSports API league ID.
 *
 * Categories:
 * - european-top5: Top 5 European domestic leagues
 * - european-club: European club cups (UCL, UEL, UECL)
 * - european-domestic: Other European domestic leagues
 * - domestic-cups: Major domestic cups
 * - fifa: FIFA international competitions (men, women, youth)
 * - uefa-national: UEFA national team competitions
 * - conmebol: South American competitions
 * - caf: African competitions
 * - concacaf: North/Central American competitions
 * - afc: Asian competitions
 * - other-leagues: Major global leagues (MLS, Brasileirão, etc.)
 */

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
 * Full 80-competition registry
 *
 * AllSports API IDs sourced from https://allsportsapi.com
 * Some IDs are approximate — the system gracefully falls back if a league isn't covered.
 */
export const ALL_COMPETITIONS: CompetitionEntry[] = [
  // ─── European Top 5 ────────────────────────────────────────────────────────
  { id: 152, name: 'Premier League', slug: 'premier-league', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/152_premier-league.png', season: '2025/2026', featured: true, tier: 1, description: 'The top tier of English football featuring 20 premier clubs.', category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 302, name: 'La Liga', slug: 'la-liga', country: 'Spain', flag: '🇪🇸', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/302_la-liga.png', season: '2025/2026', featured: true, tier: 1, description: 'The pinnacle of Spanish domestic football.', category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 207, name: 'Serie A', slug: 'serie-a', country: 'Italy', flag: '🇮🇹', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/207_serie-a.png', season: '2025/2026', featured: true, tier: 1, description: 'The top league in Italian football with tactical mastery.', category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 175, name: 'Bundesliga', slug: 'bundesliga', country: 'Germany', flag: '🇩🇪', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/175_bundesliga.png', season: '2025/2026', featured: true, tier: 1, description: "Germany's top flight known for high-tempo attacking football.", category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 168, name: 'Ligue 1', slug: 'ligue-1', country: 'France', flag: '🇫🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/168_ligue-1.png', season: '2025/2026', featured: true, tier: 1, description: "France's premier football division.", category: 'european-top5', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },

  // ─── European Club Cups ────────────────────────────────────────────────────
  { id: 3, name: 'UEFA Champions League', slug: 'champions-league', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/3_uefa_champions_league.png', season: '2025/2026', featured: true, tier: 1, description: "Europe's most prestigious club football competition.", category: 'european-club', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 4, name: 'UEFA Europa League', slug: 'europa-league', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/4_uefa-europa-league.png', season: '2025/2026', featured: true, tier: 1, description: "Europe's secondary club competition with fierce knockout drama.", category: 'european-club', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 683, name: 'UEFA Conference League', slug: 'conference-league', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/683_uefa-europa-conference-league.png', season: '2025/2026', featured: false, tier: 2, description: "UEFA's third-tier European club competition.", category: 'european-club', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 2, name: 'UEFA Super Cup', slug: 'uefa-super-cup', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/2_uefa-super-cup.png', season: '2025/2026', featured: false, tier: 2, description: 'Annual match between UCL and UEL winners.', category: 'european-club', competitionType: 'knockout', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── European Domestic Leagues ──────────────────────────────────────────────
  { id: 244, name: 'Eredivisie', slug: 'eredivisie', country: 'Netherlands', flag: '🇳🇱', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/244_eredivisie.png', season: '2025/2026', featured: false, tier: 2, description: 'The top division of Dutch football.', category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 266, name: 'Liga Portugal', slug: 'liga-portugal', country: 'Portugal', flag: '🇵🇹', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/266_liga-portugal.png', season: '2025/2026', featured: false, tier: 2, description: "Portugal's top flight featuring elite European talent.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 179, name: 'Scottish Premiership', slug: 'scottish-premiership', country: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/179_scottish-premiership.png', season: '2025/2026', featured: false, tier: 2, description: "Scotland's top domestic football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 322, name: 'Turkish Süper Lig', slug: 'turkish-super-lig', country: 'Turkey', flag: '🇹🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/322_super-lig.png', season: '2025/2026', featured: false, tier: 2, description: "Turkey's premier football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 344, name: 'Belgian Pro League', slug: 'belgian-pro-league', country: 'Belgium', flag: '🇧🇪', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/344_pro-league.png', season: '2025/2026', featured: false, tier: 2, description: "Belgium's top flight, producer of world-class talent.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 308, name: 'Swiss Super League', slug: 'swiss-super-league', country: 'Switzerland', flag: '🇨🇭', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/308_super-league.png', season: '2025/2026', featured: false, tier: 3, description: "Switzerland's premier football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 148, name: 'Austrian Bundesliga', slug: 'austrian-bundesliga', country: 'Austria', flag: '🇦🇹', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/148_bundesliga.png', season: '2025/2026', featured: false, tier: 3, description: "Austria's top football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 197, name: 'Greek Super League', slug: 'greek-super-league', country: 'Greece', flag: '🇬🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/197_super-league.png', season: '2025/2026', featured: false, tier: 3, description: "Greece's top football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 283, name: 'Russian Premier League', slug: 'russian-premier-league', country: 'Russia', flag: '🇷🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/283_premier-league.png', season: '2025/2026', featured: false, tier: 2, description: "Russia's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 164, name: 'Czech First League', slug: 'czech-first-league', country: 'Czech Republic', flag: '🇨🇿', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/164_first-league.png', season: '2025/2026', featured: false, tier: 3, description: 'Top division in Czech football.', category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 259, name: 'Polish Ekstraklasa', slug: 'polish-ekstraklasa', country: 'Poland', flag: '🇵🇱', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/259_ekstraklasa.png', season: '2025/2026', featured: false, tier: 3, description: "Poland's premier football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 165, name: 'Danish Superliga', slug: 'danish-superliga', country: 'Denmark', flag: '🇩🇰', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/165_superliga.png', season: '2025/2026', featured: false, tier: 3, description: "Denmark's top football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 249, name: 'Norwegian Eliteserien', slug: 'norwegian-eliteserien', country: 'Norway', flag: '🇳🇴', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/249_eliteserien.png', season: '2025/2026', featured: false, tier: 3, description: "Norway's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 310, name: 'Swedish Allsvenskan', slug: 'swedish-allsvenskan', country: 'Sweden', flag: '🇸🇪', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/310_allsvenskan.png', season: '2025/2026', featured: false, tier: 3, description: "Sweden's premier football division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 332, name: 'Ukrainian Premier League', slug: 'ukrainian-premier-league', country: 'Ukraine', flag: '🇺🇦', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/332_premier-league.png', season: '2025/2026', featured: false, tier: 3, description: "Ukraine's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 161, name: 'Croatian First League', slug: 'croatian-first-league', country: 'Croatia', flag: '🇭🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/161_1-hnl.png', season: '2025/2026', featured: false, tier: 3, description: "Croatia's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 286, name: 'Serbian SuperLiga', slug: 'serbian-superliga', country: 'Serbia', flag: '🇷🇸', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/286_super-liga.png', season: '2025/2026', featured: false, tier: 3, description: "Serbia's top division.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 271, name: 'Romanian Liga 1', slug: 'romanian-liga-1', country: 'Romania', flag: '🇷🇴', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/271_liga-1.png', season: '2025/2026', featured: false, tier: 3, description: "Romania's top football league.", category: 'european-domestic', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },

  // ─── Domestic Cups ──────────────────────────────────────────────────────────
  { id: 146, name: 'FA Cup', slug: 'fa-cup', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/146_fa-cup.png', season: '2025/2026', featured: true, tier: 1, description: "The world's oldest domestic cup competition.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 151, name: 'EFL League Cup', slug: 'efl-league-cup', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/151_efl-cup.png', season: '2025/2026', featured: false, tier: 2, description: 'English League Cup (Carabao Cup).', category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 300, name: 'Copa del Rey', slug: 'copa-del-rey', country: 'Spain', flag: '🇪🇸', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/300_copa-del-rey.png', season: '2025/2026', featured: false, tier: 2, description: "Spain's prestigious domestic knockout cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 173, name: 'DFB-Pokal', slug: 'dfb-pokal', country: 'Germany', flag: '🇩🇪', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/173_dfb-pokal.png', season: '2025/2026', featured: false, tier: 2, description: "Germany's knockout domestic cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 205, name: 'Coppa Italia', slug: 'coppa-italia', country: 'Italy', flag: '🇮🇹', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/205_coppa-italia.png', season: '2025/2026', featured: false, tier: 2, description: "Italy's main domestic cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 166, name: 'Coupe de France', slug: 'coupe-de-france', country: 'France', flag: '🇫🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/166_coupe-de-france.png', season: '2025/2026', featured: false, tier: 2, description: "France's national football cup.", category: 'domestic-cups', competitionType: 'cup', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── FIFA International Competitions ────────────────────────────────────────
  { id: 28, name: 'FIFA World Cup', slug: 'fifa-world-cup', country: 'International', flag: '🌐', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/28_fifa-world-cup.png', season: '2026', featured: true, tier: 1, description: "The greatest show on earth — FIFA's premier international tournament.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 140, name: 'FIFA World Cup Women', slug: 'fifa-world-cup-women', country: 'International', flag: '🌐', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/140_fifa-womens-world-cup.png', season: '2027', featured: true, tier: 1, description: "FIFA Women's World Cup — the pinnacle of women's international football.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'women', ageGroup: 'senior' },
  { id: 139, name: 'FIFA U-20 World Cup', slug: 'fifa-u20-world-cup', country: 'International', flag: '🌐', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/139_fifa-u20-world-cup.png', season: '2025', featured: false, tier: 2, description: "FIFA's premier youth competition for under-20 national teams.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u20' },
  { id: 138, name: 'FIFA U-17 World Cup', slug: 'fifa-u17-world-cup', country: 'International', flag: '🌐', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/138_fifa-u17-world-cup.png', season: '2025', featured: false, tier: 2, description: "FIFA's youth tournament for under-17 teams.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u17' },
  { id: 531, name: 'FIFA Club World Cup', slug: 'fifa-club-world-cup', country: 'International', flag: '🌐', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/531_fifa-club-world-cup.png', season: '2025', featured: true, tier: 1, description: "The expanded FIFA Club World Cup featuring top clubs from all confederations.", category: 'fifa', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 29, name: 'FIFA World Cup Qualifiers', slug: 'fifa-wc-qualifiers', country: 'International', flag: '🌐', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/29_world-cup-qualification.png', season: '2025/2026', featured: false, tier: 2, description: 'World Cup qualification matches across all confederations.', category: 'fifa', competitionType: 'league', hasGroups: true, hasKnockout: false, gender: 'men', ageGroup: 'senior' },

  // ─── UEFA National Team Competitions ────────────────────────────────────────
  { id: 1, name: 'UEFA EURO', slug: 'uefa-euro', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/1_european-championship.png', season: '2028', featured: true, tier: 1, description: 'The European Championship for senior national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 5, name: 'UEFA Nations League', slug: 'uefa-nations-league', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/5_uefa-nations-league.png', season: '2025/2026', featured: true, tier: 1, description: "UEFA's competitive national team league format.", category: 'uefa-national', competitionType: 'league', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 373, name: 'UEFA EURO U-21', slug: 'uefa-euro-u21', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/373_u21-european-championship.png', season: '2025', featured: false, tier: 2, description: 'European Championship for U-21 national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u21' },
  { id: 374, name: 'UEFA EURO U-19', slug: 'uefa-euro-u19', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/374_u19-european-championship.png', season: '2025', featured: false, tier: 3, description: 'European Championship for U-19 national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u19' },
  { id: 375, name: 'UEFA EURO U-17', slug: 'uefa-euro-u17', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/375_u17-european-championship.png', season: '2025', featured: false, tier: 3, description: 'European Championship for U-17 national teams.', category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u17' },
  { id: 141, name: "UEFA Women's EURO", slug: 'uefa-womens-euro', country: 'Europe', flag: '🇪🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/141_uefa-womens-euro.png', season: '2025', featured: false, tier: 2, description: "The European Women's Championship.", category: 'uefa-national', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'women', ageGroup: 'senior' },

  // ─── CONMEBOL (South America) ───────────────────────────────────────────────
  { id: 17, name: 'Copa América', slug: 'copa-america', country: 'South America', flag: '🌎', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/17_copa-america.png', season: '2028', featured: true, tier: 1, description: "South America's premier international football tournament.", category: 'conmebol', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 13, name: 'Copa Libertadores', slug: 'copa-libertadores', country: 'South America', flag: '🌎', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/13_copa-libertadores.png', season: '2025', featured: true, tier: 1, description: "South America's most prestigious club competition.", category: 'conmebol', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 14, name: 'Copa Sudamericana', slug: 'copa-sudamericana', country: 'South America', flag: '🌎', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/14_copa-sudamericana.png', season: '2025', featured: false, tier: 2, description: "South America's secondary club competition.", category: 'conmebol', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── CAF (Africa) ───────────────────────────────────────────────────────────
  { id: 6, name: 'Africa Cup of Nations', slug: 'afcon', country: 'Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/6_africa-cup-of-nations.png', season: '2025', featured: true, tier: 1, description: "Africa's premier national team football tournament.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 19, name: 'CAF Champions League', slug: 'caf-champions-league', country: 'Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/19_caf-champions-league.png', season: '2025', featured: true, tier: 1, description: "Africa's most prestigious club competition.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 20, name: 'CAF Confederation Cup', slug: 'caf-confederation-cup', country: 'Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/20_caf-confederation-cup.png', season: '2025', featured: false, tier: 2, description: "Africa's second-tier club competition.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 360, name: 'CHAN', slug: 'chan', country: 'Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/360_chan.png', season: '2025', featured: false, tier: 2, description: 'African Nations Championship for domestic-based players.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 362, name: 'AFCON U-20', slug: 'afcon-u20', country: 'Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/362_africa-u20-cup-of-nations.png', season: '2025', featured: false, tier: 3, description: 'Africa Cup of Nations for under-20 teams.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u20' },
  { id: 363, name: 'AFCON U-17', slug: 'afcon-u17', country: 'Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/363_africa-u17-cup-of-nations.png', season: '2025', featured: false, tier: 3, description: 'Africa Cup of Nations for under-17 teams.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'u17' },
  { id: 365, name: 'AFCON Women', slug: 'afcon-women', country: 'Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/365_africa-womens-cup-of-nations.png', season: '2025', featured: false, tier: 2, description: "Africa Women's Cup of Nations.", category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'women', ageGroup: 'senior' },
  { id: 631, name: 'WAFU-B Nations Cup', slug: 'wafu-b-nations-cup', country: 'West Africa', flag: '🌍', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/631_wafu.png', season: '2025', featured: false, tier: 3, description: 'West African Football Union (Zone B) tournament.', category: 'caf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── CONCACAF ───────────────────────────────────────────────────────────────
  { id: 18, name: 'CONCACAF Gold Cup', slug: 'concacaf-gold-cup', country: 'North America', flag: '🌎', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/18_concacaf-gold-cup.png', season: '2025', featured: false, tier: 2, description: 'Championship for CONCACAF senior national teams.', category: 'concacaf', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 487, name: 'CONCACAF Nations League', slug: 'concacaf-nations-league', country: 'North America', flag: '🌎', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/487_concacaf-nations-league.png', season: '2025/2026', featured: false, tier: 2, description: "CONCACAF's competitive league-format national team competition.", category: 'concacaf', competitionType: 'league', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 489, name: 'CONCACAF Champions Cup', slug: 'concacaf-champions-cup', country: 'North America', flag: '🌎', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/489_concacaf-champions-cup.png', season: '2025', featured: false, tier: 2, description: "CONCACAF's premier club competition.", category: 'concacaf', competitionType: 'knockout', hasGroups: false, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── AFC (Asia) ─────────────────────────────────────────────────────────────
  { id: 15, name: 'AFC Asian Cup', slug: 'afc-asian-cup', country: 'Asia', flag: '🌏', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/15_afc-asian-cup.png', season: '2027', featured: false, tier: 2, description: "Asia's premier national team tournament.", category: 'afc', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },
  { id: 16, name: 'AFC Champions League Elite', slug: 'afc-champions-league', country: 'Asia', flag: '🌏', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/16_afc-champions-league.png', season: '2025', featured: false, tier: 2, description: "Asia's elite club competition.", category: 'afc', competitionType: 'knockout', hasGroups: true, hasKnockout: true, gender: 'men', ageGroup: 'senior' },

  // ─── Major Global Leagues ───────────────────────────────────────────────────
  { id: 332, name: 'MLS', slug: 'mls', country: 'USA', flag: '🇺🇸', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/332_mls.png', season: '2026', featured: false, tier: 2, description: "Major League Soccer — America's top-flight football.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 99, name: 'Brasileirão Série A', slug: 'brasileirao', country: 'Brazil', flag: '🇧🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/99_serie-a.png', season: '2026', featured: false, tier: 2, description: "Brazil's premier football division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 135, name: 'Liga Profesional', slug: 'liga-profesional', country: 'Argentina', flag: '🇦🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/135_liga-profesional.png', season: '2026', featured: false, tier: 2, description: "Argentina's top division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 278, name: 'Saudi Pro League', slug: 'saudi-pro-league', country: 'Saudi Arabia', flag: '🇸🇦', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/278_pro-league.png', season: '2025/2026', featured: false, tier: 2, description: "Saudi Arabia's top-flight — home to global superstars.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 210, name: 'J1 League', slug: 'j1-league', country: 'Japan', flag: '🇯🇵', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/210_j1-league.png', season: '2026', featured: false, tier: 3, description: "Japan's top football division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 211, name: 'K League 1', slug: 'k-league-1', country: 'South Korea', flag: '🇰🇷', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/211_k-league-1.png', season: '2026', featured: false, tier: 3, description: "South Korea's premier football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 188, name: 'Indian Super League', slug: 'indian-super-league', country: 'India', flag: '🇮🇳', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/188_indian-super-league.png', season: '2025/2026', featured: false, tier: 3, description: "India's premier football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 147, name: 'A-League', slug: 'a-league', country: 'Australia', flag: '🇦🇺', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/147_a-league.png', season: '2025/2026', featured: false, tier: 3, description: "Australia's top professional football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 178, name: 'Egyptian Premier League', slug: 'egyptian-premier-league', country: 'Egypt', flag: '🇪🇬', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/178_premier-league.png', season: '2025/2026', featured: false, tier: 2, description: "Egypt's top football division.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 288, name: 'South African PSL', slug: 'south-african-psl', country: 'South Africa', flag: '🇿🇦', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/288_premier-soccer-league.png', season: '2025/2026', featured: false, tier: 3, description: "South Africa's Premier Soccer League.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 233, name: 'Botola Pro', slug: 'botola-pro', country: 'Morocco', flag: '🇲🇦', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/233_botola-pro.png', season: '2025/2026', featured: false, tier: 3, description: "Morocco's top professional football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 247, name: 'NPFL', slug: 'npfl', country: 'Nigeria', flag: '🇳🇬', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/247_npfl.png', season: '2025/2026', featured: false, tier: 3, description: "Nigeria's premier football league (NPFL).", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 198, name: 'Ghanaian Premier League', slug: 'ghanaian-premier-league', country: 'Ghana', flag: '🇬🇭', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/198_ghana-premier-league.png', season: '2025/2026', featured: false, tier: 3, description: "Ghana's top professional football league.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
  { id: 153, name: 'Championship', slug: 'championship', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/153_championship.png', season: '2025/2026', featured: false, tier: 2, description: "England's second tier of professional football.", category: 'other-leagues', competitionType: 'league', hasGroups: false, hasKnockout: false, gender: 'men', ageGroup: 'senior' },
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

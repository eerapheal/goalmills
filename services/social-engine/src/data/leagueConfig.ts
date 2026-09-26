/**
 * GoalMills Social Engine — League Configuration
 *
 * Top 5 European football leagues with their AllSportsAPI IDs,
 * brand colors, and metadata for image generation.
 */

export interface LeagueConfig {
  id: number;
  name: string;
  shortName: string;
  country: string;
  countryFlag: string;
  primaryColor: string;
  color?: string;
  secondaryColor: string;
  logo: string;
  hashtag: string;
}

/**
 * Top 5 European leagues configuration.
 * League IDs correspond to AllSportsAPI identifiers.
 */
export const TOP_5_LEAGUES: Record<string, LeagueConfig> = {
  PREMIER_LEAGUE: {
    id: 152,
    name: 'Premier League',
    shortName: 'PL',
    country: 'England',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    primaryColor: '#3d195b',
    secondaryColor: '#00ff85',
    logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/152_premier-league.png',
    hashtag: '#PremierLeague',
  },
  LA_LIGA: {
    id: 302,
    name: 'La Liga',
    shortName: 'LaLiga',
    country: 'Spain',
    countryFlag: '🇪🇸',
    primaryColor: '#ee8707',
    secondaryColor: '#1a1a2e',
    logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/302_la-liga.png',
    hashtag: '#LaLiga',
  },
  SERIE_A: {
    id: 207,
    name: 'Serie A',
    shortName: 'SerieA',
    country: 'Italy',
    countryFlag: '🇮🇹',
    primaryColor: '#024494',
    secondaryColor: '#008fd5',
    logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/207_serie-a.png',
    hashtag: '#SerieA',
  },
  BUNDESLIGA: {
    id: 175,
    name: 'Bundesliga',
    shortName: 'BL',
    country: 'Germany',
    countryFlag: '🇩🇪',
    primaryColor: '#d20515',
    secondaryColor: '#000000',
    logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/175_bundesliga.png',
    hashtag: '#Bundesliga',
  },
  LIGUE_1: {
    id: 168,
    name: 'Ligue 1',
    shortName: 'L1',
    country: 'France',
    countryFlag: '🇫🇷',
    primaryColor: '#091c3e',
    secondaryColor: '#dae025',
    logo: 'https://apiv2.allsportsapi.com/logo/logo_leagues/168_ligue-1.png',
    hashtag: '#Ligue1',
  },
};

/** Array of all league configs for iteration */
export const ALL_LEAGUES = Object.values(TOP_5_LEAGUES);

/** Lookup league config by AllSportsAPI league ID */
export function getLeagueById(leagueId: number): LeagueConfig | undefined {
  return ALL_LEAGUES.find((l) => l.id === leagueId);
}

/** GoalMills brand constants used across all graphics */
export const BRAND = {
  name: 'GoalMills',
  tagline: 'Your Premier Sports Intelligence Platform',
  url: 'goalmills.com',
  hashtag: '#GoalMills',
  colors: {
    primary: '#f59e0b',     // Amber
    dark: '#0f172a',        // Slate 900
    darker: '#020617',      // Slate 950
    accent: '#fbbf24',      // Amber 400
    text: '#ffffff',
    textMuted: '#94a3b8',   // Slate 400
    success: '#22c55e',
    danger: '#ef4444',
  },
  icon: 'https://goalmills.com/icon.png',
};

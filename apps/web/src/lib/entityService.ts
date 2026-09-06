import { TransferItem, ArticleType } from '@goalmills/types';
import { ALL_COMPETITIONS, CompetitionEntry, getCompetitionMap } from './competitionCategories';

export interface CompetitionMeta {
  id: number;
  name: string;
  slug: string;
  country: string;
  logo: string;
  season: string;
  featured: boolean;
  tier: number;
  description: string;
}

export interface ClubMeta {
  id: number;
  name: string;
  slug: string;
  shortName: string;
  competitionSlug: string;
  competitionName: string;
  logo: string;
  stadium: string;
  founded: number;
  manager: string;
  position: number;
  featuredPlayerSlugs: string[];
}

export interface PlayerMeta {
  id: number;
  name: string;
  slug: string;
  number: number;
  position: string;
  nationality: string;
  countryFlag?: string;
  clubSlug: string;
  clubName: string;
  competitionSlug: string;
  photo: string;
  age: number;
  height: string;
  marketValue: string;
  bio: string;
  seasonStats: {
    appearances: number;
    goals: number;
    assists: number;
    yellowCards: number;
    cleanSheets?: number;
    passAccuracy: string;
    rating: number;
  };
}

export interface OfficialMatchLog {
  date: string;
  competition: string;
  fixture: string;
  yellowCards: number;
  redCards: number;
  penalties: number;
  varDecision?: string;
}

export interface OfficialMeta {
  id: number;
  name: string;
  slug: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  role: string;
  fifaBadgeSince: number;
  competitions: string[];
  photo: string;
  age: number;
  matches: number;
  foulsPerGame: number;
  yellowCardsTotal: number;
  yellowCardsPerGame: number;
  redCardsTotal: number;
  redCardsPerGame: number;
  penaltiesAwardedTotal: number;
  penaltiesPerGame: number;
  varAccuracy: string;
  strictnessRating: 'Strict' | 'Balanced' | 'Permissive' | 'High-Card Index';
  bio: string;
  recentMatches: OfficialMatchLog[];
}

export interface CoachClubTenure {
  club: string;
  clubLogo?: string;
  years: string;
  matches: number;
  winRate: string;
}

export interface CoachMeta {
  id: number;
  name: string;
  slug: string;
  nationality: string;
  countryCode: string;
  countryFlag: string;
  currentClubSlug: string;
  currentClubName: string;
  competitionSlug: string;
  photo: string;
  age: number;
  preferredFormation: string;
  coachingStyle: string;
  matchesManaged: number;
  winPercentage: number;
  drawPercentage: number;
  lossPercentage: number;
  trophiesCount: number;
  majorHonours: string[];
  bio: string;
  careerClubs: CoachClubTenure[];
}

/**
 * Auto-build COMPETITIONS_REGISTRY from the master 80-competition list.
 * This ensures backward compatibility with code that does COMPETITIONS_REGISTRY['premier-league'].
 */
function buildCompetitionsRegistry(): Record<string, CompetitionMeta> {
  const registry: Record<string, CompetitionMeta> = {};
  for (const comp of ALL_COMPETITIONS) {
    registry[comp.slug] = {
      id: comp.id,
      name: comp.name,
      slug: comp.slug,
      country: comp.country,
      logo: comp.logo,
      season: comp.season,
      featured: comp.featured,
      tier: comp.tier,
      description: comp.description,
    };
  }
  return registry;
}

export const COMPETITIONS_REGISTRY: Record<string, CompetitionMeta> = buildCompetitionsRegistry();

export const CLUBS_REGISTRY: Record<string, ClubMeta> = {
  arsenal: {
    id: 42,
    name: 'Arsenal FC',
    slug: 'arsenal',
    shortName: 'Arsenal',
    competitionSlug: 'premier-league',
    competitionName: 'Premier League',
    logo: 'https://media.api-sports.io/football/teams/42.png',
    stadium: 'Emirates Stadium, London',
    founded: 1886,
    manager: 'Mikel Arteta',
    position: 2,
    featuredPlayerSlugs: ['bukayo-saka', 'martin-odegaard', 'declan-rice'],
  },
  chelsea: {
    id: 49,
    name: 'Chelsea FC',
    slug: 'chelsea',
    shortName: 'Chelsea',
    competitionSlug: 'premier-league',
    competitionName: 'Premier League',
    logo: 'https://media.api-sports.io/football/teams/49.png',
    stadium: 'Stamford Bridge, London',
    founded: 1905,
    manager: 'Enzo Maresca',
    position: 4,
    featuredPlayerSlugs: ['cole-palmer', 'enzo-fernandez', 'moises-caicedo'],
  },
  liverpool: {
    id: 40,
    name: 'Liverpool FC',
    slug: 'liverpool',
    shortName: 'Liverpool',
    competitionSlug: 'premier-league',
    competitionName: 'Premier League',
    logo: 'https://media.api-sports.io/football/teams/40.png',
    stadium: 'Anfield, Liverpool',
    founded: 1892,
    manager: 'Arne Slot',
    position: 1,
    featuredPlayerSlugs: ['mohamed-salah', 'virgil-van-dijk', 'trent-alexander-arnold'],
  },
  'manchester-city': {
    id: 50,
    name: 'Manchester City FC',
    slug: 'manchester-city',
    shortName: 'Man City',
    competitionSlug: 'premier-league',
    competitionName: 'Premier League',
    logo: 'https://media.api-sports.io/football/teams/50.png',
    stadium: 'Etihad Stadium, Manchester',
    founded: 1880,
    manager: 'Pep Guardiola',
    position: 3,
    featuredPlayerSlugs: ['erling-haaland', 'kevin-de-bruyne', 'rodri'],
  },
  'real-madrid': {
    id: 541,
    name: 'Real Madrid CF',
    slug: 'real-madrid',
    shortName: 'Real Madrid',
    competitionSlug: 'la-liga',
    competitionName: 'La Liga',
    logo: 'https://media.api-sports.io/football/teams/541.png',
    stadium: 'Santiago Bernabéu, Madrid',
    founded: 1902,
    manager: 'Carlo Ancelotti',
    position: 1,
    featuredPlayerSlugs: ['jude-bellingham', 'vinicius-junior', 'kylian-mbappe'],
  },
  barcelona: {
    id: 529,
    name: 'FC Barcelona',
    slug: 'barcelona',
    shortName: 'Barcelona',
    competitionSlug: 'la-liga',
    competitionName: 'La Liga',
    logo: 'https://media.api-sports.io/football/teams/529.png',
    stadium: 'Spotify Camp Nou, Barcelona',
    founded: 1899,
    manager: 'Hansi Flick',
    position: 2,
    featuredPlayerSlugs: ['lamine-yamal', 'robert-lewandowski', 'pedri'],
  },
  galatasaray: {
    id: 645,
    name: 'Galatasaray SK',
    slug: 'galatasaray',
    shortName: 'Galatasaray',
    competitionSlug: 'african-football',
    competitionName: 'European & African Stars',
    logo: 'https://media.api-sports.io/football/teams/645.png',
    stadium: 'Rams Park, Istanbul',
    founded: 1905,
    manager: 'Okan Buruk',
    position: 1,
    featuredPlayerSlugs: ['victor-osimhen'],
  },
};

export const PLAYERS_REGISTRY: Record<string, PlayerMeta> = {
  'victor-osimhen': {
    id: 101,
    name: 'Victor Osimhen',
    slug: 'victor-osimhen',
    number: 45,
    position: 'Striker / Forward',
    nationality: 'Nigeria',
    countryFlag: '🇳🇬',
    clubSlug: 'galatasaray',
    clubName: 'Galatasaray (Loan from Napoli)',
    competitionSlug: 'african-football',
    photo: 'https://media.api-sports.io/football/players/1458.png',
    age: 26,
    height: '186 cm',
    marketValue: '€75.00M',
    bio: 'Victor Osimhen is a world-class Nigerian striker renowned for his explosive pace, aerial prowess, relentless pressing, and lethal finishing in front of goal.',
    seasonStats: {
      appearances: 22,
      goals: 19,
      assists: 5,
      yellowCards: 2,
      passAccuracy: '81.4%',
      rating: 8.35,
    },
  },
  'bukayo-saka': {
    id: 102,
    name: 'Bukayo Saka',
    slug: 'bukayo-saka',
    number: 7,
    position: 'Right Winger',
    nationality: 'England',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    clubSlug: 'arsenal',
    clubName: 'Arsenal FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/1467.png',
    age: 23,
    height: '178 cm',
    marketValue: '€140.00M',
    bio: 'Bukayo Saka is Arsenal and England talismanic winger celebrated for his creative vision, elite dribbling, tactical intelligence, and consistent decisive contributions in key fixtures.',
    seasonStats: {
      appearances: 24,
      goals: 12,
      assists: 14,
      yellowCards: 3,
      passAccuracy: '86.2%',
      rating: 8.15,
    },
  },
  'mohamed-salah': {
    id: 103,
    name: 'Mohamed Salah',
    slug: 'mohamed-salah',
    number: 11,
    position: 'Right Winger',
    nationality: 'Egypt',
    countryFlag: '🇪🇬',
    clubSlug: 'liverpool',
    clubName: 'Liverpool FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/306.png',
    age: 32,
    height: '175 cm',
    marketValue: '€55.00M',
    bio: 'Mohamed Salah is an iconic Egyptian forward and Premier League record-breaker, possessing peerless goalscoring instinct and leadership.',
    seasonStats: {
      appearances: 26,
      goals: 21,
      assists: 15,
      yellowCards: 1,
      passAccuracy: '83.7%',
      rating: 8.42,
    },
  },
  'erling-haaland': {
    id: 104,
    name: 'Erling Haaland',
    slug: 'erling-haaland',
    number: 9,
    position: 'Striker',
    nationality: 'Norway',
    countryFlag: '🇳🇴',
    clubSlug: 'manchester-city',
    clubName: 'Manchester City FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/1100.png',
    age: 24,
    height: '194 cm',
    marketValue: '€200.00M',
    bio: 'Erling Haaland is a generational striking powerhouse known for athletic dominance, lightning acceleration, and unmatched penalty box efficiency.',
    seasonStats: {
      appearances: 25,
      goals: 24,
      assists: 4,
      yellowCards: 2,
      passAccuracy: '76.8%',
      rating: 8.28,
    },
  },
  'martin-zubimendi': {
    id: 105,
    name: 'Martin Zubimendi',
    slug: 'martin-zubimendi',
    number: 4,
    position: 'Defensive Midfielder',
    nationality: 'Spain',
    countryFlag: '🇪🇸',
    clubSlug: 'arsenal',
    clubName: 'Arsenal FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/47519.png',
    age: 26,
    height: '181 cm',
    marketValue: '€60.00M',
    bio: 'Martin Zubimendi is an elite Spanish deep-lying midfield orchestrator, renowned for composure under pressure, positional awareness, precise distribution, and tactical defensive discipline.',
    seasonStats: {
      appearances: 26,
      goals: 3,
      assists: 6,
      yellowCards: 3,
      passAccuracy: '91.8%',
      rating: 7.92,
    },
  },
  'ademola-lookman': {
    id: 106,
    name: 'Ademola Lookman',
    slug: 'ademola-lookman',
    number: 11,
    position: 'Forward / Winger',
    nationality: 'Nigeria',
    countryFlag: '🇳🇬',
    clubSlug: 'atalanta',
    clubName: 'Atalanta BC',
    competitionSlug: 'serie-a',
    photo: 'https://media.api-sports.io/football/players/18784.png',
    age: 27,
    height: '174 cm',
    marketValue: '€60.00M',
    bio: 'Ademola Lookman is a dynamic Nigerian international forward celebrated for his historic Europa League final hat-trick, explosive dribbling, and clinical finishing.',
    seasonStats: {
      appearances: 25,
      goals: 16,
      assists: 8,
      yellowCards: 2,
      passAccuracy: '84.1%',
      rating: 8.22,
    },
  },
  'florian-wirtz': {
    id: 107,
    name: 'Florian Wirtz',
    slug: 'florian-wirtz',
    number: 10,
    position: 'Attacking Midfielder',
    nationality: 'Germany',
    countryFlag: '🇩🇪',
    clubSlug: 'leverkusen',
    clubName: 'Bayer Leverkusen',
    competitionSlug: 'bundesliga',
    photo: 'https://media.api-sports.io/football/players/138814.png',
    age: 21,
    height: '177 cm',
    marketValue: '€130.00M',
    bio: 'Florian Wirtz is a generational German playmaker with peerless vision, intricate close control, decisive final-third creativity, and goalscoring instinct.',
    seasonStats: {
      appearances: 27,
      goals: 14,
      assists: 16,
      yellowCards: 2,
      passAccuracy: '87.4%',
      rating: 8.38,
    },
  },
  'lamine-yamal': {
    id: 108,
    name: 'Lamine Yamal',
    slug: 'lamine-yamal',
    number: 19,
    position: 'Right Winger',
    nationality: 'Spain',
    countryFlag: '🇪🇸',
    clubSlug: 'barcelona',
    clubName: 'FC Barcelona',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/players/380026.png',
    age: 17,
    height: '178 cm',
    marketValue: '€180.00M',
    bio: 'Lamine Yamal is a world-class Spanish winger and Kopa Trophy winner, possessing breathtaking 1v1 dribbling, vision, and match-winning magic.',
    seasonStats: {
      appearances: 28,
      goals: 11,
      assists: 17,
      yellowCards: 1,
      passAccuracy: '85.9%',
      rating: 8.45,
    },
  },
  'kylian-mbappe': {
    id: 109,
    name: 'Kylian Mbappé',
    slug: 'kylian-mbappe',
    number: 9,
    position: 'Forward',
    nationality: 'France',
    countryFlag: '🇫🇷',
    clubSlug: 'real-madrid',
    clubName: 'Real Madrid CF',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/players/278.png',
    age: 26,
    height: '178 cm',
    marketValue: '€180.00M',
    bio: 'Kylian Mbappé is a global football superstar and World Cup winner renowned for electric speed, clinical finishing, and clutch performances.',
    seasonStats: {
      appearances: 26,
      goals: 22,
      assists: 6,
      yellowCards: 1,
      passAccuracy: '83.2%',
      rating: 8.31,
    },
  },
  'jude-bellingham': {
    id: 110,
    name: 'Jude Bellingham',
    slug: 'jude-bellingham',
    number: 5,
    position: 'Central Midfielder / Attacking Midfielder',
    nationality: 'England',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    clubSlug: 'real-madrid',
    clubName: 'Real Madrid CF',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/players/30410.png',
    age: 21,
    height: '186 cm',
    marketValue: '€180.00M',
    bio: 'Jude Bellingham is an all-action complete midfielder who combines immense physical power, late penalty box runs, technical mastery, and fierce leadership.',
    seasonStats: {
      appearances: 25,
      goals: 13,
      assists: 10,
      yellowCards: 4,
      passAccuracy: '89.1%',
      rating: 8.27,
    },
  },
  'vinicius-junior': {
    id: 111,
    name: 'Vinícius Júnior',
    slug: 'vinicius-junior',
    number: 7,
    position: 'Left Winger',
    nationality: 'Brazil',
    countryFlag: '🇧🇷',
    clubSlug: 'real-madrid',
    clubName: 'Real Madrid CF',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/players/3429.png',
    age: 24,
    height: '176 cm',
    marketValue: '€200.00M',
    bio: 'Vinícius Júnior is a devastating Brazilian winger with unmatched change of pace, samba flair, elite goal scoring, and world-beating decisiveness.',
    seasonStats: {
      appearances: 24,
      goals: 18,
      assists: 11,
      yellowCards: 5,
      passAccuracy: '82.7%',
      rating: 8.39,
    },
  },
  'cole-palmer': {
    id: 112,
    name: 'Cole Palmer',
    slug: 'cole-palmer',
    number: 20,
    position: 'Attacking Midfielder / Winger',
    nationality: 'England',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    clubSlug: 'chelsea',
    clubName: 'Chelsea FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/152982.png',
    age: 22,
    height: '189 cm',
    marketValue: '€130.00M',
    bio: 'Cole Palmer is a mercurial English playmaker renowned for ice-cold composure, precision passing, elite set-piece execution, and prolific scoring record.',
    seasonStats: {
      appearances: 26,
      goals: 17,
      assists: 12,
      yellowCards: 2,
      passAccuracy: '85.4%',
      rating: 8.34,
    },
  },
  'declan-rice': {
    id: 113,
    name: 'Declan Rice',
    slug: 'declan-rice',
    number: 41,
    position: 'Central Midfielder',
    nationality: 'England',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    clubSlug: 'arsenal',
    clubName: 'Arsenal FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/293.png',
    age: 26,
    height: '185 cm',
    marketValue: '€120.00M',
    bio: 'Declan Rice is an elite box-to-box midfielder commanding the pitch with dominant ball recovery, lung-busting driving runs, and tactical resilience.',
    seasonStats: {
      appearances: 27,
      goals: 5,
      assists: 7,
      yellowCards: 3,
      passAccuracy: '91.2%',
      rating: 8.12,
    },
  },
  pedri: {
    id: 114,
    name: 'Pedri',
    slug: 'pedri',
    number: 8,
    position: 'Central Midfielder',
    nationality: 'Spain',
    countryFlag: '🇪🇸',
    clubSlug: 'barcelona',
    clubName: 'FC Barcelona',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/players/138804.png',
    age: 22,
    height: '174 cm',
    marketValue: '€100.00M',
    bio: 'Pedri is a master of midfield tempo and spatial intelligence, seamlessly controlling match rhythm with exquisite first touch and line-breaking passes.',
    seasonStats: {
      appearances: 24,
      goals: 4,
      assists: 9,
      yellowCards: 1,
      passAccuracy: '92.6%',
      rating: 8.19,
    },
  },
  'robert-lewandowski': {
    id: 115,
    name: 'Robert Lewandowski',
    slug: 'robert-lewandowski',
    number: 9,
    position: 'Striker',
    nationality: 'Poland',
    countryFlag: '🇵🇱',
    clubSlug: 'barcelona',
    clubName: 'FC Barcelona',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/players/521.png',
    age: 36,
    height: '185 cm',
    marketValue: '€15.00M',
    bio: 'Robert Lewandowski is one of the greatest number nines of modern football, possessing elite penalty box movement, technical finishing, and tactical hold-up play.',
    seasonStats: {
      appearances: 27,
      goals: 20,
      assists: 4,
      yellowCards: 2,
      passAccuracy: '79.3%',
      rating: 8.08,
    },
  },
  rodri: {
    id: 116,
    name: 'Rodri',
    slug: 'rodri',
    number: 16,
    position: 'Defensive Midfielder',
    nationality: 'Spain',
    countryFlag: '🇪🇸',
    clubSlug: 'manchester-city',
    clubName: 'Manchester City FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/44.png',
    age: 28,
    height: '191 cm',
    marketValue: '€130.00M',
    bio: 'Rodri is the 2024 Ballon d’Or winner and undisputed midfield anchor of modern football, renowned for elite press resistance, positional discipline, and game-winning long-range strikes.',
    seasonStats: {
      appearances: 25,
      goals: 6,
      assists: 8,
      yellowCards: 4,
      passAccuracy: '93.2%',
      rating: 8.48,
    },
  },
  'kevin-de-bruyne': {
    id: 117,
    name: 'Kevin De Bruyne',
    slug: 'kevin-de-bruyne',
    number: 17,
    position: 'Attacking Midfielder',
    nationality: 'Belgium',
    countryFlag: '🇧🇪',
    clubSlug: 'manchester-city',
    clubName: 'Manchester City FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/629.png',
    age: 33,
    height: '181 cm',
    marketValue: '€45.00M',
    bio: 'Kevin De Bruyne is a premier playmaker celebrated for generational passing range, pinpoint crosses, and unmatched game intelligence.',
    seasonStats: {
      appearances: 22,
      goals: 8,
      assists: 16,
      yellowCards: 1,
      passAccuracy: '88.7%',
      rating: 8.36,
    },
  },
  'harry-kane': {
    id: 118,
    name: 'Harry Kane',
    slug: 'harry-kane',
    number: 9,
    position: 'Striker',
    nationality: 'England',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    clubSlug: 'bayern-munich',
    clubName: 'FC Bayern Munich',
    competitionSlug: 'bundesliga',
    photo: 'https://media.api-sports.io/football/players/184.png',
    age: 31,
    height: '188 cm',
    marketValue: '€100.00M',
    bio: 'Harry Kane is England captain and European Golden Shoe winner, combining world-class finishing with elite deep playmaking and passing ability.',
    seasonStats: {
      appearances: 28,
      goals: 28,
      assists: 9,
      yellowCards: 1,
      passAccuracy: '84.3%',
      rating: 8.44,
    },
  },
  'william-saliba': {
    id: 119,
    name: 'William Saliba',
    slug: 'william-saliba',
    number: 2,
    position: 'Centre-Back',
    nationality: 'France',
    countryFlag: '🇫🇷',
    clubSlug: 'arsenal',
    clubName: 'Arsenal FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/931.png',
    age: 23,
    height: '192 cm',
    marketValue: '€80.00M',
    bio: 'William Saliba is widely considered one of the premier central defenders in world football, possessing Rolls-Royce recovery pace, aerial supremacy, and unflappable 1v1 defensive authority.',
    seasonStats: {
      appearances: 27,
      goals: 2,
      assists: 1,
      yellowCards: 2,
      cleanSheets: 14,
      passAccuracy: '92.8%',
      rating: 8.16,
    },
  },
  'federico-valverde': {
    id: 120,
    name: 'Federico Valverde',
    slug: 'federico-valverde',
    number: 8,
    position: 'Central Midfielder',
    nationality: 'Uruguay',
    countryFlag: '🇺🇾',
    clubSlug: 'real-madrid',
    clubName: 'Real Madrid CF',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/players/754.png',
    age: 26,
    height: '182 cm',
    marketValue: '€130.00M',
    bio: 'Federico Valverde is an engine of relentless stamina, blistering transitional pace, ferocious long-range shooting, and tactical versatility.',
    seasonStats: {
      appearances: 27,
      goals: 7,
      assists: 8,
      yellowCards: 3,
      passAccuracy: '89.4%',
      rating: 8.24,
    },
  },
  'thibaut-courtois': {
    id: 121,
    name: 'Thibaut Courtois',
    slug: 'thibaut-courtois',
    number: 1,
    position: 'Goalkeeper',
    nationality: 'Belgium',
    countryFlag: '🇧🇪',
    clubSlug: 'real-madrid',
    clubName: 'Real Madrid CF',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/players/733.png',
    age: 32,
    height: '200 cm',
    marketValue: '€25.00M',
    bio: 'Thibaut Courtois is a towering Belgian goalkeeper with generational shot-stopping reflexes, commanding aerial reach, and clutch Champions League final heroics.',
    seasonStats: {
      appearances: 24,
      goals: 0,
      assists: 0,
      yellowCards: 1,
      cleanSheets: 12,
      passAccuracy: '82.1%',
      rating: 8.14,
    },
  },
  'alisson-becker': {
    id: 122,
    name: 'Alisson Becker',
    slug: 'alisson-becker',
    number: 1,
    position: 'Goalkeeper',
    nationality: 'Brazil',
    countryFlag: '🇧🇷',
    clubSlug: 'liverpool',
    clubName: 'Liverpool FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/280.png',
    age: 32,
    height: '193 cm',
    marketValue: '€28.00M',
    bio: 'Alisson Becker is a Brazilian goalkeeping icon renowned for world-class 1v1 stopping, sweeping prowess, distribution accuracy, and calm authority.',
    seasonStats: {
      appearances: 23,
      goals: 0,
      assists: 1,
      yellowCards: 0,
      cleanSheets: 13,
      passAccuracy: '86.4%',
      rating: 8.18,
    },
  },
  'lautaro-martinez': {
    id: 123,
    name: 'Lautaro Martínez',
    slug: 'lautaro-martinez',
    number: 10,
    position: 'Striker',
    nationality: 'Argentina',
    countryFlag: '🇦🇷',
    clubSlug: 'inter-milan',
    clubName: 'Inter Milan',
    competitionSlug: 'serie-a',
    photo: 'https://media.api-sports.io/football/players/2476.png',
    age: 27,
    height: '174 cm',
    marketValue: '€110.00M',
    bio: 'Lautaro Martínez is Inter Milan captain and Copa América top scorer, celebrated for fierce pressing tenacity, link-up play, and decisive penalty box poaching.',
    seasonStats: {
      appearances: 26,
      goals: 18,
      assists: 5,
      yellowCards: 2,
      passAccuracy: '80.2%',
      rating: 8.21,
    },
  },
  'phil-foden': {
    id: 124,
    name: 'Phil Foden',
    slug: 'phil-foden',
    number: 47,
    position: 'Attacking Midfielder / Winger',
    nationality: 'England',
    countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    clubSlug: 'manchester-city',
    clubName: 'Manchester City FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/631.png',
    age: 24,
    height: '171 cm',
    marketValue: '€150.00M',
    bio: 'Phil Foden is an English superstar with silken close control, half-turn agility, devastating long-range finishing, and Premier League Player of the Season pedigree.',
    seasonStats: {
      appearances: 25,
      goals: 15,
      assists: 11,
      yellowCards: 1,
      passAccuracy: '88.9%',
      rating: 8.32,
    },
  },
  'alexander-isak': {
    id: 125,
    name: 'Alexander Isak',
    slug: 'alexander-isak',
    number: 14,
    position: 'Striker',
    nationality: 'Sweden',
    countryFlag: '🇸🇪',
    clubSlug: 'newcastle',
    clubName: 'Newcastle United',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/players/28432.png',
    age: 25,
    height: '192 cm',
    marketValue: '€75.00M',
    bio: 'Alexander Isak is a graceful Swedish center-forward combining height with elite agility, close dribbling, pace, and ice-cool finishing.',
    seasonStats: {
      appearances: 24,
      goals: 17,
      assists: 3,
      yellowCards: 1,
      passAccuracy: '81.6%',
      rating: 8.17,
    },
  },
  'antoine-griezmann': {
    id: 126,
    name: 'Antoine Griezmann',
    slug: 'antoine-griezmann',
    number: 7,
    position: 'Second Striker / Playmaker',
    nationality: 'France',
    countryFlag: '🇫🇷',
    clubSlug: 'atletico-madrid',
    clubName: 'Atlético de Madrid',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/players/18835.png',
    age: 33,
    height: '176 cm',
    marketValue: '€25.00M',
    bio: 'Antoine Griezmann is a master tactician and World Cup champion who coordinates attack and defense with sublime vision, defensive work rate, and exquisite scoring touch.',
    seasonStats: {
      appearances: 26,
      goals: 13,
      assists: 12,
      yellowCards: 2,
      passAccuracy: '86.7%',
      rating: 8.28,
    },
  },
};

export const INITIAL_TRANSFERS: TransferItem[] = [
  {
    id: 'tr-1',
    playerName: 'Victor Osimhen',
    playerSlug: 'victor-osimhen',
    fromTeam: {
      name: 'Napoli',
      slug: 'napoli',
      logo: 'https://media.api-sports.io/football/teams/492.png',
    },
    toTeam: {
      name: 'Arsenal FC',
      slug: 'arsenal',
      logo: 'https://media.api-sports.io/football/teams/42.png',
    },
    fee: '€75M + Add-ons',
    status: 'negotiation',
    date: '2026-08-26',
    tier: 1,
    competitionSlug: 'premier-league',
    description:
      'Arsenal have opened concrete talks with Napoli representatives to agree terms on a permanent summer transfer.',
  },
  {
    id: 'tr-2',
    playerName: 'Ademola Lookman',
    playerSlug: 'ademola-lookman',
    fromTeam: {
      name: 'Atalanta',
      slug: 'atalanta',
      logo: 'https://media.api-sports.io/football/teams/499.png',
    },
    toTeam: {
      name: 'Paris Saint-Germain',
      slug: 'psg',
      logo: 'https://media.api-sports.io/football/teams/85.png',
    },
    fee: '€60M',
    status: 'agreement',
    date: '2026-08-25',
    tier: 2,
    competitionSlug: 'champions-league',
    description:
      'Personal terms agreed between Lookman and PSG on a 4-year contract; final club discussions in progress.',
  },
  {
    id: 'tr-3',
    playerName: 'Martin Zubimendi',
    playerSlug: 'martin-zubimendi',
    fromTeam: {
      name: 'Real Sociedad',
      slug: 'real-sociedad',
      logo: 'https://media.api-sports.io/football/teams/548.png',
    },
    toTeam: {
      name: 'Arsenal FC',
      slug: 'arsenal',
      logo: 'https://media.api-sports.io/football/teams/42.png',
    },
    fee: '€60M Release Clause',
    status: 'done_deal',
    date: '2026-08-22',
    tier: 1,
    competitionSlug: 'premier-league',
    description:
      'Official announcement completed: Zubimendi signs 5-year contract at Emirates Stadium.',
  },
  {
    id: 'tr-4',
    playerName: 'Florian Wirtz',
    playerSlug: 'florian-wirtz',
    fromTeam: {
      name: 'Bayer Leverkusen',
      slug: 'leverkusen',
      logo: 'https://media.api-sports.io/football/teams/168.png',
    },
    toTeam: {
      name: 'Manchester City',
      slug: 'manchester-city',
      logo: 'https://media.api-sports.io/football/teams/50.png',
    },
    fee: '€120M',
    status: 'rumour',
    date: '2026-08-24',
    tier: 3,
    competitionSlug: 'bundesliga',
    description:
      'Man City monitoring Wirtz situation closely as part of long-term succession planning for De Bruyne.',
  },
];

export const AUTHORS_REGISTRY: Record<
  string,
  {
    name: string;
    slug: string;
    role: 'super-admin' | 'staff' | 'contributor';
    photo: string;
    bio: string;
    specialization: string[];
    socialLinks: { twitter?: string; linkedin?: string };
  }
> = {
  'ekpenisi-raphael': {
    name: 'Ekpenisi Erue Raphael',
    slug: 'ekpenisi-raphael',
    role: 'super-admin',
    photo: 'https://res.cloudinary.com/demo/image/upload/v1689234839/sample.jpg',
    bio: 'Founder & Chief Sports Editor at GoalMills. Veteran analyst covering European tactical innovations, transfer market intelligence, and African football development.',
    specialization: [
      'Transfer Market Intelligence',
      'Tactical Analysis',
      'African Football',
      'Premier League',
    ],
    socialLinks: {
      twitter: 'https://twitter.com/goalmills',
      linkedin: 'https://linkedin.com/in/goalmills',
    },
  },
  'goalmills-editorial': {
    name: 'GoalMills Editorial Desk',
    slug: 'goalmills-editorial',
    role: 'staff',
    photo: 'https://res.cloudinary.com/demo/image/upload/v1689234839/sample.jpg',
    bio: 'The central sports intelligence newsroom of GoalMills, delivering 24/7 breaking updates, match previews, and statistical breakdowns.',
    specialization: [
      'Breaking News',
      'Live Match Reports',
      'Match Previews',
      'Statistical Insights',
    ],
    socialLinks: {
      twitter: 'https://twitter.com/goalmills',
    },
  },
};

export const OFFICIALS_REGISTRY: Record<string, OfficialMeta> = {
  'anthony-taylor': {
    id: 101,
    name: 'Anthony Taylor',
    slug: 'anthony-taylor',
    country: 'England',
    countryCode: 'gb-eng',
    countryFlag: 'https://flagcdn.com/w80/gb-eng.png',
    role: 'FIFA Elite Referee',
    fifaBadgeSince: 2013,
    competitions: ['Premier League', 'UEFA Champions League', 'FIFA World Cup', 'UEFA Euro'],
    photo: 'https://ui-avatars.com/api/?name=Anthony+Taylor&background=0A162B&color=F59E0B&size=256&bold=true',
    age: 46,
    matches: 485,
    foulsPerGame: 21.4,
    yellowCardsTotal: 1872,
    yellowCardsPerGame: 3.86,
    redCardsTotal: 84,
    redCardsPerGame: 0.17,
    penaltiesAwardedTotal: 128,
    penaltiesPerGame: 0.26,
    varAccuracy: '94.2%',
    strictnessRating: 'Strict',
    bio: 'Anthony Taylor is one of England’s most seasoned FIFA Elite match officials, regular head referee for marquee Premier League derbies and UEFA Champions League knockout encounters.',
    recentMatches: [
      {
        date: '2025-02-23',
        competition: 'Premier League',
        fixture: 'Arsenal vs Manchester City',
        yellowCards: 5,
        redCards: 0,
        penalties: 1,
        varDecision: 'Goal confirmed after offside check',
      },
      {
        date: '2025-02-11',
        competition: 'UEFA Champions League',
        fixture: 'Real Madrid vs Paris Saint-Germain',
        yellowCards: 4,
        redCards: 0,
        penalties: 0,
        varDecision: 'Penalty review cleared',
      },
      {
        date: '2025-01-26',
        competition: 'Premier League',
        fixture: 'Liverpool vs Chelsea',
        yellowCards: 6,
        redCards: 1,
        penalties: 1,
        varDecision: 'Red card upheld for violent conduct',
      },
    ],
  },
  'michael-oliver': {
    id: 102,
    name: 'Michael Oliver',
    slug: 'michael-oliver',
    country: 'England',
    countryCode: 'gb-eng',
    countryFlag: 'https://flagcdn.com/w80/gb-eng.png',
    role: 'FIFA Elite Referee',
    fifaBadgeSince: 2012,
    competitions: ['Premier League', 'UEFA Champions League', 'FIFA Club World Cup', 'UEFA Euro'],
    photo: 'https://ui-avatars.com/api/?name=Michael+Oliver&background=0A162B&color=38BDF8&size=256&bold=true',
    age: 40,
    matches: 462,
    foulsPerGame: 19.8,
    yellowCardsTotal: 1684,
    yellowCardsPerGame: 3.65,
    redCardsTotal: 72,
    redCardsPerGame: 0.16,
    penaltiesAwardedTotal: 142,
    penaltiesPerGame: 0.31,
    varAccuracy: '96.1%',
    strictnessRating: 'Balanced',
    bio: 'Michael Oliver made history as the youngest referee in Premier League history and remains one of the world’s most trusted officials for high-tempo, high-stakes international football.',
    recentMatches: [
      {
        date: '2025-02-18',
        competition: 'UEFA Champions League',
        fixture: 'Bayern Munich vs Inter Milan',
        yellowCards: 3,
        redCards: 0,
        penalties: 0,
        varDecision: 'Handball shout reviewed - no penalty',
      },
      {
        date: '2025-02-08',
        competition: 'Premier League',
        fixture: 'Tottenham Hotspur vs Manchester United',
        yellowCards: 4,
        redCards: 0,
        penalties: 1,
        varDecision: 'Foul in box confirmed',
      },
    ],
  },
  'szymon-marciniak': {
    id: 103,
    name: 'Szymon Marciniak',
    slug: 'szymon-marciniak',
    country: 'Poland',
    countryCode: 'pl',
    countryFlag: 'https://flagcdn.com/w80/pl.png',
    role: 'FIFA Elite Referee (World Cup Final Referee)',
    fifaBadgeSince: 2011,
    competitions: ['UEFA Champions League', 'FIFA World Cup', 'Ekstraklasa', 'UEFA Euro'],
    photo: 'https://ui-avatars.com/api/?name=Szymon+Marciniak&background=0A162B&color=EF4444&size=256&bold=true',
    age: 44,
    matches: 520,
    foulsPerGame: 23.1,
    yellowCardsTotal: 2210,
    yellowCardsPerGame: 4.25,
    redCardsTotal: 96,
    redCardsPerGame: 0.18,
    penaltiesAwardedTotal: 164,
    penaltiesPerGame: 0.32,
    varAccuracy: '97.8%',
    strictnessRating: 'High-Card Index',
    bio: 'Szymon Marciniak is the renowned referee of the 2022 FIFA World Cup Final and the 2023 UEFA Champions League Final, celebrated globally for fearless decision-making and authoritative match control.',
    recentMatches: [
      {
        date: '2025-02-25',
        competition: 'UEFA Champions League',
        fixture: 'Barcelona vs Borussia Dortmund',
        yellowCards: 6,
        redCards: 0,
        penalties: 2,
        varDecision: 'VAR confirmed simulation yellow card',
      },
      {
        date: '2025-01-29',
        competition: 'UEFA Champions League',
        fixture: 'Manchester City vs Juventus',
        yellowCards: 4,
        redCards: 0,
        penalties: 0,
      },
    ],
  },
  'clement-turpin': {
    id: 104,
    name: 'Clément Turpin',
    slug: 'clement-turpin',
    country: 'France',
    countryCode: 'fr',
    countryFlag: 'https://flagcdn.com/w80/fr.png',
    role: 'FIFA Elite Referee',
    fifaBadgeSince: 2010,
    competitions: ['Ligue 1', 'UEFA Champions League', 'FIFA World Cup', 'UEFA Europa League'],
    photo: 'https://ui-avatars.com/api/?name=Clement+Turpin&background=0A162B&color=3B82F6&size=256&bold=true',
    age: 43,
    matches: 440,
    foulsPerGame: 22.8,
    yellowCardsTotal: 1620,
    yellowCardsPerGame: 3.68,
    redCardsTotal: 78,
    redCardsPerGame: 0.18,
    penaltiesAwardedTotal: 135,
    penaltiesPerGame: 0.31,
    varAccuracy: '95.5%',
    strictnessRating: 'Balanced',
    bio: 'Clément Turpin took charge of the 2022 UEFA Champions League Final in Paris and is regarded as France’s premier match official, known for his fluid advantage management.',
    recentMatches: [
      {
        date: '2025-02-19',
        competition: 'UEFA Champions League',
        fixture: 'Arsenal vs Monaco',
        yellowCards: 3,
        redCards: 0,
        penalties: 1,
      },
    ],
  },
  'daniele-orsato': {
    id: 105,
    name: 'Daniele Orsato',
    slug: 'daniele-orsato',
    country: 'Italy',
    countryCode: 'it',
    countryFlag: 'https://flagcdn.com/w80/it.png',
    role: 'Senior FIFA Legend Official',
    fifaBadgeSince: 2010,
    competitions: ['Serie A', 'UEFA Champions League', 'FIFA World Cup', 'UEFA Euro'],
    photo: 'https://ui-avatars.com/api/?name=Daniele+Orsato&background=0A162B&color=10B981&size=256&bold=true',
    age: 49,
    matches: 550,
    foulsPerGame: 24.2,
    yellowCardsTotal: 2540,
    yellowCardsPerGame: 4.62,
    redCardsTotal: 110,
    redCardsPerGame: 0.20,
    penaltiesAwardedTotal: 158,
    penaltiesPerGame: 0.29,
    varAccuracy: '96.8%',
    strictnessRating: 'High-Card Index',
    bio: 'Daniele Orsato is one of the most decorated Italian referees in modern history, awarded IFFHS World’s Best Referee following his commanding whistle in the 2020 UCL Final.',
    recentMatches: [
      {
        date: '2025-02-14',
        competition: 'Serie A',
        fixture: 'Juventus vs Napoli',
        yellowCards: 5,
        redCards: 1,
        penalties: 1,
      },
    ],
  },
  'slavko-vincic': {
    id: 106,
    name: 'Slavko Vinčić',
    slug: 'slavko-vincic',
    country: 'Slovenia',
    countryCode: 'si',
    countryFlag: 'https://flagcdn.com/w80/si.png',
    role: 'FIFA Elite Referee (UCL 2024 Final Ref)',
    fifaBadgeSince: 2010,
    competitions: ['UEFA Champions League', 'UEFA Euro', 'PrvaLiga', 'UEFA Europa League'],
    photo: 'https://ui-avatars.com/api/?name=Slavko+Vincic&background=0A162B&color=6366F1&size=256&bold=true',
    age: 45,
    matches: 395,
    foulsPerGame: 20.6,
    yellowCardsTotal: 1540,
    yellowCardsPerGame: 3.90,
    redCardsTotal: 62,
    redCardsPerGame: 0.16,
    penaltiesAwardedTotal: 112,
    penaltiesPerGame: 0.28,
    varAccuracy: '95.0%',
    strictnessRating: 'Balanced',
    bio: 'Slavko Vinčić reached the pinnacle of European officiating by refereeing the 2024 UEFA Champions League Final at Wembley, earning praise for his calm, composed discipline.',
    recentMatches: [
      {
        date: '2025-02-20',
        competition: 'UEFA Champions League',
        fixture: 'Liverpool vs Bayer Leverkusen',
        yellowCards: 4,
        redCards: 0,
        penalties: 0,
      },
    ],
  },
  'danny-makkelie': {
    id: 107,
    name: 'Danny Makkelie',
    slug: 'danny-makkelie',
    country: 'Netherlands',
    countryCode: 'nl',
    countryFlag: 'https://flagcdn.com/w80/nl.png',
    role: 'FIFA Elite Referee',
    fifaBadgeSince: 2011,
    competitions: ['Eredivisie', 'UEFA Champions League', 'FIFA World Cup', 'UEFA Euro'],
    photo: 'https://ui-avatars.com/api/?name=Danny+Makkelie&background=0A162B&color=F97316&size=256&bold=true',
    age: 42,
    matches: 430,
    foulsPerGame: 19.2,
    yellowCardsTotal: 1480,
    yellowCardsPerGame: 3.44,
    redCardsTotal: 58,
    redCardsPerGame: 0.13,
    penaltiesAwardedTotal: 120,
    penaltiesPerGame: 0.28,
    varAccuracy: '97.1%',
    strictnessRating: 'Permissive',
    bio: 'A former Dutch police inspector, Danny Makkelie combines sharp communication skills with tactical understanding, frequently appointed to crucial international knockout fixtures.',
    recentMatches: [
      {
        date: '2025-02-12',
        competition: 'UEFA Champions League',
        fixture: 'Sporting CP vs Arsenal',
        yellowCards: 3,
        redCards: 0,
        penalties: 1,
      },
    ],
  },
  'jesus-gil-manzano': {
    id: 108,
    name: 'Jesús Gil Manzano',
    slug: 'jesus-gil-manzano',
    country: 'Spain',
    countryCode: 'es',
    countryFlag: 'https://flagcdn.com/w80/es.png',
    role: 'FIFA Elite Referee',
    fifaBadgeSince: 2014,
    competitions: ['La Liga', 'UEFA Champions League', 'Copa del Rey', 'UEFA Nations League'],
    photo: 'https://ui-avatars.com/api/?name=Jesus+Gil+Manzano&background=0A162B&color=EAB308&size=256&bold=true',
    age: 41,
    matches: 380,
    foulsPerGame: 25.5,
    yellowCardsTotal: 1920,
    yellowCardsPerGame: 5.05,
    redCardsTotal: 88,
    redCardsPerGame: 0.23,
    penaltiesAwardedTotal: 140,
    penaltiesPerGame: 0.37,
    varAccuracy: '93.8%',
    strictnessRating: 'Strict',
    bio: 'Jesús Gil Manzano is Spain’s premier match official, known for unwavering enforcement of laws, high card volume in El Clásico matches, and decisive penalty decisions.',
    recentMatches: [
      {
        date: '2025-02-15',
        competition: 'La Liga',
        fixture: 'Atlético Madrid vs Real Madrid',
        yellowCards: 7,
        redCards: 1,
        penalties: 1,
      },
    ],
  },
  'felix-zwayer': {
    id: 109,
    name: 'Felix Zwayer',
    slug: 'felix-zwayer',
    country: 'Germany',
    countryCode: 'de',
    countryFlag: 'https://flagcdn.com/w80/de.png',
    role: 'FIFA Elite Referee',
    fifaBadgeSince: 2012,
    competitions: ['Bundesliga', 'UEFA Champions League', 'UEFA Euro', 'DFB-Pokal'],
    photo: 'https://ui-avatars.com/api/?name=Felix+Zwayer&background=0A162B&color=14B8A6&size=256&bold=true',
    age: 44,
    matches: 410,
    foulsPerGame: 21.0,
    yellowCardsTotal: 1650,
    yellowCardsPerGame: 4.02,
    redCardsTotal: 65,
    redCardsPerGame: 0.16,
    penaltiesAwardedTotal: 115,
    penaltiesPerGame: 0.28,
    varAccuracy: '95.2%',
    strictnessRating: 'Balanced',
    bio: 'Felix Zwayer is a long-standing German FIFA official who took charge of the UEFA Nations League Final in 2023 and the UEFA Euro 2024 Semi-Final.',
    recentMatches: [
      {
        date: '2025-02-22',
        competition: 'Bundesliga',
        fixture: 'Bayern Munich vs RB Leipzig',
        yellowCards: 4,
        redCards: 0,
        penalties: 0,
      },
    ],
  },
  'stephanie-frappart': {
    id: 110,
    name: 'Stéphanie Frappart',
    slug: 'stephanie-frappart',
    country: 'France',
    countryCode: 'fr',
    countryFlag: 'https://flagcdn.com/w80/fr.png',
    role: 'FIFA Elite Historic Referee',
    fifaBadgeSince: 2009,
    competitions: ['Ligue 1', 'UEFA Champions League', 'FIFA World Cup', 'Coupe de France'],
    photo: 'https://ui-avatars.com/api/?name=Stephanie+Frappart&background=0A162B&color=EC4899&size=256&bold=true',
    age: 41,
    matches: 310,
    foulsPerGame: 20.2,
    yellowCardsTotal: 1120,
    yellowCardsPerGame: 3.61,
    redCardsTotal: 45,
    redCardsPerGame: 0.15,
    penaltiesAwardedTotal: 86,
    penaltiesPerGame: 0.28,
    varAccuracy: '97.5%',
    strictnessRating: 'Balanced',
    bio: 'A true trailblazer, Stéphanie Frappart made history as the first woman to referee a men’s UEFA Super Cup, a men’s UEFA Champions League match, and a men’s FIFA World Cup match.',
    recentMatches: [
      {
        date: '2025-02-16',
        competition: 'Ligue 1',
        fixture: 'Marseille vs Lyon',
        yellowCards: 4,
        redCards: 0,
        penalties: 1,
      },
    ],
  },
  'wilton-sampaio': {
    id: 111,
    name: 'Wilton Sampaio',
    slug: 'wilton-sampaio',
    country: 'Brazil',
    countryCode: 'br',
    countryFlag: 'https://flagcdn.com/w80/br.png',
    role: 'FIFA Elite Referee (CONMEBOL)',
    fifaBadgeSince: 2013,
    competitions: ['Copa Libertadores', 'Brasileirão', 'FIFA World Cup', 'Copa América'],
    photo: 'https://ui-avatars.com/api/?name=Wilton+Sampaio&background=0A162B&color=22C55E&size=256&bold=true',
    age: 43,
    matches: 375,
    foulsPerGame: 27.2,
    yellowCardsTotal: 1890,
    yellowCardsPerGame: 5.04,
    redCardsTotal: 92,
    redCardsPerGame: 0.25,
    penaltiesAwardedTotal: 130,
    penaltiesPerGame: 0.35,
    varAccuracy: '92.9%',
    strictnessRating: 'Strict',
    bio: 'Wilton Sampaio is Brazil’s leading match official, renowned for maintaining control in high-intensity South American derbies and the 2022 World Cup Quarter-Final.',
    recentMatches: [
      {
        date: '2025-02-05',
        competition: 'Copa Libertadores',
        fixture: 'Flamengo vs River Plate',
        yellowCards: 6,
        redCards: 1,
        penalties: 1,
      },
    ],
  },
  'facundo-tello': {
    id: 112,
    name: 'Facundo Tello',
    slug: 'facundo-tello',
    country: 'Argentina',
    countryCode: 'ar',
    countryFlag: 'https://flagcdn.com/w80/ar.png',
    role: 'FIFA Elite Referee (CONMEBOL / UEFA Exchange)',
    fifaBadgeSince: 2019,
    competitions: ['Argentine Primera División', 'Copa Libertadores', 'UEFA Euro', 'FIFA World Cup'],
    photo: 'https://ui-avatars.com/api/?name=Facundo+Tello&background=0A162B&color=06B6D4&size=256&bold=true',
    age: 43,
    matches: 295,
    foulsPerGame: 26.8,
    yellowCardsTotal: 1530,
    yellowCardsPerGame: 5.18,
    redCardsTotal: 82,
    redCardsPerGame: 0.28,
    penaltiesAwardedTotal: 98,
    penaltiesPerGame: 0.33,
    varAccuracy: '93.5%',
    strictnessRating: 'High-Card Index',
    bio: 'Facundo Tello is Argentina’s premier referee, famed for commanding the Trofeo de Campeones and selected for the historic CONMEBOL-UEFA referee exchange at Euro 2024.',
    recentMatches: [
      {
        date: '2025-02-09',
        competition: 'Argentine Primera División',
        fixture: 'Boca Juniors vs Racing Club',
        yellowCards: 8,
        redCards: 2,
        penalties: 1,
      },
    ],
  },
  'chris-kavanagh': {
    id: 113,
    name: 'Chris Kavanagh',
    slug: 'chris-kavanagh',
    country: 'England',
    countryCode: 'gb-eng',
    countryFlag: 'https://flagcdn.com/w80/gb-eng.png',
    role: 'FIFA International Referee',
    fifaBadgeSince: 2019,
    competitions: ['Premier League', 'UEFA Europa League', 'FA Cup', 'EFL Cup'],
    photo: 'https://ui-avatars.com/api/?name=Chris+Kavanagh&background=0A162B&color=8B5CF6&size=256&bold=true',
    age: 39,
    matches: 280,
    foulsPerGame: 20.8,
    yellowCardsTotal: 1060,
    yellowCardsPerGame: 3.78,
    redCardsTotal: 42,
    redCardsPerGame: 0.15,
    penaltiesAwardedTotal: 78,
    penaltiesPerGame: 0.28,
    varAccuracy: '94.8%',
    strictnessRating: 'Balanced',
    bio: 'Manchester-born Chris Kavanagh has developed into one of PGMOL’s most relied-upon officials for high-intensity Premier League and European ties.',
    recentMatches: [
      {
        date: '2025-02-22',
        competition: 'Premier League',
        fixture: 'Aston Villa vs Newcastle United',
        yellowCards: 4,
        redCards: 0,
        penalties: 0,
      },
    ],
  },
  'paul-tierney': {
    id: 114,
    name: 'Paul Tierney',
    slug: 'paul-tierney',
    country: 'England',
    countryCode: 'gb-eng',
    countryFlag: 'https://flagcdn.com/w80/gb-eng.png',
    role: 'FIFA International & VAR Specialist',
    fifaBadgeSince: 2018,
    competitions: ['Premier League', 'FA Cup Final', 'UEFA Europa Conference League'],
    photo: 'https://ui-avatars.com/api/?name=Paul+Tierney&background=0A162B&color=64748B&size=256&bold=true',
    age: 44,
    matches: 340,
    foulsPerGame: 22.0,
    yellowCardsTotal: 1240,
    yellowCardsPerGame: 3.64,
    redCardsTotal: 52,
    redCardsPerGame: 0.15,
    penaltiesAwardedTotal: 92,
    penaltiesPerGame: 0.27,
    varAccuracy: '95.6%',
    strictnessRating: 'Balanced',
    bio: 'Paul Tierney brings vast domestic experience, having refereed the 2023 FA Cup Final at Wembley alongside regular Premier League and UEFA assignments.',
    recentMatches: [
      {
        date: '2025-02-15',
        competition: 'Premier League',
        fixture: 'West Ham vs Everton',
        yellowCards: 3,
        redCards: 0,
        penalties: 0,
      },
    ],
  },
};

export const COACHES_REGISTRY: Record<string, CoachMeta> = {
  'pep-guardiola': {
    id: 19,
    name: 'Pep Guardiola',
    slug: 'pep-guardiola',
    nationality: 'Spain',
    countryCode: 'es',
    countryFlag: 'https://flagcdn.com/w80/es.png',
    currentClubSlug: 'manchester-city',
    currentClubName: 'Manchester City',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/coachs/19.png',
    age: 54,
    preferredFormation: '3-2-4-1 (Inverted System)',
    coachingStyle: 'Positional Play, Total Control & Gegenpressing Counter-defense',
    matchesManaged: 920,
    winPercentage: 72.8,
    drawPercentage: 15.2,
    lossPercentage: 12.0,
    trophiesCount: 38,
    majorHonours: [
      '3x UEFA Champions League',
      '6x Premier League',
      '3x La Liga',
      '3x Bundesliga',
      '4x FIFA Club World Cup',
      '2x FA Cup',
    ],
    bio: 'Regarded as one of football history’s most influential tacticians, Pep Guardiola revolutionized modern football through positional play, high-intensity pressing, and tactical fluidity across Barcelona, Bayern Munich, and Manchester City.',
    careerClubs: [
      { club: 'Manchester City', years: '2016 - Present', matches: 480, winRate: '73.1%' },
      { club: 'Bayern Munich', years: '2013 - 2016', matches: 161, winRate: '75.2%' },
      { club: 'FC Barcelona', years: '2008 - 2012', matches: 247, winRate: '72.5%' },
    ],
  },
  'mikel-arteta': {
    id: 18,
    name: 'Mikel Arteta',
    slug: 'mikel-arteta',
    nationality: 'Spain',
    countryCode: 'es',
    countryFlag: 'https://flagcdn.com/w80/es.png',
    currentClubSlug: 'arsenal',
    currentClubName: 'Arsenal FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/coachs/18.png',
    age: 43,
    preferredFormation: '4-3-3 (High Press & Rest Defense)',
    coachingStyle: 'Structured Positional Play, Aggressive Rest-Defense & Set-Piece Dominance',
    matchesManaged: 275,
    winPercentage: 62.5,
    drawPercentage: 18.2,
    lossPercentage: 19.3,
    trophiesCount: 3,
    majorHonours: ['1x FA Cup (2020)', '2x FA Community Shield (2020, 2023)'],
    bio: 'Mikel Arteta has transformed Arsenal into European title contenders through rigorous tactical discipline, elite set-piece engineering under Nicolas Jover, and dynamic youthful pressing.',
    careerClubs: [
      { club: 'Arsenal FC', years: '2019 - Present', matches: 275, winRate: '62.5%' },
    ],
  },
  'carlo-ancelotti': {
    id: 4,
    name: 'Carlo Ancelotti',
    slug: 'carlo-ancelotti',
    nationality: 'Italy',
    countryCode: 'it',
    countryFlag: 'https://flagcdn.com/w80/it.png',
    currentClubSlug: 'real-madrid',
    currentClubName: 'Real Madrid',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/coachs/4.png',
    age: 65,
    preferredFormation: '4-3-1-2 / 4-3-3 Hybrid',
    coachingStyle: 'Man-Management Mastery, Tactical Adaptability & Lethal Transition play',
    matchesManaged: 1350,
    winPercentage: 60.8,
    drawPercentage: 21.4,
    lossPercentage: 17.8,
    trophiesCount: 29,
    majorHonours: [
      '5x UEFA Champions League (Record)',
      '1x Premier League',
      '2x La Liga',
      '1x Serie A',
      '1x Bundesliga',
      '1x Ligue 1',
    ],
    bio: 'The only manager in history to win league titles in all of Europe’s top five leagues and the UEFA Champions League five times, Don Carlo is the undisputed king of European cup royalty.',
    careerClubs: [
      { club: 'Real Madrid', years: '2021 - Present', matches: 190, winRate: '70.5%' },
      { club: 'Everton', years: '2019 - 2021', matches: 67, winRate: '46.3%' },
      { club: 'Napoli', years: '2018 - 2019', matches: 73, winRate: '52.1%' },
      { club: 'Bayern Munich', years: '2016 - 2017', matches: 60, winRate: '70.0%' },
      { club: 'Real Madrid', years: '2013 - 2015', matches: 119, winRate: '74.8%' },
      { club: 'AC Milan', years: '2001 - 2009', matches: 420, winRate: '56.7%' },
    ],
  },
  'arne-slot': {
    id: 24,
    name: 'Arne Slot',
    slug: 'arne-slot',
    nationality: 'Netherlands',
    countryCode: 'nl',
    countryFlag: 'https://flagcdn.com/w80/nl.png',
    currentClubSlug: 'liverpool',
    currentClubName: 'Liverpool FC',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/coachs/24.png',
    age: 46,
    preferredFormation: '4-2-3-1 / 4-3-3 Transition',
    coachingStyle: 'Controlled High-Pressing, Compact Defensive Blocks & Fast Box Entries',
    matchesManaged: 290,
    winPercentage: 68.2,
    drawPercentage: 17.1,
    lossPercentage: 14.7,
    trophiesCount: 2,
    majorHonours: ['1x Eredivisie Title (Feyenoord 2023)', '1x KNVB Cup (2024)'],
    bio: 'Taking over the helm at Anfield following Jürgen Klopp, Arne Slot established instant dominance in the Premier League with disciplined defensive structures and ruthless counter-pressing.',
    careerClubs: [
      { club: 'Liverpool FC', years: '2024 - Present', matches: 38, winRate: '78.9%' },
      { club: 'Feyenoord', years: '2021 - 2024', matches: 150, winRate: '65.3%' },
      { club: 'AZ Alkmaar', years: '2019 - 2020', matches: 58, winRate: '60.3%' },
    ],
  },
  'hansi-flick': {
    id: 10,
    name: 'Hansi Flick',
    slug: 'hansi-flick',
    nationality: 'Germany',
    countryCode: 'de',
    countryFlag: 'https://flagcdn.com/w80/de.png',
    currentClubSlug: 'barcelona',
    currentClubName: 'FC Barcelona',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/coachs/10.png',
    age: 60,
    preferredFormation: '4-2-3-1 (Ultra-High Offside Trap)',
    coachingStyle: 'Vertical Football, Relentless Pressing & Fearless High Defensive Line',
    matchesManaged: 280,
    winPercentage: 74.3,
    drawPercentage: 13.2,
    lossPercentage: 12.5,
    trophiesCount: 8,
    majorHonours: [
      '1x UEFA Champions League (Sextuple 2020)',
      '2x Bundesliga',
      '1x FIFA Club World Cup',
      '1x UEFA Super Cup',
    ],
    bio: 'Architect of Bayern Munich’s historic 2020 sextuple, Hansi Flick rejuvenated FC Barcelona with vertical offensive power and one of the most daring offside trap structures in European history.',
    careerClubs: [
      { club: 'FC Barcelona', years: '2024 - Present', matches: 36, winRate: '77.8%' },
      { club: 'Germany National Team', years: '2021 - 2023', matches: 25, winRate: '48.0%' },
      { club: 'Bayern Munich', years: '2019 - 2021', matches: 86, winRate: '81.4%' },
    ],
  },
  'luis-enrique': {
    id: 13,
    name: 'Luis Enrique',
    slug: 'luis-enrique',
    nationality: 'Spain',
    countryCode: 'es',
    countryFlag: 'https://flagcdn.com/w80/es.png',
    currentClubSlug: 'paris-saint-germain',
    currentClubName: 'Paris Saint-Germain',
    competitionSlug: 'ligue-1',
    photo: 'https://media.api-sports.io/football/coachs/13.png',
    age: 55,
    preferredFormation: '4-3-3 Possessive Dynamic',
    coachingStyle: 'High-Volume Circulation, Inverted Overloads & Relentless Energy',
    matchesManaged: 520,
    winPercentage: 66.5,
    drawPercentage: 18.1,
    lossPercentage: 15.4,
    trophiesCount: 12,
    majorHonours: [
      '1x UEFA Champions League (Treble 2015)',
      '2x La Liga',
      '1x Ligue 1',
      '3x Copa del Rey',
      '1x FIFA Club World Cup',
    ],
    bio: 'Treble winner with FC Barcelona and former Spain boss, Luis Enrique leads Paris Saint-Germain into a tactical modern era prioritizing high work-rate and team cohesion over individual stardom.',
    careerClubs: [
      { club: 'Paris Saint-Germain', years: '2023 - Present', matches: 85, winRate: '68.2%' },
      { club: 'Spain National Team', years: '2019 - 2022', matches: 39, winRate: '56.4%' },
      { club: 'FC Barcelona', years: '2014 - 2017', matches: 181, winRate: '76.2%' },
    ],
  },
  'simone-inzaghi': {
    id: 21,
    name: 'Simone Inzaghi',
    slug: 'simone-inzaghi',
    nationality: 'Italy',
    countryCode: 'it',
    countryFlag: 'https://flagcdn.com/w80/it.png',
    currentClubSlug: 'inter-milan',
    currentClubName: 'Inter Milan',
    competitionSlug: 'serie-a',
    photo: 'https://media.api-sports.io/football/coachs/21.png',
    age: 49,
    preferredFormation: '3-5-2 (Interlocking Center-Backs)',
    coachingStyle: 'Fluid 3-5-2, Overlapping Center-Backs, Cup Mastery & Direct Counters',
    matchesManaged: 460,
    winPercentage: 61.3,
    drawPercentage: 18.5,
    lossPercentage: 20.2,
    trophiesCount: 8,
    majorHonours: [
      '1x Serie A Scudetto (2024)',
      '3x Coppa Italia',
      '5x Supercoppa Italiana (Record)',
      'UCL Finalist (2023)',
    ],
    bio: 'Simone Inzaghi mastered the modern 3-5-2 system with Inter Milan, guiding them to the 2024 Serie A title with record-breaking goal difference and fluid defensive coordination.',
    careerClubs: [
      { club: 'Inter Milan', years: '2021 - Present', matches: 195, winRate: '65.6%' },
      { club: 'Lazio', years: '2016 - 2021', matches: 251, winRate: '53.4%' },
    ],
  },
  'diego-simeone': {
    id: 1,
    name: 'Diego Simeone',
    slug: 'diego-simeone',
    nationality: 'Argentina',
    countryCode: 'ar',
    countryFlag: 'https://flagcdn.com/w80/ar.png',
    currentClubSlug: 'atletico-madrid',
    currentClubName: 'Atlético Madrid',
    competitionSlug: 'la-liga',
    photo: 'https://media.api-sports.io/football/coachs/1.png',
    age: 55,
    preferredFormation: '5-3-2 / 4-4-2 Compact',
    coachingStyle: 'Cholismo: Emotional Intensity, Ironclad Low-Block & Counter-Punching',
    matchesManaged: 720,
    winPercentage: 59.4,
    drawPercentage: 22.8,
    lossPercentage: 17.8,
    trophiesCount: 8,
    majorHonours: [
      '2x La Liga (2014, 2021)',
      '2x UEFA Europa League',
      '2x UEFA Super Cup',
      '1x Copa del Rey',
      '2x UCL Finalist',
    ],
    bio: 'The longest-serving manager in Europe’s top five leagues, "El Cholo" defined an era of relentless competitive grit, transforming Atlético Madrid into a global powerhouse.',
    careerClubs: [
      { club: 'Atlético Madrid', years: '2011 - Present', matches: 700, winRate: '59.7%' },
    ],
  },
  'xabi-alonso': {
    id: 29,
    name: 'Xabi Alonso',
    slug: 'xabi-alonso',
    nationality: 'Spain',
    countryCode: 'es',
    countryFlag: 'https://flagcdn.com/w80/es.png',
    currentClubSlug: 'bayer-leverkusen',
    currentClubName: 'Bayer Leverkusen',
    competitionSlug: 'bundesliga',
    photo: 'https://media.api-sports.io/football/coachs/29.png',
    age: 43,
    preferredFormation: '3-4-2-1 Asymmetrical',
    coachingStyle: 'Precision Passing, Wingback Playmaking & Late-Game Tactical Resilience',
    matchesManaged: 160,
    winPercentage: 67.5,
    drawPercentage: 21.3,
    lossPercentage: 11.2,
    trophiesCount: 3,
    majorHonours: [
      '1x Bundesliga Undefeated Champion (2024)',
      '1x DFB-Pokal (2024)',
      '1x DFL-Supercup (2024)',
    ],
    bio: 'Xabi Alonso orchestrated Germany’s first-ever unbeaten domestic double with Bayer Leverkusen in 2023/24, ending Bayern Munich’s 11-year stranglehold with breathtaking tactical balance.',
    careerClubs: [
      { club: 'Bayer Leverkusen', years: '2022 - Present', matches: 125, winRate: '68.0%' },
      { club: 'Real Sociedad B', years: '2019 - 2022', matches: 98, winRate: '40.8%' },
    ],
  },
  'unai-emery': {
    id: 15,
    name: 'Unai Emery',
    slug: 'unai-emery',
    nationality: 'Spain',
    countryCode: 'es',
    countryFlag: 'https://flagcdn.com/w80/es.png',
    currentClubSlug: 'aston-villa',
    currentClubName: 'Aston Villa',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/coachs/15.png',
    age: 53,
    preferredFormation: '4-4-2 / 4-2-2-2 Hybrid',
    coachingStyle: 'Bait-and-Bypass Press, Elite Video Analysis & Meticulous Tactical Traps',
    matchesManaged: 1010,
    winPercentage: 54.8,
    drawPercentage: 22.1,
    lossPercentage: 23.1,
    trophiesCount: 11,
    majorHonours: [
      '4x UEFA Europa League (Record - 3x Sevilla, 1x Villarreal)',
      '1x Ligue 1 Title',
      '2x Coupe de France',
    ],
    bio: 'The undisputed master of European knockout competition, Unai Emery brought Aston Villa back to the UEFA Champions League for the first time in over four decades.',
    careerClubs: [
      { club: 'Aston Villa', years: '2022 - Present', matches: 115, winRate: '56.5%' },
      { club: 'Villarreal', years: '2020 - 2022', matches: 129, winRate: '51.2%' },
      { club: 'Arsenal', years: '2018 - 2019', matches: 78, winRate: '55.1%' },
      { club: 'Paris Saint-Germain', years: '2016 - 2018', matches: 114, winRate: '76.3%' },
      { club: 'Sevilla FC', years: '2013 - 2016', matches: 205, winRate: '51.7%' },
    ],
  },
  'ruben-amorim': {
    id: 26,
    name: 'Ruben Amorim',
    slug: 'ruben-amorim',
    nationality: 'Portugal',
    countryCode: 'pt',
    countryFlag: 'https://flagcdn.com/w80/pt.png',
    currentClubSlug: 'manchester-united',
    currentClubName: 'Manchester United',
    competitionSlug: 'premier-league',
    photo: 'https://media.api-sports.io/football/coachs/26.png',
    age: 40,
    preferredFormation: '3-4-2-1 High-Transition',
    coachingStyle: 'Direct Wing-Back Channels, Dual Tens & Aggressive Central Pressing',
    matchesManaged: 280,
    winPercentage: 69.6,
    drawPercentage: 14.3,
    lossPercentage: 16.1,
    trophiesCount: 5,
    majorHonours: [
      '2x Primeira Liga Titles (Sporting CP 2021, 2024)',
      '3x Taça da Liga',
      '1x Supertaça Cândido de Oliveira',
    ],
    bio: 'One of European football’s most coveted young managerial minds, Ruben Amorim broke Sporting CP’s 19-year title drought before taking the reins at Manchester United.',
    careerClubs: [
      { club: 'Manchester United', years: '2024 - Present', matches: 25, winRate: '60.0%' },
      { club: 'Sporting CP', years: '2020 - 2024', matches: 231, winRate: '71.4%' },
      { club: 'Braga', years: '2019 - 2020', matches: 13, winRate: '76.9%' },
    ],
  },
  'antonio-conte': {
    id: 2,
    name: 'Antonio Conte',
    slug: 'antonio-conte',
    nationality: 'Italy',
    countryCode: 'it',
    countryFlag: 'https://flagcdn.com/w80/it.png',
    currentClubSlug: 'napoli',
    currentClubName: 'SSC Napoli',
    competitionSlug: 'serie-a',
    photo: 'https://media.api-sports.io/football/coachs/2.png',
    age: 55,
    preferredFormation: '3-4-2-1 / 3-5-2',
    coachingStyle: 'Automated Pass Patterns, Intense Physical Conditioning & Relentless Will',
    matchesManaged: 620,
    winPercentage: 62.1,
    drawPercentage: 20.3,
    lossPercentage: 17.6,
    trophiesCount: 9,
    majorHonours: [
      '4x Serie A (3x Juventus, 1x Inter Milan)',
      '1x Premier League (Chelsea 2017)',
      '1x FA Cup (Chelsea 2018)',
    ],
    bio: 'Antonio Conte is an elite serial domestic champion who instantly builds championship resilience, currently steering SSC Napoli back to the summit of Italian football.',
    careerClubs: [
      { club: 'SSC Napoli', years: '2024 - Present', matches: 28, winRate: '67.9%' },
      { club: 'Tottenham Hotspur', years: '2021 - 2023', matches: 76, winRate: '53.9%' },
      { club: 'Inter Milan', years: '2019 - 2021', matches: 102, winRate: '62.7%' },
      { club: 'Chelsea FC', years: '2016 - 2018', matches: 106, winRate: '65.1%' },
      { club: 'Juventus', years: '2011 - 2014', matches: 151, winRate: '67.5%' },
    ],
  },
};

/**
 * Service to resolve entities, construct breadcrumb paths, and query cross-distributed content
 */
export class EntityService {
  static getCompetition(slug: string): CompetitionMeta | undefined {
    return COMPETITIONS_REGISTRY[slug.toLowerCase()];
  }

  static getClub(slug: string): ClubMeta | undefined {
    return CLUBS_REGISTRY[slug.toLowerCase()];
  }

  static getPlayer(slug: string): PlayerMeta | undefined {
    if (!slug) return undefined;
    const cleanSlug = slug.toLowerCase();
    if (PLAYERS_REGISTRY[cleanSlug]) {
      return PLAYERS_REGISTRY[cleanSlug];
    }

    // Dynamic fallback generation for unindexed player slugs
    const formattedName = cleanSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      id:
        Math.abs(cleanSlug.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)) %
        100000,
      name: formattedName,
      slug: cleanSlug,
      number: 10,
      position: 'Professional Footballer',
      nationality: 'International',
      countryFlag: '⚽',
      clubSlug: 'arsenal',
      clubName: 'GoalMills Featured Club',
      competitionSlug: 'premier-league',
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=07101E&color=38BDF8&size=256&bold=true`,
      age: 25,
      height: '182 cm',
      marketValue: '€50.00M',
      bio: `${formattedName} is an elite professional footballer featured on GoalMills for tactical performance, match stats, and transfer intelligence.`,
      seasonStats: {
        appearances: 20,
        goals: 5,
        assists: 5,
        yellowCards: 2,
        passAccuracy: '88.5%',
        rating: 7.85,
      },
    };
  }

  static getOfficial(slug: string): OfficialMeta | undefined {
    if (!slug) return undefined;
    const cleanSlug = slug.toLowerCase();
    if (OFFICIALS_REGISTRY[cleanSlug]) {
      return OFFICIALS_REGISTRY[cleanSlug];
    }

    // Dynamic fallback generation for unindexed official slugs
    const formattedName = cleanSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      id:
        Math.abs(cleanSlug.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)) %
        100000,
      name: formattedName,
      slug: cleanSlug,
      country: 'International',
      countryCode: 'un',
      countryFlag: 'https://flagcdn.com/w80/un.png',
      role: 'Match Official',
      fifaBadgeSince: 2018,
      competitions: ['International Football', 'Domestic Cup', 'League Play'],
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=0A162B&color=F59E0B&size=256&bold=true`,
      age: 42,
      matches: 180,
      foulsPerGame: 21.0,
      yellowCardsTotal: 680,
      yellowCardsPerGame: 3.78,
      redCardsTotal: 28,
      redCardsPerGame: 0.16,
      penaltiesAwardedTotal: 46,
      penaltiesPerGame: 0.26,
      varAccuracy: '95.0%',
      strictnessRating: 'Balanced',
      bio: `${formattedName} is an accredited professional match official tracked on GoalMills for disciplinary metrics, foul tolerance, and match assignment logs.`,
      recentMatches: [
        {
          date: '2025-02-15',
          competition: 'League Match',
          fixture: 'Featured Match',
          yellowCards: 4,
          redCards: 0,
          penalties: 0,
        },
      ],
    };
  }

  static getAllOfficials(): OfficialMeta[] {
    return Object.values(OFFICIALS_REGISTRY);
  }

  static getCoach(slug: string): CoachMeta | undefined {
    if (!slug) return undefined;
    const cleanSlug = slug.toLowerCase();
    if (COACHES_REGISTRY[cleanSlug]) {
      return COACHES_REGISTRY[cleanSlug];
    }

    // Dynamic fallback generation for unindexed coach slugs
    const formattedName = cleanSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      id:
        Math.abs(cleanSlug.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)) %
        100000,
      name: formattedName,
      slug: cleanSlug,
      nationality: 'International',
      countryCode: 'un',
      countryFlag: 'https://flagcdn.com/w80/un.png',
      currentClubSlug: 'arsenal',
      currentClubName: 'Featured Club',
      competitionSlug: 'premier-league',
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=07101E&color=38BDF8&size=256&bold=true`,
      age: 50,
      preferredFormation: '4-3-3 Hybrid',
      coachingStyle: 'High-Press, Positional Control & Tactical Organization',
      matchesManaged: 300,
      winPercentage: 58.0,
      drawPercentage: 22.0,
      lossPercentage: 20.0,
      trophiesCount: 4,
      majorHonours: ['Domestic Cup Winner', 'League Championship'],
      bio: `${formattedName} is an elite football coach profiled on GoalMills for tactical formations, win statistics, and team management philosophies.`,
      careerClubs: [
        { club: 'Featured Club', years: '2023 - Present', matches: 70, winRate: '60.0%' },
      ],
    };
  }

  static getAllCoaches(): CoachMeta[] {
    return Object.values(COACHES_REGISTRY);
  }

  static getAuthor(slug: string) {
    return AUTHORS_REGISTRY[slug.toLowerCase()];
  }

  static getAllCompetitions(): CompetitionMeta[] {
    return Object.values(COMPETITIONS_REGISTRY);
  }

  static getAllClubs(): ClubMeta[] {
    return Object.values(CLUBS_REGISTRY);
  }

  static getAllPlayers(): PlayerMeta[] {
    return Object.values(PLAYERS_REGISTRY);
  }

  static getTransfers(filter?: { competitionSlug?: string; status?: string }): TransferItem[] {
    let result = INITIAL_TRANSFERS;
    if (filter?.competitionSlug) {
      result = result.filter((t) => t.competitionSlug === filter.competitionSlug);
    }
    if (filter?.status) {
      result = result.filter((t) => t.status === filter.status);
    }
    return result;
  }
}

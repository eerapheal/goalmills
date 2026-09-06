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

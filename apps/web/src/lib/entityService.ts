import { TransferItem, ArticleType } from '@goalmills/types';

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

export const COMPETITIONS_REGISTRY: Record<string, CompetitionMeta> = {
  'premier-league': {
    id: 152,
    name: 'Premier League',
    slug: 'premier-league',
    country: 'England',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    season: '2025/2026',
    featured: true,
    tier: 1,
    description: 'The top tier of English football featuring 20 premier clubs.',
  },
  'champions-league': {
    id: 300,
    name: 'UEFA Champions League',
    slug: 'champions-league',
    country: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/2.png',
    season: '2025/2026',
    featured: true,
    tier: 1,
    description: "Europe's most prestigious club football competition.",
  },
  'la-liga': {
    id: 302,
    name: 'La Liga',
    slug: 'la-liga',
    country: 'Spain',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    season: '2025/2026',
    featured: true,
    tier: 1,
    description: 'The pinnacle of Spanish domestic football.',
  },
  'serie-a': {
    id: 207,
    name: 'Serie A',
    slug: 'serie-a',
    country: 'Italy',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    season: '2025/2026',
    featured: true,
    tier: 1,
    description: 'The top league in Italian football with tactical mastery.',
  },
  'bundesliga': {
    id: 175,
    name: 'Bundesliga',
    slug: 'bundesliga',
    country: 'Germany',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    season: '2025/2026',
    featured: true,
    tier: 1,
    description: "Germany's top flight known for high-tempo attacking football.",
  },
  'african-football': {
    id: 999,
    name: 'African Football (CAF / AFCON)',
    slug: 'african-football',
    country: 'Africa',
    logo: 'https://media.api-sports.io/football/leagues/6.png',
    season: '2025/2026',
    featured: true,
    tier: 1,
    description: 'CAF Champions League, AFCON, and elite African stars across the globe.',
  },
};

export const CLUBS_REGISTRY: Record<string, ClubMeta> = {
  'arsenal': {
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
  'chelsea': {
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
  'liverpool': {
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
  'barcelona': {
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
  'galatasaray': {
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
};

export const INITIAL_TRANSFERS: TransferItem[] = [
  {
    id: 'tr-1',
    playerName: 'Victor Osimhen',
    playerSlug: 'victor-osimhen',
    fromTeam: { name: 'Napoli', slug: 'napoli', logo: 'https://media.api-sports.io/football/teams/492.png' },
    toTeam: { name: 'Arsenal FC', slug: 'arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
    fee: '€75M + Add-ons',
    status: 'negotiation',
    date: '2026-08-26',
    tier: 1,
    competitionSlug: 'premier-league',
    description: 'Arsenal have opened concrete talks with Napoli representatives to agree terms on a permanent summer transfer.',
  },
  {
    id: 'tr-2',
    playerName: 'Ademola Lookman',
    playerSlug: 'ademola-lookman',
    fromTeam: { name: 'Atalanta', slug: 'atalanta', logo: 'https://media.api-sports.io/football/teams/499.png' },
    toTeam: { name: 'Paris Saint-Germain', slug: 'psg', logo: 'https://media.api-sports.io/football/teams/85.png' },
    fee: '€60M',
    status: 'agreement',
    date: '2026-08-25',
    tier: 2,
    competitionSlug: 'champions-league',
    description: 'Personal terms agreed between Lookman and PSG on a 4-year contract; final club discussions in progress.',
  },
  {
    id: 'tr-3',
    playerName: 'Martin Zubimendi',
    playerSlug: 'martin-zubimendi',
    fromTeam: { name: 'Real Sociedad', slug: 'real-sociedad', logo: 'https://media.api-sports.io/football/teams/548.png' },
    toTeam: { name: 'Arsenal FC', slug: 'arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
    fee: '€60M Release Clause',
    status: 'done_deal',
    date: '2026-08-22',
    tier: 1,
    competitionSlug: 'premier-league',
    description: 'Official announcement completed: Zubimendi signs 5-year contract at Emirates Stadium.',
  },
  {
    id: 'tr-4',
    playerName: 'Florian Wirtz',
    playerSlug: 'florian-wirtz',
    fromTeam: { name: 'Bayer Leverkusen', slug: 'leverkusen', logo: 'https://media.api-sports.io/football/teams/168.png' },
    toTeam: { name: 'Manchester City', slug: 'manchester-city', logo: 'https://media.api-sports.io/football/teams/50.png' },
    fee: '€120M',
    status: 'rumour',
    date: '2026-08-24',
    tier: 3,
    competitionSlug: 'bundesliga',
    description: 'Man City monitoring Wirtz situation closely as part of long-term succession planning for De Bruyne.',
  },
];

export const AUTHORS_REGISTRY: Record<string, {
  name: string;
  slug: string;
  role: 'super-admin' | 'staff' | 'contributor';
  photo: string;
  bio: string;
  specialization: string[];
  socialLinks: { twitter?: string; linkedin?: string };
}> = {
  'ekpenisi-raphael': {
    name: 'Ekpenisi Erue Raphael',
    slug: 'ekpenisi-raphael',
    role: 'super-admin',
    photo: 'https://res.cloudinary.com/demo/image/upload/v1689234839/sample.jpg',
    bio: 'Founder & Chief Sports Editor at GoalMills. Veteran analyst covering European tactical innovations, transfer market intelligence, and African football development.',
    specialization: ['Transfer Market Intelligence', 'Tactical Analysis', 'African Football', 'Premier League'],
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
    specialization: ['Breaking News', 'Live Match Reports', 'Match Previews', 'Statistical Insights'],
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
    return PLAYERS_REGISTRY[slug.toLowerCase()];
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

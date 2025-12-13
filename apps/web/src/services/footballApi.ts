import {
  Fixture,
  Standing,
  League,
  Team,
  BlogPost,
  VideoHighlight,
  MatchEvent,
  Lineup,
} from '@goalmills/types';

// Mock Data - Top Football Leagues
export const mockLeagues: League[] = [
  {
    id: 39,
    name: 'Premier League',
    country: 'England',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    flag: 'https://media.api-sports.io/flags/gb.svg',
    season: 2024,
  },
  {
    id: 140,
    name: 'La Liga',
    country: 'Spain',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    flag: 'https://media.api-sports.io/flags/es.svg',
    season: 2024,
  },
  {
    id: 78,
    name: 'Bundesliga',
    country: 'Germany',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    flag: 'https://media.api-sports.io/flags/de.svg',
    season: 2024,
  },
  {
    id: 135,
    name: 'Serie A',
    country: 'Italy',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    flag: 'https://media.api-sports.io/flags/it.svg',
    season: 2024,
  },
  {
    id: 61,
    name: 'Ligue 1',
    country: 'France',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    flag: 'https://media.api-sports.io/flags/fr.svg',
    season: 2024,
  },
  {
    id: 2,
    name: 'UEFA Champions League',
    country: 'World',
    logo: 'https://media.api-sports.io/football/leagues/2.png',
    flag: 'https://media.api-sports.io/flags/eu.svg',
    season: 2024,
  },
];

// Mock Teams
export const mockTeams: Team[] = [
  { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
  { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
  { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
  { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
  { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
  { id: 47, name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png' },
  { id: 529, name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' },
  { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
  { id: 157, name: 'Bayern Munich', logo: 'https://media.api-sports.io/football/teams/157.png' },
  { id: 489, name: 'AC Milan', logo: 'https://media.api-sports.io/football/teams/489.png' },
  { id: 496, name: 'Juventus', logo: 'https://media.api-sports.io/football/teams/496.png' },
  { id: 85, name: 'Paris Saint Germain', logo: 'https://media.api-sports.io/football/teams/85.png' },
];

// Generate Mock Fixtures
const generateMockFixtures = (): Fixture[] => {
  const fixtures: Fixture[] = [];
  const now = Date.now();
  const statuses = [
    { long: 'Match Finished', short: 'FT', elapsed: 90 },
    { long: 'First Half', short: '1H', elapsed: 35 },
    { long: 'Second Half', short: '2H', elapsed: 67 },
    { long: 'Not Started', short: 'NS', elapsed: null },
    { long: 'Halftime', short: 'HT', elapsed: 45 },
  ];

  for (let i = 0; i < 20; i++) {
    const homeTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
    let awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
    while (awayTeam.id === homeTeam.id) {
      awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
    }

    const league = mockLeagues[Math.floor(Math.random() * mockLeagues.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Mix of past, live, and future matches
    const dayOffset = i < 8 ? -1 : i < 12 ? 0 : Math.floor(Math.random() * 7) + 1;
    const timestamp = now + dayOffset * 24 * 60 * 60 * 1000 + Math.random() * 24 * 60 * 60 * 1000;
    
    const isFinished = status.short === 'FT';
    const isLive = status.short === '1H' || status.short === '2H' || status.short === 'HT';
    const homeGoals = isFinished || isLive ? Math.floor(Math.random() * 4) : null;
    const awayGoals = isFinished || isLive ? Math.floor(Math.random() * 4) : null;

    fixtures.push({
      fixture: {
        id: 1000 + i,
        referee: isFinished || isLive ? 'Michael Oliver' : null,
        timezone: 'UTC',
        date: new Date(timestamp).toISOString(),
        timestamp: Math.floor(timestamp / 1000),
        venue: {
          id: homeTeam.id * 10,
          name: `${homeTeam.name} Stadium`,
          city: league.country,
        },
        status,
      },
      league: { ...league, round: `Regular Season - ${Math.floor(Math.random() * 38) + 1}` },
      teams: {
        home: { ...homeTeam, winner: isFinished ? homeGoals! > awayGoals! : null },
        away: { ...awayTeam, winner: isFinished ? awayGoals! > homeGoals! : null },
      },
      goals: {
        home: homeGoals,
        away: awayGoals,
      },
      score: {
        halftime: {
          home: isLive || isFinished ? Math.floor((homeGoals || 0) * 0.6) : null,
          away: isLive || isFinished ? Math.floor((awayGoals || 0) * 0.6) : null,
        },
        fulltime: {
          home: isFinished ? homeGoals : null,
          away: isFinished ? awayGoals : null,
        },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      },
    });
  }

  return fixtures.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
};

export const mockFixtures = generateMockFixtures();

// Generate Mock Standings
export const mockStandings: Standing[] = [
  {
    rank: 1,
    team: mockTeams[1], // Manchester City
    points: 45,
    goalsDiff: 28,
    group: 'Premier League',
    form: 'WWWDW',
    status: 'same',
    description: 'Promotion - Champions League (Group Stage)',
    all: { played: 18, win: 14, draw: 3, lose: 1, goals: { for: 48, against: 20 } },
    home: { played: 9, win: 7, draw: 2, lose: 0, goals: { for: 25, against: 8 } },
    away: { played: 9, win: 7, draw: 1, lose: 1, goals: { for: 23, against: 12 } },
    update: new Date().toISOString(),
  },
  {
    rank: 2,
    team: mockTeams[2], // Liverpool
    points: 42,
    goalsDiff: 24,
    group: 'Premier League',
    form: 'WWLWW',
    status: 'same',
    description: 'Promotion - Champions League (Group Stage)',
    all: { played: 18, win: 13, draw: 3, lose: 2, goals: { for: 44, against: 20 } },
    home: { played: 9, win: 7, draw: 1, lose: 1, goals: { for: 24, against: 10 } },
    away: { played: 9, win: 6, draw: 2, lose: 1, goals: { for: 20, against: 10 } },
    update: new Date().toISOString(),
  },
  {
    rank: 3,
    team: mockTeams[3], // Arsenal
    points: 40,
    goalsDiff: 22,
    group: 'Premier League',
    form: 'WDWWL',
    status: 'same',
    description: 'Promotion - Champions League (Group Stage)',
    all: { played: 18, win: 12, draw: 4, lose: 2, goals: { for: 42, against: 20 } },
    home: { played: 9, win: 6, draw: 2, lose: 1, goals: { for: 22, against: 10 } },
    away: { played: 9, win: 6, draw: 2, lose: 1, goals: { for: 20, against: 10 } },
    update: new Date().toISOString(),
  },
  {
    rank: 4,
    team: mockTeams[4], // Chelsea
    points: 35,
    goalsDiff: 15,
    group: 'Premier League',
    form: 'WDLWW',
    status: 'same',
    description: 'Promotion - Champions League (Group Stage)',
    all: { played: 18, win: 10, draw: 5, lose: 3, goals: { for: 38, against: 23 } },
    home: { played: 9, win: 6, draw: 2, lose: 1, goals: { for: 20, against: 10 } },
    away: { played: 9, win: 4, draw: 3, lose: 2, goals: { for: 18, against: 13 } },
    update: new Date().toISOString(),
  },
  {
    rank: 5,
    team: mockTeams[0], // Manchester United
    points: 32,
    goalsDiff: 10,
    group: 'Premier League',
    form: 'DWLWD',
    status: 'same',
    description: 'Promotion - Europa League (Group Stage)',
    all: { played: 18, win: 9, draw: 5, lose: 4, goals: { for: 32, against: 22 } },
    home: { played: 9, win: 5, draw: 3, lose: 1, goals: { for: 18, against: 10 } },
    away: { played: 9, win: 4, draw: 2, lose: 3, goals: { for: 14, against: 12 } },
    update: new Date().toISOString(),
  },
];

// Mock Blog Posts
export const mockBlogPosts: BlogPost[] = [
  {
    _id: '1',
    title: 'Premier League Title Race Heats Up',
    excerpt: 'Manchester City and Liverpool are neck and neck in one of the most exciting title races in recent years.',
    content: 'Full article content here...',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    author: 'John Smith',
    readTime: 5,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Football',
  },
  {
    _id: '2',
    title: 'Champions League Quarter-Finals Preview',
    excerpt: 'A look at the upcoming Champions League quarter-final matches and key players to watch.',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
    author: 'Sarah Johnson',
    readTime: 7,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Football',
  },
  {
    _id: '3',
    title: 'Transfer Window: Top Deals to Watch',
    excerpt: 'The biggest transfer rumors and confirmed deals as the transfer window approaches.',
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800',
    author: 'Mike Davis',
    readTime: 6,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Football',
  },
];

// Mock Video Highlights
export const mockVideoHighlights: VideoHighlight[] = [
  {
    id: '1',
    title: 'Manchester City vs Liverpool - All Goals & Highlights',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    views: 1250000,
    duration: '8:45',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    teams: ['Manchester City', 'Liverpool'],
    description: 'Extended highlights from the thrilling 3-3 draw at the Etihad Stadium',
  },
  {
    id: '2',
    title: 'Real Madrid 4-0 Barcelona - El Clasico Highlights',
    thumbnail: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    views: 2100000,
    duration: '10:22',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    teams: ['Real Madrid', 'Barcelona'],
    description: 'Real Madrid dominate El Clasico with a stunning performance',
  },
  {
    id: '3',
    title: 'Best Goals of the Week - Matchday 18',
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    views: 850000,
    duration: '6:15',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    teams: [],
    description: 'The most spectacular goals from this week across all leagues',
  },
];

// Generate Mock Match Events
const generateMockEvents = (fixtureId: number): MatchEvent[] => {
  return [
    {
      time: { elapsed: 14, extra: null },
      team: mockTeams[0],
      player: { id: 1, name: 'Rashford' },
      assist: { id: 2, name: 'Fernandes' },
      type: 'Goal',
      detail: 'Normal Goal',
      comments: null,
    },
    {
      time: { elapsed: 32, extra: null },
      team: mockTeams[1],
      player: { id: 3, name: 'De Bruyne', },
      assist: { id: null, name: null },
      type: 'Card',
      detail: 'Yellow Card',
      comments: null,
    },
    {
      time: { elapsed: 65, extra: null },
      team: mockTeams[0],
      player: { id: 5, name: 'Antony' },
      assist: { id: 6, name: 'Casemiro' },
      type: 'subst',
      detail: 'Substitution',
      comments: null,
    },
  ];
};

// Generate Mock Lineups
const generateMockLineups = (homeTeam: Team, awayTeam: Team): Lineup[] => {
  return [
    {
      team: homeTeam,
      formation: '4-3-3',
      startXI: Array(11).fill(null).map((_, i) => ({
        player: { id: i, name: `${homeTeam.name} Player ${i + 1}`, number: i + 1, pos: 'M', grid: null },
      })),
      substitutes: Array(5).fill(null).map((_, i) => ({
        player: { id: 20 + i, name: `${homeTeam.name} Sub ${i + 1}`, number: 20 + i, pos: 'F', grid: null },
      })),
      coach: { id: 100, name: 'Home Coach', photo: '' },
    },
    {
      team: awayTeam,
      formation: '4-4-2',
      startXI: Array(11).fill(null).map((_, i) => ({
        player: { id: i, name: `${awayTeam.name} Player ${i + 1}`, number: i + 1, pos: 'D', grid: null },
      })),
      substitutes: Array(5).fill(null).map((_, i) => ({
        player: { id: 30 + i, name: `${awayTeam.name} Sub ${i + 1}`, number: 30 + i, pos: 'M', grid: null },
      })),
      coach: { id: 101, name: 'Away Coach', photo: '' },
    },
  ];
};

// API Functions
export const footballApi = {
  // Get live fixtures
  getLiveFixtures: async (): Promise<Fixture[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockFixtures.filter((f) => 
      f.fixture.status.short === '1H' || 
      f.fixture.status.short === '2H' || 
      f.fixture.status.short === 'HT'
    );
  },

  // Get upcoming fixtures
  getUpcomingFixtures: async (limit = 10): Promise<Fixture[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    const now = Date.now() / 1000;
    return mockFixtures
      .filter((f) => f.fixture.timestamp > now && f.fixture.status.short === 'NS')
      .slice(0, limit);
  },

  // Get finished fixtures
  getFinishedFixtures: async (limit = 10): Promise<Fixture[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockFixtures
      .filter((f) => f.fixture.status.short === 'FT')
      .reverse()
      .slice(0, limit);
  },

  // Get fixtures by league
  getFixturesByLeague: async (leagueId: number): Promise<Fixture[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockFixtures.filter((f) => f.league.id === leagueId);
  },

  // Get fixtures by team
  getFixturesByTeam: async (teamId: number): Promise<Fixture[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockFixtures.filter(
      (f) => f.teams.home.id === teamId || f.teams.away.id === teamId
    );
  },

  // Get standings by league
  getStandingsByLeague: async (leagueId: number): Promise<Standing[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockStandings;
  },

  // Get all leagues
  getLeagues: async (): Promise<League[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockLeagues;
  },

  // Get top leagues (by ranking)
  getTopLeagues: async (limit = 6): Promise<League[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockLeagues.slice(0, limit);
  },

  // Get teams
  getTeams: async (): Promise<Team[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockTeams;
  },

  // Get blog posts
  getBlogPosts: async (limit = 10): Promise<BlogPost[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockBlogPosts.slice(0, limit);
  },

  // Get video highlights
  getVideoHighlights: async (limit = 10): Promise<VideoHighlight[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockVideoHighlights.slice(0, limit);
  },

  // Get fixture by ID
  getFixtureById: async (fixtureId: number): Promise<Fixture | null> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockFixtures.find((f) => f.fixture.id === fixtureId) || null;
  },

  // Get league by ID
  getLeagueById: async (leagueId: number): Promise<League | null> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockLeagues.find((l) => l.id === leagueId) || null;
  },

  // Get team by ID
  getTeamById: async (teamId: number): Promise<Team | null> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return mockTeams.find((t) => t.id === teamId) || null;
  },

  // Get lineups by fixture ID
  getLineupsByFixtureId: async (fixtureId: number): Promise<Lineup[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    const fixture = mockFixtures.find((f) => f.fixture.id === fixtureId);
    if (!fixture) return [];
    return generateMockLineups(fixture.teams.home, fixture.teams.away);
  },

  // Get events by fixture ID
  getEventsByFixtureId: async (fixtureId: number): Promise<MatchEvent[]> => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return generateMockEvents(fixtureId);
  },
};

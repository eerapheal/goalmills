// Blog and Video Types
export interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  author: string;
  readTime: number;
  createdAt: string;
  category: string;
}

export interface VideoHighlight {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  duration: string;
  createdAt: string;
  teams: string[];
  description?: string;
}

// Football Types
export interface Team {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round?: string;
}

export interface Score {
  halftime: { home: number | null; away: number | null };
  fulltime: { home: number | null; away: number | null };
  extratime: { home: number | null; away: number | null };
  penalty: { home: number | null; away: number | null };
}

export interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: Score;
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

export interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: Team;
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

export interface LineupPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
    grid: string | null;
  };
}

export interface Lineup {
  team: Team;
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach: {
    id: number;
    name: string;
    photo: string;
  };
}

// Cricket Types

export interface CricketTeam {
  id: number;
  name: string;
  shortName?: string;
  logo?: string;
  country?: string;
}

export interface CricketPlayer {
  id: number;
  name: string;
  fullName?: string;
  nickName?: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  country?: string;
  image?: string;
  teamId?: number;
}

export interface CricketSeries {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  seriesType?: string;
  tournament?: string;
  country?: string;
  image?: string;
}

export interface CricketVenue {
  id: number;
  name: string;
  city?: string;
  country?: string;
}

export interface CricketMatchInfo {
  id: number;
  name: string;
  matchType: string;
  status: string;
  venue: CricketVenue;
  date: string;
  dateTimeGMT: string;
  teams: [string, string];
  teamInfo: CricketTeam[];
  score?: CricketMatchScore[];
  series: string;
  seriesId: number;
  matchStarted: boolean;
  matchEnded: boolean;
}

export interface CricketMatchScore {
  team: string;
  teamId: number;
  innings: string;
  runs: number;
  wickets: number;
  overs: number;
}

export interface CricketBatsmanScore {
  playerId: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: string;
}

export interface CricketBowlerStats {
  playerId: number;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  wides?: number;
  noBalls?: number;
}

export interface CricketScoreboard {
  matchId: number;
  currentInnings: number;
  battingTeam: CricketTeam;
  bowlingTeam: CricketTeam;
  batsmen: CricketBatsmanScore[];
  bowlers: CricketBowlerStats[];
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  runRate: number;
  requiredRunRate?: number;
  target?: number;
  result?: string;
}

// Cricket API Response Types
export interface CricketFixturesResponse {
  fixtures: CricketMatchInfo[];
  totalMatches: number;
}

export interface CricketLiveMatchResponse {
  matches: CricketMatchInfo[];
  totalMatches: number;
}

export interface CricketSeriesResponse {
  series: CricketSeries[];
  totalSeries: number;
}

export interface CricketTeamsResponse {
  teams: CricketTeam[];
  totalTeams: number;
}

export interface CricketPlayersResponse {
  players: CricketPlayer[];
  totalPlayers: number;
}

export interface CricketMatchDetailResponse {
  matchInfo: CricketMatchInfo;
  venueInfo?: CricketVenue;
  tossResults?: {
    winner: string;
    decision: string;
  };
  matchFormat?: string;
  umpires?: string[];
  referee?: string;
}

export interface CricketScoreboardResponse {
  scoreboard: CricketScoreboard;
  matchInfo: CricketMatchInfo;
}

// Endpoint Specific Types
export interface GetCricketFixturesParams {
  type?: 'all' | 'international' | 'domestic' | 'league' | 'women';
  page?: number;
  limit?: number;
}

export interface GetCricketSeriesParams {
  type?: 'all' | 'international' | 'domestic' | 'league' | 'women';
  page?: number;
  limit?: number;
}

export interface GetCricketMatchesParams {
  type?: 'live' | 'recent' | 'upcoming';
  page?: number;
  limit?: number;
}

export interface GetCricketSchedulesParams {
  type?: 'all' | 'international' | 'domestic' | 'league' | 'women';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetCricketTeamsParams {
  type?: 'international' | 'domestic' | 'league' | 'women';
  page?: number;
  limit?: number;
}

export interface GetCricketPlayersParams {
  teamId: number;
  page?: number;
  limit?: number;
}

export interface GetCricketMatchInfoParams {
  matchId: number;
}

export interface GetCricketScoreboardParams {
  matchId: number;
}

// Schedule Type
export interface CricketSchedule {
  date: string;
  matches: CricketMatchInfo[];
}

export interface CricketSchedulesResponse {
  schedules: CricketSchedule[];
  totalDays: number;
}

// API Client Interface
export interface CricbuzzAPIClient {
  // Fixtures
  getFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse>;
  getInternationalFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse>;
  getDomesticFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse>;
  getLeagueFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse>;
  getWomenFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse>;
  
  // Series
  getSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse>;
  getInternationalSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse>;
  getDomesticSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse>;
  getLeagueSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse>;
  getWomenSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse>;
  
  // Matches
  getLiveMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse>;
  getRecentMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse>;
  getUpcomingMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse>;
  getMatchInfo(params: GetCricketMatchInfoParams): Promise<CricketMatchDetailResponse>;
  getMatchScoreboard(params: GetCricketScoreboardParams): Promise<CricketScoreboardResponse>;
  
  // Schedules
  getSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse>;
  getInternationalSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse>;
  getDomesticSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse>;
  getLeagueSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse>;
  getWomenSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse>;
  
  // Teams
  getTeams(): Promise<CricketTeamsResponse>;
  getInternationalTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse>;
  getDomesticTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse>;
  getLeagueTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse>;
  getWomenTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse>;
  
  // Players
  getPlayersByTeamId(params: GetCricketPlayersParams): Promise<CricketPlayersResponse>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export type SportType = 'football' | 'cricket' | 'tennis' | 'basketball' | 'baseball' | 'hockey';

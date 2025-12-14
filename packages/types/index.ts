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
  isFeatured?: boolean;
  importance?: number;
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

export interface GetCricketSeriesMatchesParams {
  seriesId: number;
  type?: 'all' | 'live' | 'recent' | 'upcoming';
  page?: number;
  limit?: number;
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
  getSeriesMatches(params: GetCricketSeriesMatchesParams): Promise<CricketLiveMatchResponse>;
  
  // Matches
  getLiveMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse>;
  getRecentMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse>;
  getUpcomingMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse>;
  getFeaturedMatches(limit?: number): Promise<CricketLiveMatchResponse>;
  getImportantMatches(limit?: number): Promise<CricketLiveMatchResponse>;
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

// Tennis Types

// Base Types
export interface TennisCountry {
  country_key: number;
  country_name: string;
}

export interface TennisLeague {
  league_key: number | string;
  league_name: string;
  country_key: number | string;
  country_name: string;
  league_surface?: string;
}

export interface TennisPlayer {
  player_key: number | string;
  player_name: string;
  player_country?: string;
  player_bday?: string;
  player_logo?: string | null;
  stats?: TennisPlayerStats[];
  tournaments?: TennisPlayerTournament[];
}

export interface TennisPlayerStats {
  season: string;
  type: 'singles' | 'doubles';
  rank: string;
  titles: string;
  matches_won: string;
  matches_lost: string;
  hard_won: string;
  hard_lost: string;
  clay_won: string;
  clay_lost: string;
  grass_won: string;
  grass_lost: string;
}

export interface TennisPlayerTournament {
  name: string;
  season: string;
  type: 'singles' | 'doubles';
  surface: string;
  prize: string;
}

export interface TennisPoint {
  number_point: string;
  score: string;
  break_point: string | null;
  set_point: string | null;
  match_point: string | null;
}

export interface TennisGame {
  set_number: string;
  number_game: string;
  player_served: string;
  serve_winner: string | null;
  serve_lost: string | null;
  score: string;
  points: TennisPoint[];
}

export interface TennisScore {
  score_first: string;
  score_second: string;
  score_set: string;
}

export interface TennisEvent {
  event_key: number | string;
  event_date: string;
  event_time: string;
  event_first_player: string;
  first_player_key: number | string;
  event_second_player: string;
  second_player_key: number | string;
  event_final_result: string;
  event_game_result: string;
  event_serve: string | null;
  event_winner: string | null;
  event_status: string;
  country_name: string;
  league_name: string;
  league_key: number | string;
  league_round: string;
  league_season: string;
  event_live: string;
  event_first_player_logo: string | null;
  event_second_player_logo: string | null;
  event_qualification?: string;
  pointbypoint?: TennisGame[];
  scores?: TennisScore[];
}

export interface TennisStanding {
  place: string;
  player: string;
  player_key: number | string;
  league: 'ATP' | 'WTA';
  movement: 'up' | 'down' | 'same';
  country: string;
  points: string;
}

export interface TennisBookmaker {
  [bookmakerName: string]: string;
}

export interface TennisOddsMarket {
  [outcome: string]: TennisBookmaker;
}

export interface TennisMatchOdds {
  [marketName: string]: TennisOddsMarket;
}

export interface TennisLiveOdd {
  odd_name: string;
  suspended: 'Yes' | 'No';
  type: string;
  value: string;
  handicap?: string;
}

export interface TennisLiveOddsEvent extends Omit<TennisEvent, 'pointbypoint' | 'scores'> {
  live_odds: TennisLiveOdd[];
}

// API Response Types
export interface TennisApiResponse<T> {
  success: 0 | 1;
  result: T;
}

export interface TennisCountriesResponse {
  success: 1;
  result: TennisLeague[];
}

export interface TennisLeaguesResponse {
  success: 1;
  result: TennisLeague[];
}

export interface TennisFixturesResponse {
  success: 1;
  result: TennisEvent[];
}

export interface TennisH2HResponse {
  success: 1;
  result: {
    H2H: TennisEvent[];
    firstTeamResults: TennisEvent[];
    secondTeamResults: TennisEvent[];
  };
}

export interface TennisLivescoreResponse {
  success: 1;
  result: TennisEvent[];
}

export interface TennisStandingsResponse {
  success: 1;
  result: TennisStanding[];
}

export interface TennisPlayersResponse {
  success: 1;
  result: TennisPlayer[];
}

export interface TennisOddsResponse {
  success: 1;
  result: {
    [matchId: string]: TennisMatchOdds;
  };
}

export interface TennisLiveOddsResponse {
  success: 1;
  result: {
    [matchId: string]: TennisLiveOddsEvent;
  };
}

// API Request Parameter Types
export interface TennisBaseParams {
  met: string;
  APIkey?: string;
}

export interface TennisCountriesParams extends TennisBaseParams {
  met: 'Countries';
}

export interface TennisLeaguesParams extends TennisBaseParams {
  met: 'Leagues';
  countryId?: number;
}

export interface TennisFixturesParams extends TennisBaseParams {
  met: 'Fixtures';
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
  timezone?: string;
  countryId?: number;
  leagueId?: number;
  matchId?: number;
  playerId?: number;
}

export interface TennisH2HParams extends TennisBaseParams {
  met: 'H2H';
  firstPlayerId: number;
  secondPlayerId: number;
  timezone?: string;
}

export interface TennisLivescoreParams extends TennisBaseParams {
  met: 'Livescore';
  timezone?: string;
  countryId?: number;
  leagueId?: number;
  matchId?: number;
}

export interface TennisStandingsParams extends TennisBaseParams {
  met: 'Standings';
  league: 'ATP' | 'WTA';
}

export interface TennisPlayersParams extends TennisBaseParams {
  met: 'Players';
  leagueId?: number;
  playerId?: number;
}

export interface TennisOddsParams extends TennisBaseParams {
  met: 'Odds';
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  countryId?: number;
  leagueId?: number;
  matchId?: number;
}

export interface TennisLiveOddsParams extends TennisBaseParams {
  met: 'LiveOdds';
  countryId?: number;
  leagueId?: number;
  matchId?: number;
}

// API Client Interface
export interface TennisAPIClient {
  /**
   * Get list of supported tennis tournaments types
   */
  getCountries(params: Omit<TennisCountriesParams, 'met'>): Promise<TennisCountriesResponse>;

  /**
   * Get list of supported tennis competitions/leagues
   */
  getLeagues(params: Omit<TennisLeaguesParams, 'met'>): Promise<TennisLeaguesResponse>;

  /**
   * Get tennis fixtures/events
   */
  getFixtures(params: Omit<TennisFixturesParams, 'met'>): Promise<TennisFixturesResponse>;

  /**
   * Get head to head results between two players
   */
  getH2H(params: Omit<TennisH2HParams, 'met'>): Promise<TennisH2HResponse>;

  /**
   * Get live tennis matches
   */
  getLivescore(params: Omit<TennisLivescoreParams, 'met'>): Promise<TennisLivescoreResponse>;

  /**
   * Get ATP or WTA standings
   */
  getStandings(params: Omit<TennisStandingsParams, 'met'>): Promise<TennisStandingsResponse>;

  /**
   * Get player information and statistics
   */
  getPlayers(params: Omit<TennisPlayersParams, 'met'>): Promise<TennisPlayersResponse>;

  /**
   * Get pre-match odds for events
   */
  getOdds(params: Omit<TennisOddsParams, 'met'>): Promise<TennisOddsResponse>;

  /**
   * Get live odds for ongoing events
   */
  getLiveOdds(params: Omit<TennisLiveOddsParams, 'met'>): Promise<TennisLiveOddsResponse>;
}

export type TennisEventStatus = 
  | 'Finished' 
  | 'Set 1' 
  | 'Set 2' 
  | 'Set 3' 
  | 'Set 4' 
  | 'Set 5' 
  | string;

export type TennisEventWinner = 'First Player' | 'Second Player' | null;

export type TennisSurfaceType = 'Hard' | 'Clay' | 'Grass' | 'Hard (indoor)' | string;

export type TennisMovement = 'up' | 'down' | 'same';

export type TennisLeagueType = 'ATP' | 'WTA';

// Basketball Types

// Base Types
export interface BasketballCountry {
  country_key: string;
  country_name: string;
}

export interface BasketballLeague {
  league_key: string;
  league_name: string;
  country_key: string;
  country_name: string;
}

export interface BasketballTeam {
  team_key: string;
  team_name: string;
  team_logo: string | null;
}

export interface QuarterScore {
  score_home: string;
  score_away: string;
}

export interface BasketballScores {
  '1stQuarter'?: QuarterScore[];
  '2ndQuarter'?: QuarterScore[];
  '3rdQuarter'?: QuarterScore[];
  '4thQuarter'?: QuarterScore[];
  'Overtime'?: QuarterScore[];
}

export interface BasketballStatistic {
  type: string;
  home: string;
  away: string;
}

export interface BasketballLineupPlayer {
  player: string;
  player_id: string;
}

export interface BasketballTeamLineup {
  starting_lineups: BasketballLineupPlayer[];
  substitutes: BasketballLineupPlayer[];
}

export interface BasketballLineups {
  home_team: BasketballTeamLineup;
  away_team: BasketballTeamLineup;
}

export interface BasketballPlayerStatistic {
  player: string;
  player_id: string;
  player_assists: string;
  player_blocks: string;
  player_defense_rebounds: string;
  player_field_goals_attempts: string;
  player_field_goals_made: string;
  player_freethrows_goals_attempts: string;
  player_freethrows_goals_made: string;
  player_minutes: string;
  player_offence_rebounds: string;
  player_oncourt: 'True' | 'False';
  player_personal_fouls: string;
  player_plus_minus: string;
  player_position: string;
  player_points: string;
  player_steals: string;
  player_threepoint_goals_attempts: string;
  player_threepoint_goals_made: string;
  player_total_rebounds: string;
  player_turnovers: string;
}

export interface BasketballPlayerStatistics {
  home_team: BasketballPlayerStatistic[];
  away_team: BasketballPlayerStatistic[];
}

export interface BasketballEvent {
  event_key: string;
  event_date: string;
  event_time: string;
  event_home_team: string;
  home_team_key: string;
  event_away_team: string;
  away_team_key: string;
  event_final_result: string;
  event_quarter?: string;
  event_status: string;
  country_name: string;
  league_name: string;
  league_key: string;
  league_round: string | null;
  league_season: string;
  event_live: string;
  event_home_team_logo?: string | null;
  event_away_team_logo?: string | null;
  scores?: BasketballScores;
  statistics?: BasketballStatistic[];
  lineups?: BasketballLineups;
  player_statistics?: BasketballPlayerStatistics;
}

export interface BasketballStanding {
  standing_place: string;
  standing_place_type: string;
  standing_team: string;
  standing_P: string;
  standing_W: string;
  standing_WO: string;
  standing_L: string;
  standing_LO: string;
  standing_F: string;
  standing_A: string;
  standing_PCT: string;
  team_key: string;
  league_key: string;
  league_season: string;
  league_round: string;
  standing_updated: string;
}

export interface BasketballBookmaker {
  [bookmakerName: string]: string;
}

export interface BasketballOddsMarket {
  [outcome: string]: BasketballBookmaker;
}

export interface BasketballMatchOdds {
  [marketName: string]: BasketballOddsMarket;
}

// API Response Types
export interface BasketballApiResponse<T> {
  success: 0 | 1;
  result: T;
}

export interface BasketballCountriesResponse {
  success: 1;
  result: BasketballCountry[];
}

export interface BasketballLeaguesResponse {
  success: 1;
  result: BasketballLeague[];
}

export interface BasketballFixturesResponse {
  success: 1;
  result: BasketballEvent[];
}

export interface BasketballH2HResponse {
  success: 1;
  result: {
    H2H: BasketballEvent[];
    firstTeamResults: BasketballEvent[];
    secondTeamResults: BasketballEvent[];
  };
}

export interface BasketballLivescoreResponse {
  success: 1;
  result: BasketballEvent[];
}

export interface BasketballStandingsResponse {
  success: 1;
  result: {
    total: BasketballStanding[];
  };
}

export interface BasketballTeamsResponse {
  success: 1;
  result: BasketballTeam[];
}

export interface BasketballOddsResponse {
  success: 1;
  result: {
    [matchId: string]: BasketballMatchOdds;
  };
}

// API Request Parameter Types
export interface BasketballBaseParams {
  met: string;
  APIkey?: string;
}

export interface BasketballCountriesParams extends BasketballBaseParams {
  met: 'Countries';
}

export interface BasketballLeaguesParams extends BasketballBaseParams {
  met: 'Leagues';
  countryId?: number;
}

export interface BasketballFixturesParams extends BasketballBaseParams {
  met: 'Fixtures';
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
  timezone?: string;
  countryId?: number;
  leagueId?: number;
  matchId?: number;
  teamId?: number;
}

export interface BasketballH2HParams extends BasketballBaseParams {
  met: 'H2H';
  firstTeamId: number;
  secondTeamId: number;
  timezone?: string;
}

export interface BasketballLivescoreParams extends BasketballBaseParams {
  met: 'Livescore';
  timezone?: string;
  countryId?: number;
  leagueId?: number;
  matchId?: number;
}

export interface BasketballStandingsParams extends BasketballBaseParams {
  met: 'Standings';
  leagueId: number;
}

export interface BasketballTeamsParams extends BasketballBaseParams {
  met: 'Teams';
  leagueId?: number;
  teamId?: number;
}

export interface BasketballOddsParams extends BasketballBaseParams {
  met: 'Odds';
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  countryId?: number;
  leagueId?: number;
  matchId?: number;
}

// API Client Interface
export interface BasketballAPIClient {
  /**
   * Get list of supported countries
   */
  getCountries(params: Omit<BasketballCountriesParams, 'met'>): Promise<BasketballCountriesResponse>;

  /**
   * Get list of supported leagues/competitions
   */
  getLeagues(params: Omit<BasketballLeaguesParams, 'met'>): Promise<BasketballLeaguesResponse>;

  /**
   * Get basketball fixtures/events
   */
  getFixtures(params: Omit<BasketballFixturesParams, 'met'>): Promise<BasketballFixturesResponse>;

  /**
   * Get head to head results between two teams
   */
  getH2H(params: Omit<BasketballH2HParams, 'met'>): Promise<BasketballH2HResponse>;

  /**
   * Get live basketball matches
   */
  getLivescore(params: Omit<BasketballLivescoreParams, 'met'>): Promise<BasketballLivescoreResponse>;

  /**
   * Get league standings
   */
  getStandings(params: Omit<BasketballStandingsParams, 'met'>): Promise<BasketballStandingsResponse>;

  /**
   * Get teams information
   */
  getTeams(params: Omit<BasketballTeamsParams, 'met'>): Promise<BasketballTeamsResponse>;

  /**
   * Get pre-match odds for events
   */
  getOdds(params: Omit<BasketballOddsParams, 'met'>): Promise<BasketballOddsResponse>;
}

// Utility Types
export type BasketballEventStatus = 
  | 'Finished' 
  | 'Live'
  | '1st Quarter' 
  | '2nd Quarter' 
  | '3rd Quarter' 
  | '4th Quarter'
  | 'Overtime'
  | 'Halftime'
  | 'Not Started'
  | string;

export type BasketballPlayerPosition = 
  | 'PG' // Point Guard
  | 'SG' // Shooting Guard
  | 'SF' // Small Forward
  | 'PF' // Power Forward
  | 'C'  // Center
  | string;

export type BasketballStatisticType =
  | 'Total Assists'
  | 'Total Blocks'
  | 'Total Rebounds'
  | 'Total Steals'
  | 'Total Turnovers'
  | 'Field Goals Made'
  | 'Field Goals Attempted'
  | 'Three Point Made'
  | 'Three Point Attempted'
  | 'Free Throws Made'
  | 'Free Throws Attempted'
  | string;

// Extended Types for Detailed Match Data
export interface BasketballDetailedEvent extends BasketballEvent {
  scores: BasketballScores;
  statistics: BasketballStatistic[];
  lineups: BasketballLineups;
  player_statistics: BasketballPlayerStatistics;
}

// Helper type for odds markets
export type BasketballOddsMarketType = 
  | '3Way Result'
  | 'Home/Away'
  | 'Total'
  | 'Handicap'
  | 'First Half Result'
  | 'Second Half Result'
  | string;

// Helper type for odds outcomes
export type BasketballOddsOutcome = 
  | 'Home'
  | 'Away'
  | 'Draw'
  | 'Over'
  | 'Under'
  | string;

export type SportType = 'football' | 'cricket' | 'tennis' | 'basketball' | 'baseball' | 'hockey';


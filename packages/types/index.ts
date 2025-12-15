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

// Advanced Football API Types (AllSportsAPI)

// Base Types
export interface FootballCountry {
  country_key: string;
  country_name: string;
  country_iso2: string | null;
  country_logo: string;
}

export interface FootballLeague {
  league_key: string;
  league_name: string;
  country_key: string;
  country_name: string;
  league_logo: string;
  country_logo: string;
}

export interface FootballTeam {
  team_key: string;
  team_name: string;
  team_logo: string;
  players?: FootballPlayer[];
}

export interface FootballPlayer {
  player_key: number;
  player_name: string;
  player_number: string;
  player_country: string | null;
  player_type: string;
  player_age: string;
  player_match_played: string;
  player_goals: string;
  player_yellow_cards: string;
  player_red_cards: string;
  player_image: string;
  player_minutes?: string;
  player_injured?: string;
  player_substitute_out?: string;
  player_substitutes_on_bench?: string;
  player_assists?: string;
  player_is_captain?: string;
  player_shots_total?: string;
  player_goals_conceded?: string;
  player_fouls_commited?: string;
  player_tackles?: string;
  player_blocks?: string;
  player_crosses_total?: string;
  player_interceptions?: string;
  player_clearances?: string;
  player_dispossesed?: string;
  player_saves?: string;
  player_inside_box_saves?: string;
  player_duels_total?: string;
  player_duels_won?: string;
  player_dribble_attempts?: string;
  player_dribble_succ?: string;
  player_pen_comm?: string;
  player_pen_won?: string;
  player_pen_scored?: string;
  player_pen_missed?: string;
  player_passes?: string;
  player_passes_accuracy?: string;
  player_key_passes?: string;
  player_woordworks?: string;
  player_rating?: string;
  team_name?: string;
  team_key?: string;
  player_position?: string;
}

export interface FootballGoalScorer {
  time: string;
  home_scorer: string;
  score: string;
  away_scorer: string;
}

export interface FootballSubstitute {
  time: string;
  home_scorer: {
    in: string;
    out: string;
  } | [];
  score: string;
  away_scorer: {
    in: string;
    out: string;
  } | [];
}

export interface FootballCard {
  time: string;
  home_fault: string;
  card: string;
  away_fault: string;
}

export interface FootballLineupPlayer {
  player: string;
  player_number: string;
  player_position: string;
  player_country: string | null;
  player_key?: string;
  player_image?: string;
}

export interface FootballCoach {
  coache: string;
  coache_country: string | null;
  coache_age?: string;
  coache_image?: string;
  team_name?: string;
  trophies?: number;
}

export interface FootballOfficial {
  name: string;
  country: string;
  matches: number;
  yellowCards?: number;
  redCards?: number;
  image?: string;
}

export interface FootballTeamLineup {
  starting_lineups: FootballLineupPlayer[];
  substitutes: FootballLineupPlayer[];
  coaches: FootballCoach[];
  missing_players: any[];
}

export interface FootballLineups {
  home_team: FootballTeamLineup;
  away_team: FootballTeamLineup;
}

export interface FootballStatistic {
  type: string;
  home: string;
  away: string;
}

export interface FootballEvent {
  event_key: string;
  event_date: string;
  event_time: string;
  event_home_team: string;
  home_team_key: string;
  event_away_team: string;
  away_team_key: string;
  event_halftime_result: string;
  event_final_result: string;
  event_ft_result: string;
  event_penalty_result: string;
  event_status: string;
  country_name: string;
  league_name: string;
  league_key: string;
  league_round: string;
  league_season: string;
  event_live: string;
  event_stadium?: string;
  event_referee?: string;
  home_team_logo?: string;
  away_team_logo?: string;
  event_country_key?: string;
  league_logo?: string;
  country_logo?: string;
  event_home_formation?: string;
  event_away_formation?: string;
  fk_stage_key?: string;
  stage_name?: string;
  league_group?: string;
  goalscorers?: FootballGoalScorer[];
  substitutes?: FootballSubstitute[];
  cards?: FootballCard[];
  lineups?: FootballLineups;
  statistics?: FootballStatistic[];
}

export interface FootballStanding {
  standing_place: string;
  standing_place_type: string | null;
  standing_team: string;
  standing_P: string;
  standing_W: string;
  standing_D: string;
  standing_L: string;
  standing_F: string;
  standing_A: string;
  standing_GD: string;
  standing_PTS: string;
  team_key: string;
  league_key: string;
  league_season: string;
  league_round: string;
  standing_updated?: string;
  fk_stage_key?: string;
  stage_name?: string;
}

export interface FootballTopscorer {
  player_place: string;
  player_name: string;
  player_key: number;
  team_name: string;
  team_key: string;
  goals: string;
  assists: string | null;
  penalty_goals: string;
}

export interface FootballVideo {
  event_key: string;
  video_title_full: string;
  video_title: string;
  video_url: string;
}

export interface FootballOdds {
  match_id: string;
  odd_bookmakers: string;
  odd_1: string | null;
  odd_x: string | null;
  odd_2: string | null;
  odd_1x: string | null;
  odd_12: string | null;
  odd_x2: string | null;
  'ah-4.5_1': string | null;
  'ah-4.5_2': string | null;
  'ah-4_1': string | null;
  'ah-4_2': string | null;
  'ah-3.5_1': string | null;
  'ah-3.5_2': string | null;
  'ah-3_1': string | null;
  'ah-3_2': string | null;
  'ah-2.5_1': string | null;
  'ah-2.5_2': string | null;
  'ah-2_1': string | null;
  'ah-2_2': string | null;
  'ah-1.5_1': string | null;
  'ah-1.5_2': string | null;
  'ah-1_1': string | null;
  'ah-1_2': string | null;
  'ah0_1': string | null;
  'ah0_2': string | null;
  'ah+0.5_1': string | null;
  'ah+1_1': string | null;
  'ah+1_2': string | null;
  'ah+1.5_1': string | null;
  'ah+1.5_2': string | null;
  'ah+2_1': string | null;
  'ah+2_2': string | null;
  'ah+2.5_1': string | null;
  'ah+2.5_2': string | null;
  'ah+3_1': string | null;
  'ah+3_2': string | null;
  'ah+3.5_1': string | null;
  'ah+3.5_2': string | null;
  'ah+4_1': string | null;
  'ah+4_2': string | null;
  'ah+4.5_1': string | null;
  'ah+4.5_2': string | null;
  'o+0.5': string | null;
  'u+0.5': string | null;
  'o+1': string | null;
  'u+1': string | null;
  'o+1.5': string | null;
  'u+1.5': string | null;
  'o+2': string | null;
  'u+2': string | null;
  'o+2.5': string | null;
  'u+2.5': string | null;
  'o+3': string | null;
  'u+3': string | null;
  'o+3.5': string | null;
  'u+3.5': string | null;
  'o+4': string | null;
  'u+4': string | null;
  'o+4.5': string | null;
  'u+4.5': string | null;
  'o+5': string | null;
  'u+5': string | null;
  'o+5.5': string | null;
  'u+5.5': string | null;
  bts_yes: string | null;
  bts_no: string | null;
}

export interface FootballProbability {
  event_key: string;
  country_key: string;
  country_name: string;
  league_key: string;
  league_name: string;
  event_date: string;
  event_time: string;
  event_status: string;
  home_team_key: string;
  event_home_team: string;
  event_away_team: string;
  away_team_key: string;
  event_halftime_result: string;
  event_final_result: string;
  event_ft_result: string;
  event_penalty_result: string;
  event_home_formation: string;
  event_away_formation: string;
  event_live: string;
  event_HW: string;
  event_D: string;
  event_AW: string;
  event_HW_D: string;
  event_AW_D: string;
  event_HW_AW: string;
  event_O: string;
  event_U: string;
  event_O_1: string;
  event_U_1: string;
  event_O_3: string;
  event_U_3: string;
  event_bts: string;
  event_ots: string;
  event_ah_h_45: string;
  event_ah_a_45: string;
  event_ah_h_35: string;
  event_ah_a_35: string;
  event_ah_h_25: string;
  event_ah_a_25: string;
  event_ah_h_15: string;
  event_ah_a_15: string;
  event_ah_h_05: string;
  event_ah_a_05: string;
  'event_ah_h_-05': string;
  'event_ah_a_-05': string;
  'event_ah_h_-15': string;
  'event_ah_a_-15': string;
  'event_ah_h_-25': string;
  'event_ah_a_-25': string;
  'event_ah_h_-35': string;
  'event_ah_a_-35': string;
  'event_ah_h_-45': string;
  'event_ah_a_-45': string;
}

export interface FootballLiveOdd {
  odd_name: string;
  is_odd_suspended: 'Yes' | 'No';
  odd_type: string;
  odd_value: string;
  odd_participant_handicap: string | null;
  odd_last_updated: string;
  match_id: string;
}

export interface FootballComment {
  comments_time: string;
  comments_text: string;
  comments_state_info: string | null;
  match_id: string;
}

export interface FootballBookmaker {
  [bookmakerName: string]: string;
}

export interface FootballFullOddsMarket {
  [outcome: string]: FootballBookmaker;
}

export interface FootballFullMatchOdds {
  [marketName: string]: FootballFullOddsMarket;
}

// API Response Types
export interface FootballApiResponse<T> {
  success: 0 | 1;
  result: T;
}

export interface FootballCountriesResponse {
  success: 1;
  result: FootballCountry[];
}

export interface FootballLeaguesResponse {
  success: 1;
  result: FootballLeague[];
}

export interface FootballFixturesResponse {
  success: 1;
  result: FootballEvent[];
}

export interface FootballH2HResponse {
  success: 1;
  result: {
    H2H: FootballEvent[];
    firstTeamResults: FootballEvent[];
    secondTeamResults: FootballEvent[];
  };
}

export interface FootballLivescoreResponse {
  success: 1;
  result: FootballEvent[];
}

export interface FootballStandingsResponse {
  success: 1;
  result: {
    total: FootballStanding[];
    home: FootballStanding[];
    away: FootballStanding[];
  };
}

export interface FootballTopscorersResponse {
  success: 1;
  result: FootballTopscorer[];
}

export interface FootballTeamsResponse {
  success: 1;
  result: FootballTeam[];
}

export interface FootballPlayersResponse {
  success: 1;
  result: FootballPlayer[];
}

export interface FootballVideosResponse {
  success: 1;
  result: FootballVideo[];
}

export interface FootballOddsResponse {
  success: 1;
  result: {
    [matchId: string]: FootballOdds[];
  };
}

export interface FootballProbabilitiesResponse {
  success: 1;
  result: FootballProbability[];
}

export interface FootballLiveOddsResponse {
  success: 1;
  result: {
    [matchId: string]: FootballLiveOdd[];
  };
}

export interface FootballCommentsResponse {
  success: 1;
  result: {
    [matchId: string]: FootballComment[];
  };
}

export interface FootballFullOddsResponse {
  success: 1;
  result: {
    [matchId: string]: FootballFullMatchOdds;
  };
}

// API Request Parameter Types
export interface FootballBaseParams {
  met: string;
  APIkey: string;
}

export interface FootballCountriesParams extends FootballBaseParams {
  met: 'Countries';
}

export interface FootballLeaguesParams extends FootballBaseParams {
  met: 'Leagues';
  countryId?: number;
}

export interface FootballFixturesParams extends FootballBaseParams {
  met: 'Fixtures';
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
  timezone?: string;
  countryId?: number;
  leagueId?: number;
  matchId?: number;
  teamId?: number;
  leagueGroup?: string;
  withPlayerStats?: string | number;
}

export interface FootballH2HParams extends FootballBaseParams {
  met: 'H2H';
  firstTeamId: number;
  secondTeamId: number;
  timezone?: string;
}

export interface FootballLivescoreParams extends FootballBaseParams {
  met: 'Livescore';
  timezone?: string;
  countryId?: number;
  leagueId?: number;
  matchId?: number;
  withPlayerStats?: string | number;
}

export interface FootballStandingsParams extends FootballBaseParams {
  met: 'Standings';
  leagueId: number;
}

export interface FootballTopscorersParams extends FootballBaseParams {
  met: 'Topscorers';
  leagueId: number;
}

export interface FootballTeamsParams extends FootballBaseParams {
  met: 'Teams';
  leagueId?: number;
  teamId?: number;
  teamName?: string;
}

export interface FootballPlayersParams extends FootballBaseParams {
  met: 'Players';
  playerId?: number;
  playerName?: string;
  leagueId?: number;
  teamId?: number;
}

export interface FootballVideosParams extends FootballBaseParams {
  met: 'Videos';
  eventId: number;
}

export interface FootballOddsParams extends FootballBaseParams {
  met: 'Odds';
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  countryId?: number;
  leagueId?: number;
  matchId?: number;
}

export interface FootballProbabilitiesParams extends FootballBaseParams {
  met: 'Probabilities';
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  countryId?: number;
  leagueId?: number;
  matchId?: number;
}

export interface FootballLiveOddsParams extends FootballBaseParams {
  met: 'OddsLive';
  countryId?: number;
  leagueId?: number;
  matchId?: number;
  timezone?: string;
}

export interface FootballCommentsParams extends FootballBaseParams {
  met: 'Comments';
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  live?: string | number;
  countryId?: number;
  leagueId?: number;
  matchId?: number;
  timezone?: string;
}

export interface FootballFullOddsParams extends FootballBaseParams {
  met: 'FullOdds';
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  countryId?: number;
  leagueId?: number;
  matchId?: number;
}

// API Client Interface
export interface FootballAPIClient {
  /**
   * Get list of supported countries
   */
  getCountries(params: Omit<FootballCountriesParams, 'met'>): Promise<FootballCountriesResponse>;

  /**
   * Get list of supported leagues/competitions
   */
  getLeagues(params: Omit<FootballLeaguesParams, 'met'>): Promise<FootballLeaguesResponse>;

  /**
   * Get football fixtures/events
   */
  getFixtures(params: Omit<FootballFixturesParams, 'met'>): Promise<FootballFixturesResponse>;

  /**
   * Get head to head results between two teams
   */
  getH2H(params: Omit<FootballH2HParams, 'met'>): Promise<FootballH2HResponse>;

  /**
   * Get live football matches
   */
  getLivescore(params: Omit<FootballLivescoreParams, 'met'>): Promise<FootballLivescoreResponse>;

  /**
   * Get league standings (total, home, away)
   */
  getStandings(params: Omit<FootballStandingsParams, 'met'>): Promise<FootballStandingsResponse>;

  /**
   * Get top scorers for a league
   */
  getTopscorers(params: Omit<FootballTopscorersParams, 'met'>): Promise<FootballTopscorersResponse>;

  /**
   * Get teams information with players
   */
  getTeams(params: Omit<FootballTeamsParams, 'met'>): Promise<FootballTeamsResponse>;

  /**
   * Get player information and statistics
   */
  getPlayers(params: Omit<FootballPlayersParams, 'met'>): Promise<FootballPlayersResponse>;

  /**
   * Get video highlights for events
   */
  getVideos(params: Omit<FootballVideosParams, 'met'>): Promise<FootballVideosResponse>;

  /**
   * Get pre-match odds for events
   */
  getOdds(params: Omit<FootballOddsParams, 'met'>): Promise<FootballOddsResponse>;

  /**
   * Get match probabilities
   */
  getProbabilities(params: Omit<FootballProbabilitiesParams, 'met'>): Promise<FootballProbabilitiesResponse>;

  /**
   * Get live odds for ongoing events
   */
  getLiveOdds(params: Omit<FootballLiveOddsParams, 'met'>): Promise<FootballLiveOddsResponse>;

  /**
   * Get live match comments/commentary
   */
  getComments(params: Omit<FootballCommentsParams, 'met'>): Promise<FootballCommentsResponse>;

  /**
   * Get full odds list with all bookmakers and markets
   */
  getFullOdds(params: Omit<FootballFullOddsParams, 'met'>): Promise<FootballFullOddsResponse>;
}

// Utility Types
export type FootballEventStatus = 
  | 'Finished' 
  | 'Live'
  | 'Not Started'
  | 'Postponed'
  | 'Cancelled'
  | 'Abandoned'
  | string; // Can be minute number like "45", "73"

export type FootballCardType = 
  | 'yellow card'
  | 'red card'
  | 'yellow red card';

export type FootballPlayerType = 
  | 'Goalkeepers'
  | 'Defenders'
  | 'Midfielders'
  | 'Forwards';

export type FootballStatisticType =
  | 'Shots Total'
  | 'Shots On Goal'
  | 'Shots Off Goal'
  | 'Shots Blocked'
  | 'Shots Inside Box'
  | 'Shots Outside Box'
  | 'Fouls'
  | 'Corners'
  | 'Offsides'
  | 'Ball Possession'
  | 'Yellow Cards'
  | 'Red Cards'
  | 'Saves'
  | 'Passes Total'
  | 'Passes Accurate'
  | string;

// Extended Types for Detailed Match Data
export interface FootballDetailedEvent extends FootballEvent {
  goalscorers: FootballGoalScorer[];
  substitutes: FootballSubstitute[];
  cards: FootballCard[];
  lineups: FootballLineups;
  statistics: FootballStatistic[];
  lineups?: FootballLineups;
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
  player_number?: string;
  player_position?: string;
}

export interface BasketballPlayer {
  player_key: string;
  player_name: string;
  player_number?: string;
  player_type?: string; // Guard, Forward, Center
  player_age?: string;
  player_match_played?: string;
  player_goals?: string;
  player_yellow_cards?: string;
  player_red_cards?: string;
  player_image?: string | null;
  team_key?: string;
  team_name?: string;
  player_rating?: string;
  player_assists?: string;
  player_rebounds?: string;
  player_blocks?: string;
  player_steals?: string;
  player_points_per_game?: string;
  player_rebounds_per_game?: string;
  player_assists_per_game?: string;
  player_field_goal_percentage?: string;
  player_three_point_percentage?: string;
  player_free_throw_percentage?: string;
}

export interface BasketballPlayerDetailed extends BasketballPlayer {
  player_height?: string;
  player_weight?: string;
  player_birthdate?: string;
  player_birthplace?: string;
  player_nationality?: string;
  player_college?: string;
  player_draft_year?: string;
  player_draft_round?: string;
  player_draft_pick?: string;
  career_stats?: {
    games_played: string;
    points: string;
    rebounds: string;
    assists: string;
    steals: string;
    blocks: string;
    field_goal_pct: string;
    three_point_pct: string;
    free_throw_pct: string;
  };
  season_stats?: {
    season: string;
    team: string;
    games: string;
    points_per_game: string;
    rebounds_per_game: string;
    assists_per_game: string;
  }[];
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

export interface BasketballPlayersResponse {
  success: 1;
  result: BasketballPlayer[];
}

export interface BasketballLineupsResponse {
  success: 1;
  result: BasketballLineups;
}

export interface BasketballStatisticsResponse {
  success: 1;
  result: {
    statistics: BasketballStatistic[];
    player_statistics: BasketballPlayerStatistics;
  };
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

export interface BasketballPlayersParams extends BasketballBaseParams {
  met: 'Players';
  playerId?: number;
  teamId?: number;
}

export interface BasketballLineupsParams extends BasketballBaseParams {
  met: 'Lineups';
  matchId: number;
}

export interface BasketballStatisticsParams extends BasketballBaseParams {
  met: 'Statistics';
  matchId: number;
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
   * Get players information
   */
  getPlayers(params: Omit<BasketballPlayersParams, 'met'>): Promise<BasketballPlayersResponse>;

  /**
   * Get match lineups
   */
  getLineups(params: Omit<BasketballLineupsParams, 'met'>): Promise<BasketballLineupsResponse>;

  /**
   * Get match statistics
   */
  getStatistics(params: Omit<BasketballStatisticsParams, 'met'>): Promise<BasketballStatisticsResponse>;

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


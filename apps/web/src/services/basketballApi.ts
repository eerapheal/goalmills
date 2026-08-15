import {
  BasketballAPIClient,
  BasketballCountriesParams,
  BasketballCountriesResponse,
  BasketballLeaguesParams,
  BasketballLeaguesResponse,
  BasketballFixturesParams,
  BasketballFixturesResponse,
  BasketballH2HParams,
  BasketballH2HResponse,
  BasketballLivescoreParams,
  BasketballLivescoreResponse,
  BasketballStandingsParams,
  BasketballStandingsResponse,
  BasketballTeamsParams,
  BasketballTeamsResponse,
  BasketballPlayersParams,
  BasketballPlayersResponse,
  BasketballLineupsParams,
  BasketballLineupsResponse,
  BasketballStatisticsParams,
  BasketballStatisticsResponse,
  BasketballOddsParams,
  BasketballOddsResponse,
  BasketballLeague,
  BasketballTeam,
  BasketballEvent,
  BasketballStanding,
  BasketballPlayer,
} from '@goalmills/types';

// Mock Data
const mockLeagues: BasketballLeague[] = [
  { league_key: '1', league_name: 'NBA', country_key: '1', country_name: 'USA' },
  { league_key: '2', league_name: 'EuroLeague', country_key: '2', country_name: 'Europe' },
  { league_key: '3', league_name: 'ACB', country_key: '3', country_name: 'Spain' },
  { league_key: '4', league_name: 'CBA', country_key: '4', country_name: 'China' },
  { league_key: '5', league_name: 'NBL', country_key: '5', country_name: 'Australia' },
];

const mockTeams: BasketballTeam[] = [
  { team_key: '1', team_name: 'Los Angeles Lakers', team_logo: 'https://randomuser.me/api/portraits/men/20.jpg' },
  { team_key: '2', team_name: 'Boston Celtics', team_logo: 'https://randomuser.me/api/portraits/men/21.jpg' },
  { team_key: '3', team_name: 'Golden State Warriors', team_logo: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { team_key: '4', team_name: 'Miami Heat', team_logo: 'https://randomuser.me/api/portraits/men/23.jpg' },
  { team_key: '5', team_name: 'Milwaukee Bucks', team_logo: 'https://randomuser.me/api/portraits/men/24.jpg' },
  { team_key: '6', team_name: 'Phoenix Suns', team_logo: 'https://randomuser.me/api/portraits/men/25.jpg' },
  { team_key: '7', team_name: 'Denver Nuggets', team_logo: 'https://randomuser.me/api/portraits/men/26.jpg' },
  { team_key: '8', team_name: 'Dallas Mavericks', team_logo: 'https://randomuser.me/api/portraits/men/27.jpg' },
];

const mockPlayers: any[] = [
  // Los Angeles Lakers
  { player_key: '1', player_name: 'LeBron James', player_number: '23', player_type: 'Forward', player_age: '39', team_key: '1', team_name: 'Los Angeles Lakers', player_image: 'https://randomuser.me/api/portraits/men/1.jpg', player_points_per_game: '25.7', player_rebounds_per_game: '7.3', player_assists_per_game: '7.3', player_field_goal_percentage: '54.0', player_three_point_percentage: '41.0', player_free_throw_percentage: '75.0' },
  { player_key: '2', player_name: 'Anthony Davis', player_number: '3', player_type: 'Forward-Center', player_age: '30', team_key: '1', team_name: 'Los Angeles Lakers', player_image: 'https://randomuser.me/api/portraits/men/2.jpg', player_points_per_game: '24.7', player_rebounds_per_game: '12.6', player_assists_per_game: '3.5', player_field_goal_percentage: '55.6', player_three_point_percentage: '27.1', player_free_throw_percentage: '81.6' },
  { player_key: '3', player_name: "D'Angelo Russell", player_number: '1', player_type: 'Guard', player_age: '28', team_key: '1', team_name: 'Los Angeles Lakers', player_image: 'https://randomuser.me/api/portraits/men/3.jpg', player_points_per_game: '18.0', player_rebounds_per_game: '3.1', player_assists_per_game: '6.3', player_field_goal_percentage: '45.6', player_three_point_percentage: '41.5', player_free_throw_percentage: '82.8' },
  
  // Boston Celtics
  { player_key: '4', player_name: 'Jayson Tatum', player_number: '0', player_type: 'Forward', player_age: '26', team_key: '2', team_name: 'Boston Celtics', player_image: 'https://randomuser.me/api/portraits/men/4.jpg', player_points_per_game: '26.9', player_rebounds_per_game: '8.1', player_assists_per_game: '4.9', player_field_goal_percentage: '47.1', player_three_point_percentage: '37.6', player_free_throw_percentage: '85.4' },
  { player_key: '5', player_name: 'Jaylen Brown', player_number: '7', player_type: 'Guard-Forward', player_age: '27', team_key: '2', team_name: 'Boston Celtics', player_image: 'https://randomuser.me/api/portraits/men/5.jpg', player_points_per_game: '23.0', player_rebounds_per_game: '5.5', player_assists_per_game: '3.6', player_field_goal_percentage: '49.9', player_three_point_percentage: '35.4', player_free_throw_percentage: '70.3' },
  { player_key: '6', player_name: 'Kristaps Porzingis', player_number: '8', player_type: 'Forward-Center', player_age: '28', team_key: '2', team_name: 'Boston Celtics', player_image: 'https://randomuser.me/api/portraits/men/6.jpg', player_points_per_game: '20.1', player_rebounds_per_game: '7.2', player_assists_per_game: '2.0', player_field_goal_percentage: '51.6', player_three_point_percentage: '37.5', player_free_throw_percentage: '85.8' },
  
  // Golden State Warriors
  { player_key: '7', player_name: 'Stephen Curry', player_number: '30', player_type: 'Guard', player_age: '36', team_key: '3', team_name: 'Golden State Warriors', player_image: 'https://randomuser.me/api/portraits/men/7.jpg', player_points_per_game: '26.4', player_rebounds_per_game: '4.5', player_assists_per_game: '5.1', player_field_goal_percentage: '45.0', player_three_point_percentage: '40.8', player_free_throw_percentage: '92.3' },
  { player_key: '8', player_name: 'Klay Thompson', player_number: '11', player_type: 'Guard', player_age: '34', team_key: '3', team_name: 'Golden State Warriors', player_image: 'https://randomuser.me/api/portraits/men/8.jpg', player_points_per_game: '17.9', player_rebounds_per_game: '3.3', player_assists_per_game: '2.3', player_field_goal_percentage: '43.2', player_three_point_percentage: '38.7', player_free_throw_percentage: '92.7' },
  { player_key: '9', player_name: 'Draymond Green', player_number: '23', player_type: 'Forward', player_age: '34', team_key: '3', team_name: 'Golden State Warriors', player_image: 'https://randomuser.me/api/portraits/men/9.jpg', player_points_per_game: '8.6', player_rebounds_per_game: '7.2', player_assists_per_game: '6.0', player_field_goal_percentage: '49.7', player_three_point_percentage: '39.5', player_free_throw_percentage: '71.3' },
  
  // Miami Heat
  { player_key: '10', player_name: 'Jimmy Butler', player_number: '22', player_type: 'Forward', player_age: '34', team_key: '4', team_name: 'Miami Heat', player_image: 'https://randomuser.me/api/portraits/men/10.jpg', player_points_per_game: '20.8', player_rebounds_per_game: '5.3', player_assists_per_game: '5.0', player_field_goal_percentage: '49.9', player_three_point_percentage: '35.0', player_free_throw_percentage: '85.8' },
  { player_key: '11', player_name: 'Bam Adebayo', player_number: '13', player_type: 'Center', player_age: '26', team_key: '4', team_name: 'Miami Heat', player_image: 'https://randomuser.me/api/portraits/men/11.jpg', player_points_per_game: '19.3', player_rebounds_per_game: '10.4', player_assists_per_game: '3.9', player_field_goal_percentage: '55.1', player_three_point_percentage: '0.0', player_free_throw_percentage: '75.8' },
  
  // Milwaukee Bucks
  { player_key: '12', player_name: 'Giannis Antetokounmpo', player_number: '34', player_type: 'Forward', player_age: '29', team_key: '5', team_name: 'Milwaukee Bucks', player_image: 'https://randomuser.me/api/portraits/men/12.jpg', player_points_per_game: '30.4', player_rebounds_per_game: '11.5', player_assists_per_game: '6.5', player_field_goal_percentage: '61.1', player_three_point_percentage: '27.5', player_free_throw_percentage: '65.7' },
  { player_key: '13', player_name: 'Damian Lillard', player_number: '0', player_type: 'Guard', player_age: '33', team_key: '5', team_name: 'Milwaukee Bucks', player_image: 'https://randomuser.me/api/portraits/men/13.jpg', player_points_per_game: '24.3', player_rebounds_per_game: '4.4', player_assists_per_game: '7.0', player_field_goal_percentage: '42.4', player_three_point_percentage: '35.4', player_free_throw_percentage: '92.0' },
  
  // Phoenix Suns
  { player_key: '14', player_name: 'Kevin Durant', player_number: '35', player_type: 'Forward', player_age: '35', team_key: '6', team_name: 'Phoenix Suns', player_image: 'https://randomuser.me/api/portraits/men/14.jpg', player_points_per_game: '27.1', player_rebounds_per_game: '6.6', player_assists_per_game: '5.0', player_field_goal_percentage: '52.3', player_three_point_percentage: '41.3', player_free_throw_percentage: '85.8' },
  { player_key: '15', player_name: 'Devin Booker', player_number: '1', player_type: 'Guard', player_age: '27', team_key: '6', team_name: 'Phoenix Suns', player_image: 'https://randomuser.me/api/portraits/men/15.jpg', player_points_per_game: '27.1', player_rebounds_per_game: '4.5', player_assists_per_game: '6.9', player_field_goal_percentage: '49.2', player_three_point_percentage: '36.4', player_free_throw_percentage: '88.6' },
  
  // Denver Nuggets
  { player_key: '16', player_name: 'Nikola Jokic', player_number: '15', player_type: 'Center', player_age: '29', team_key: '7', team_name: 'Denver Nuggets', player_image: 'https://randomuser.me/api/portraits/men/16.jpg', player_points_per_game: '26.4', player_rebounds_per_game: '12.4', player_assists_per_game: '9.0', player_field_goal_percentage: '63.2', player_three_point_percentage: '35.9', player_free_throw_percentage: '81.7' },
  { player_key: '17', player_name: 'Jamal Murray', player_number: '27', player_type: 'Guard', player_age: '27', team_key: '7', team_name: 'Denver Nuggets', player_image: 'https://randomuser.me/api/portraits/men/17.jpg', player_points_per_game: '21.2', player_rebounds_per_game: '4.1', player_assists_per_game: '6.5', player_field_goal_percentage: '45.6', player_three_point_percentage: '40.1', player_free_throw_percentage: '83.6' },
  
  // Dallas Mavericks
  { player_key: '18', player_name: 'Luka Doncic', player_number: '77', player_type: 'Guard-Forward', player_age: '25', team_key: '8', team_name: 'Dallas Mavericks', player_image: 'https://randomuser.me/api/portraits/men/18.jpg', player_points_per_game: '33.9', player_rebounds_per_game: '9.2', player_assists_per_game: '9.8', player_field_goal_percentage: '48.7', player_three_point_percentage: '38.2', player_free_throw_percentage: '78.6' },
  { player_key: '19', player_name: 'Kyrie Irving', player_number: '11', player_type: 'Guard', player_age: '32', team_key: '8', team_name: 'Dallas Mavericks', player_image: 'https://randomuser.me/api/portraits/men/19.jpg', player_points_per_game: '25.6', player_rebounds_per_game: '5.0', player_assists_per_game: '5.2', player_field_goal_percentage: '49.7', player_three_point_percentage: '41.1', player_free_throw_percentage: '90.5' },
];

const getDateString = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const mockEvents: BasketballEvent[] = [
  // Past results
  {
    event_key: '101',
    event_date: getDateString(-7),
    event_time: '19:30',
    event_home_team: 'Los Angeles Lakers',
    home_team_key: '1',
    event_away_team: 'Boston Celtics',
    away_team_key: '2',
    event_final_result: '112 - 108',
    event_status: 'Finished',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/20.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/21.jpg',
    scores: {
      '1stQuarter': [{ score_home: '28', score_away: '25' }],
      '2ndQuarter': [{ score_home: '26', score_away: '30' }],
      '3rdQuarter': [{ score_home: '30', score_away: '28' }],
      '4thQuarter': [{ score_home: '28', score_away: '25' }],
    }
  },
  // Live matches
  {
    event_key: '201',
    event_date: getDateString(0),
    event_time: '20:00',
    event_home_team: 'Dallas Mavericks',
    home_team_key: '8',
    event_away_team: 'Denver Nuggets',
    away_team_key: '7',
    event_final_result: '78 - 82',
    event_quarter: '3rd Quarter',
    event_status: '3rd Quarter',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '1',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/27.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/26.jpg',
    scores: {
      '1stQuarter': [{ score_home: '26', score_away: '28' }],
      '2ndQuarter': [{ score_home: '28', score_away: '30' }],
      '3rdQuarter': [{ score_home: '24', score_away: '24' }],
    }
  },
  // Upcoming matches
  {
    event_key: '301',
    event_date: getDateString(1),
    event_time: '19:00',
    event_home_team: 'Boston Celtics',
    home_team_key: '2',
    event_away_team: 'Milwaukee Bucks',
    away_team_key: '5',
    event_final_result: '- - -',
    event_status: 'Not Started',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/21.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/24.jpg',
  },
];

const mockStandings: BasketballStanding[] = [
  { standing_place: '1', standing_place_type: 'Promotion', standing_team: 'Boston Celtics', standing_P: '20', standing_W: '15', standing_WO: '0', standing_L: '5', standing_LO: '0', standing_F: '2280', standing_A: '2150', standing_PCT: '.750', team_key: '2', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '2', standing_place_type: 'Promotion', standing_team: 'Milwaukee Bucks', standing_P: '20', standing_W: '14', standing_WO: '0', standing_L: '6', standing_LO: '0', standing_F: '2260', standing_A: '2180', standing_PCT: '.700', team_key: '5', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '3', standing_place_type: '', standing_team: 'Denver Nuggets', standing_P: '20', standing_W: '13', standing_WO: '0', standing_L: '7', standing_LO: '0', standing_F: '2240', standing_A: '2200', standing_PCT: '.650', team_key: '7', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '4', standing_place_type: '', standing_team: 'Los Angeles Lakers', standing_P: '20', standing_W: '12', standing_WO: '0', standing_L: '8', standing_LO: '0', standing_F: '2220', standing_A: '2210', standing_PCT: '.600', team_key: '1', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '5', standing_place_type: '', standing_team: 'Golden State Warriors', standing_P: '20', standing_W: '11', standing_WO: '0', standing_L: '9', standing_LO: '0', standing_F: '2200', standing_A: '2220', standing_PCT: '.550', team_key: '3', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '6', standing_place_type: '', standing_team: 'Phoenix Suns', standing_P: '20', standing_W: '10', standing_WO: '0', standing_L: '10', standing_LO: '0', standing_F: '2180', standing_A: '2230', standing_PCT: '.500', team_key: '6', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '7', standing_place_type: '', standing_team: 'Miami Heat', standing_P: '20', standing_W: '9', standing_WO: '0', standing_L: '11', standing_LO: '0', standing_F: '2160', standing_A: '2250', standing_PCT: '.450', team_key: '4', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '8', standing_place_type: '', standing_team: 'Dallas Mavericks', standing_P: '20', standing_W: '8', standing_WO: '0', standing_L: '12', standing_LO: '0', standing_F: '2140', standing_A: '2270', standing_PCT: '.400', team_key: '8', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
];

const mockOdds: { [matchId: string]: any } = {
  '101': {
    'Home/Away': {
      'Home': { 'Bet365': '1.85', 'Bwin': '1.83', '1xBet': '1.87' },
      'Away': { 'Bet365': '1.95', 'Bwin': '1.97', '1xBet': '1.93' }
    },
    'Total': {
      'Over 220.5': { 'Bet365': '1.90', 'Bwin': '1.88', '1xBet': '1.92' },
      'Under 220.5': { 'Bet365': '1.90', 'Bwin': '1.92', '1xBet': '1.88' }
    }
  },
  '201': {
    'Home/Away': {
      'Home': { 'Bet365': '2.20', 'Bwin': '2.25', '1xBet': '2.18' },
      'Away': { 'Bet365': '1.65', 'Bwin': '1.62', '1xBet': '1.68' }
    }
  },
  '301': {
    'Home/Away': {
      'Home': { 'Bet365': '1.80', 'Bwin': '1.78', '1xBet': '1.82' },
      'Away': { 'Bet365': '2.00', 'Bwin': '2.05', '1xBet': '1.98' }
    },
    'Total': {
      'Over 225.5': { 'Bet365': '1.90', 'Bwin': '1.88', '1xBet': '1.92' },
      'Under 225.5': { 'Bet365': '1.90', 'Bwin': '1.92', '1xBet': '1.88' }
    },
    'Handicap': {
      'Home -5.5': { 'Bet365': '1.90', 'Bwin': '1.88', '1xBet': '1.92' },
      'Away +5.5': { 'Bet365': '1.90', 'Bwin': '1.92', '1xBet': '1.88' }
    }
  }
};

// Mock statistics data
const mockStatistics: { [matchId: string]: any } = {
  '101': {
    statistics: [
      { type: 'Field Goals Made', home: '42', away: '38' },
      { type: 'Field Goals Attempted', home: '88', away: '85' },
      { type: 'Field Goal %', home: '47.7%', away: '44.7%' },
      { type: 'Three Point Made', home: '12', away: '15' },
      { type: 'Three Point Attempted', home: '32', away: '38' },
      { type: 'Three Point %', home: '37.5%', away: '39.5%' },
      { type: 'Free Throws Made', home: '16', away: '19' },
      { type: 'Free Throws Attempted', home: '20', away: '24' },
      { type: 'Free Throw %', home: '80.0%', away: '79.2%' },
      { type: 'Total Rebounds', home: '45', away: '42' },
      { type: 'Offensive Rebounds', home: '10', away: '8' },
      { type: 'Defensive Rebounds', home: '35', away: '34' },
      { type: 'Total Assists', home: '24', away: '22' },
      { type: 'Total Steals', home: '8', away: '7' },
      { type: 'Total Blocks', home: '5', away: '6' },
      { type: 'Total Turnovers', home: '12', away: '14' },
      { type: 'Personal Fouls', home: '18', away: '16' },
    ],
    player_statistics: {
      home_team: [
        { player: 'LeBron James', player_id: '1', player_minutes: '36', player_points: '28', player_field_goals_made: '10', player_field_goals_attempts: '18', player_threepoint_goals_made: '3', player_threepoint_goals_attempts: '7', player_freethrows_goals_made: '5', player_freethrows_goals_attempts: '6', player_total_rebounds: '8', player_offence_rebounds: '2', player_defense_rebounds: '6', player_assists: '7', player_steals: '2', player_blocks: '1', player_turnovers: '3', player_personal_fouls: '2', player_plus_minus: '+8', player_oncourt: 'True' as 'True' | 'False', player_position: 'F' },
        { player: 'Anthony Davis', player_id: '2', player_minutes: '35', player_points: '26', player_field_goals_made: '11', player_field_goals_attempts: '19', player_threepoint_goals_made: '0', player_threepoint_goals_attempts: '2', player_freethrows_goals_made: '4', player_freethrows_goals_attempts: '5', player_total_rebounds: '14', player_offence_rebounds: '4', player_defense_rebounds: '10', player_assists: '3', player_steals: '1', player_blocks: '3', player_turnovers: '2', player_personal_fouls: '3', player_plus_minus: '+6', player_oncourt: 'True' as 'True' | 'False', player_position: 'C' },
        { player: "D'Angelo Russell", player_id: '3', player_minutes: '32', player_points: '22', player_field_goals_made: '8', player_field_goals_attempts: '15', player_threepoint_goals_made: '4', player_threepoint_goals_attempts: '9', player_freethrows_goals_made: '2', player_freethrows_goals_attempts: '2', player_total_rebounds: '4', player_offence_rebounds: '1', player_defense_rebounds: '3', player_assists: '6', player_steals: '2', player_blocks: '0', player_turnovers: '2', player_personal_fouls: '1', player_plus_minus: '+4', player_oncourt: 'True' as 'True' | 'False', player_position: 'G' },
      ],
      away_team: [
        { player: 'Jayson Tatum', player_id: '4', player_minutes: '38', player_points: '32', player_field_goals_made: '12', player_field_goals_attempts: '22', player_threepoint_goals_made: '5', player_threepoint_goals_attempts: '11', player_freethrows_goals_made: '3', player_freethrows_goals_attempts: '4', player_total_rebounds: '9', player_offence_rebounds: '2', player_defense_rebounds: '7', player_assists: '5', player_steals: '2', player_blocks: '1', player_turnovers: '4', player_personal_fouls: '2', player_plus_minus: '-4', player_oncourt: 'True' as 'True' | 'False', player_position: 'F' },
        { player: 'Jaylen Brown', player_id: '5', player_minutes: '36', player_points: '24', player_field_goals_made: '9', player_field_goals_attempts: '17', player_threepoint_goals_made: '3', player_threepoint_goals_attempts: '8', player_freethrows_goals_made: '3', player_freethrows_goals_attempts: '5', player_total_rebounds: '6', player_offence_rebounds: '1', player_defense_rebounds: '5', player_assists: '4', player_steals: '1', player_blocks: '0', player_turnovers: '3', player_personal_fouls: '3', player_plus_minus: '-2', player_oncourt: 'True' as 'True' | 'False', player_position: 'G' },
        { player: 'Kristaps Porzingis', player_id: '6', player_minutes: '28', player_points: '18', player_field_goals_made: '7', player_field_goals_attempts: '13', player_threepoint_goals_made: '2', player_threepoint_goals_attempts: '5', player_freethrows_goals_made: '2', player_freethrows_goals_attempts: '3', player_total_rebounds: '8', player_offence_rebounds: '2', player_defense_rebounds: '6', player_assists: '1', player_steals: '0', player_blocks: '2', player_turnovers: '1', player_personal_fouls: '4', player_plus_minus: '-6', player_oncourt: 'True' as 'True' | 'False', player_position: 'C' },
      ]
    }
  },
  '201': {
    statistics: [
      { type: 'Field Goals Made', home: '28', away: '30' },
      { type: 'Field Goals Attempted', home: '62', away: '64' },
      { type: 'Field Goal %', home: '45.2%', away: '46.9%' },
      { type: 'Three Point Made', home: '8', away: '10' },
      { type: 'Three Point Attempted', home: '24', away: '26' },
      { type: 'Three Point %', home: '33.3%', away: '38.5%' },
      { type: 'Free Throws Made', home: '14', away: '12' },
      { type: 'Free Throws Attempted', home: '18', away: '16' },
      { type: 'Free Throw %', home: '77.8%', away: '75.0%' },
      { type: 'Total Rebounds', home: '32', away: '35' },
      { type: 'Total Assists', home: '18', away: '22' },
      { type: 'Total Steals', home: '5', away: '6' },
      { type: 'Total Blocks', home: '3', away: '4' },
      { type: 'Total Turnovers', home: '10', away: '8' },
    ],
    player_statistics: {
      home_team: [
        { player: 'Luka Doncic', player_id: '18', player_minutes: '28', player_points: '24', player_field_goals_made: '9', player_field_goals_attempts: '18', player_threepoint_goals_made: '3', player_threepoint_goals_attempts: '8', player_freethrows_goals_made: '3', player_freethrows_goals_attempts: '4', player_total_rebounds: '7', player_offence_rebounds: '1', player_defense_rebounds: '6', player_assists: '8', player_steals: '2', player_blocks: '0', player_turnovers: '3', player_personal_fouls: '2', player_plus_minus: '-2', player_oncourt: 'True' as 'True' | 'False', player_position: 'G' },
        { player: 'Kyrie Irving', player_id: '19', player_minutes: '26', player_points: '20', player_field_goals_made: '8', player_field_goals_attempts: '14', player_threepoint_goals_made: '2', player_threepoint_goals_attempts: '5', player_freethrows_goals_made: '2', player_freethrows_goals_attempts: '2', player_total_rebounds: '4', player_offence_rebounds: '0', player_defense_rebounds: '4', player_assists: '5', player_steals: '1', player_blocks: '0', player_turnovers: '2', player_personal_fouls: '1', player_plus_minus: '-4', player_oncourt: 'True' as 'True' | 'False', player_position: 'G' },
      ],
      away_team: [
        { player: 'Nikola Jokic', player_id: '16', player_minutes: '27', player_points: '26', player_field_goals_made: '10', player_field_goals_attempts: '15', player_threepoint_goals_made: '2', player_threepoint_goals_attempts: '4', player_freethrows_goals_made: '4', player_freethrows_goals_attempts: '5', player_total_rebounds: '11', player_offence_rebounds: '3', player_defense_rebounds: '8', player_assists: '9', player_steals: '2', player_blocks: '1', player_turnovers: '2', player_personal_fouls: '1', player_plus_minus: '+6', player_oncourt: 'True' as 'True' | 'False', player_position: 'C' },
        { player: 'Jamal Murray', player_id: '17', player_minutes: '25', player_points: '18', player_field_goals_made: '7', player_field_goals_attempts: '13', player_threepoint_goals_made: '3', player_threepoint_goals_attempts: '6', player_freethrows_goals_made: '1', player_freethrows_goals_attempts: '2', player_total_rebounds: '3', player_offence_rebounds: '0', player_defense_rebounds: '3', player_assists: '6', player_steals: '1', player_blocks: '0', player_turnovers: '1', player_personal_fouls: '2', player_plus_minus: '+2', player_oncourt: 'True' as 'True' | 'False', player_position: 'G' },
      ]
    }
  }
};

// Mock lineups data
const mockLineups: { [matchId: string]: any } = {
  '101': {
    home_team: {
      starting_lineups: [
        { player: 'LeBron James', player_id: '1', player_number: '23', player_position: 'Forward' },
        { player: 'Anthony Davis', player_id: '2', player_number: '3', player_position: 'Forward-Center' },
        { player: "D'Angelo Russell", player_id: '3', player_number: '1', player_position: 'Guard' },
      ],
      substitutes: []
    },
    away_team: {
      starting_lineups: [
        { player: 'Jayson Tatum', player_id: '4', player_number: '0', player_position: 'Forward' },
        { player: 'Jaylen Brown', player_id: '5', player_number: '7', player_position: 'Guard-Forward' },
        { player: 'Kristaps Porzingis', player_id: '6', player_number: '8', player_position: 'Forward-Center' },
      ],
      substitutes: []
    }
  },
  '201': {
    home_team: {
      starting_lineups: [
        { player: 'Luka Doncic', player_id: '18', player_number: '77', player_position: 'Guard-Forward' },
        { player: 'Kyrie Irving', player_id: '19', player_number: '11', player_position: 'Guard' },
      ],
      substitutes: []
    },
    away_team: {
      starting_lineups: [
        { player: 'Nikola Jokic', player_id: '16', player_number: '15', player_position: 'Center' },
        { player: 'Jamal Murray', player_id: '17', player_number: '27', player_position: 'Guard' },
      ],
      substitutes: []
    }
  },
  '301': {
    home_team: {
      starting_lineups: [
        { player: 'Jayson Tatum', player_id: '4', player_number: '0', player_position: 'Forward' },
        { player: 'Jaylen Brown', player_id: '5', player_number: '7', player_position: 'Guard-Forward' },
        { player: 'Kristaps Porzingis', player_id: '6', player_number: '8', player_position: 'Forward-Center' },
      ],
      substitutes: []
    },
    away_team: {
      starting_lineups: [
        { player: 'Giannis Antetokounmpo', player_id: '12', player_number: '34', player_position: 'Forward' },
        { player: 'Damian Lillard', player_id: '13', player_number: '0', player_position: 'Guard' },
      ],
      substitutes: []
    }
  }
};

// API Configuration - Using Next.js API route as proxy to avoid CORS issues
const API_PROXY_URL = '/api/basketball';

// Helper function to build URL with parameters
const buildUrl = (method: string, params: Record<string, any> = {}): string => {
  const url = new URL(API_PROXY_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  url.searchParams.append('met', method);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
};

// Helper function to make API requests
async function fetchFromAPI<T>(method: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const url = buildUrl(method, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching basketball ${method}:`, error);
    throw error;
  }
}

class BasketballApi implements BasketballAPIClient {
  async getCountries(params: Omit<BasketballCountriesParams, 'met'>): Promise<BasketballCountriesResponse> {
    return fetchFromAPI<BasketballCountriesResponse>('Countries', params);
  }

  async getLeagues(params: Omit<BasketballLeaguesParams, 'met'>): Promise<BasketballLeaguesResponse> {
    return fetchFromAPI<BasketballLeaguesResponse>('Leagues', params);
  }

  async getFixtures(params: Omit<BasketballFixturesParams, 'met'>): Promise<BasketballFixturesResponse> {
    return fetchFromAPI<BasketballFixturesResponse>('Fixtures', params);
  }

  async getH2H(params: Omit<BasketballH2HParams, 'met'>): Promise<BasketballH2HResponse> {
    return fetchFromAPI<BasketballH2HResponse>('H2H', params);
  }

  async getLivescore(params: Omit<BasketballLivescoreParams, 'met'>): Promise<BasketballLivescoreResponse> {
    return fetchFromAPI<BasketballLivescoreResponse>('Livescore', params);
  }

  async getStandings(params: Omit<BasketballStandingsParams, 'met'>): Promise<BasketballStandingsResponse> {
    return fetchFromAPI<BasketballStandingsResponse>('Standings', params);
  }

  async getTeams(params: Omit<BasketballTeamsParams, 'met'>): Promise<BasketballTeamsResponse> {
    return fetchFromAPI<BasketballTeamsResponse>('Teams', params);
  }

  async getOdds(params: Omit<BasketballOddsParams, 'met'>): Promise<BasketballOddsResponse> {
    return fetchFromAPI<BasketballOddsResponse>('Odds', params);
  }

  async getPlayers(params: Omit<BasketballPlayersParams, 'met'>): Promise<BasketballPlayersResponse> {
    return fetchFromAPI<BasketballPlayersResponse>('Players', params);
  }

  async getLineups(params: Omit<BasketballLineupsParams, 'met'>): Promise<BasketballLineupsResponse> {
    return fetchFromAPI<BasketballLineupsResponse>('Lineups', params);
  }

  async getStatistics(params: Omit<BasketballStatisticsParams, 'met'>): Promise<BasketballStatisticsResponse> {
    return fetchFromAPI<BasketballStatisticsResponse>('Statistics', params);
  }
}

export const basketballApi = new BasketballApi();

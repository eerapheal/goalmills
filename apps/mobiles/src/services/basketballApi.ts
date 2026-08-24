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
  { player_key: '1', player_name: 'LeBron James', player_number: '23', player_type: 'Forward', player_age: '39', team_key: '1', team_name: 'Los Angeles Lakers', player_image: 'https://randomuser.me/api/portraits/men/1.jpg', player_points_per_game: '25.7', player_rebounds_per_game: '7.3', player_assists_per_game: '7.3', player_field_goal_percentage: '54.0', player_three_point_percentage: '41.0', player_free_throw_percentage: '75.0', player_rating: '9.2' },
  { player_key: '2', player_name: 'Anthony Davis', player_number: '3', player_type: 'Forward-Center', player_age: '30', team_key: '1', team_name: 'Los Angeles Lakers', player_image: 'https://randomuser.me/api/portraits/men/2.jpg', player_points_per_game: '24.7', player_rebounds_per_game: '12.6', player_assists_per_game: '3.5', player_field_goal_percentage: '55.6', player_three_point_percentage: '27.1', player_free_throw_percentage: '81.6', player_rating: '9.0' },
  { player_key: '3', player_name: 'D\'Angelo Russell', player_number: '1', player_type: 'Guard', player_age: '28', team_key: '1', team_name: 'Los Angeles Lakers', player_image: 'https://randomuser.me/api/portraits/men/3.jpg', player_points_per_game: '18.0', player_rebounds_per_game: '3.1', player_assists_per_game: '6.3', player_field_goal_percentage: '45.6', player_three_point_percentage: '41.5', player_free_throw_percentage: '82.8', player_rating: '8.3' },
  
  // Boston Celtics
  { player_key: '4', player_name: 'Jayson Tatum', player_number: '0', player_type: 'Forward', player_age: '26', team_key: '2', team_name: 'Boston Celtics', player_image: 'https://randomuser.me/api/portraits/men/4.jpg', player_points_per_game: '26.9', player_rebounds_per_game: '8.1', player_assists_per_game: '4.9', player_field_goal_percentage: '47.1', player_three_point_percentage: '37.6', player_free_throw_percentage: '85.4', player_rating: '9.3' },
  { player_key: '5', player_name: 'Jaylen Brown', player_number: '7', player_type: 'Guard-Forward', player_age: '27', team_key: '2', team_name: 'Boston Celtics', player_image: 'https://randomuser.me/api/portraits/men/5.jpg', player_points_per_game: '23.0', player_rebounds_per_game: '5.5', player_assists_per_game: '3.6', player_field_goal_percentage: '49.9', player_three_point_percentage: '35.4', player_free_throw_percentage: '70.3', player_rating: '8.8' },
  { player_key: '6', player_name: 'Kristaps Porzingis', player_number: '8', player_type: 'Forward-Center', player_age: '28', team_key: '2', team_name: 'Boston Celtics', player_image: 'https://randomuser.me/api/portraits/men/6.jpg', player_points_per_game: '20.1', player_rebounds_per_game: '7.2', player_assists_per_game: '2.0', player_field_goal_percentage: '51.6', player_three_point_percentage: '37.5', player_free_throw_percentage: '85.8', player_rating: '8.5' },
  
  // Golden State Warriors
  { player_key: '7', player_name: 'Stephen Curry', player_number: '30', player_type: 'Guard', player_age: '36', team_key: '3', team_name: 'Golden State Warriors', player_image: 'https://randomuser.me/api/portraits/men/7.jpg', player_points_per_game: '26.4', player_rebounds_per_game: '4.5', player_assists_per_game: '5.1', player_field_goal_percentage: '45.0', player_three_point_percentage: '40.8', player_free_throw_percentage: '92.3', player_rating: '9.4' },
  { player_key: '8', player_name: 'Klay Thompson', player_number: '11', player_type: 'Guard', player_age: '34', team_key: '3', team_name: 'Golden State Warriors', player_image: 'https://randomuser.me/api/portraits/men/8.jpg', player_points_per_game: '17.9', player_rebounds_per_game: '3.3', player_assists_per_game: '2.3', player_field_goal_percentage: '43.2', player_three_point_percentage: '38.7', player_free_throw_percentage: '92.7', player_rating: '8.1' },
  { player_key: '9', player_name: 'Draymond Green', player_number: '23', player_type: 'Forward', player_age: '34', team_key: '3', team_name: 'Golden State Warriors', player_image: 'https://randomuser.me/api/portraits/men/9.jpg', player_points_per_game: '8.6', player_rebounds_per_game: '7.2', player_assists_per_game: '6.0', player_field_goal_percentage: '49.7', player_three_point_percentage: '39.5', player_free_throw_percentage: '71.3', player_rating: '8.0' },
  
  // Miami Heat
  { player_key: '10', player_name: 'Jimmy Butler', player_number: '22', player_type: 'Forward', player_age: '34', team_key: '4', team_name: 'Miami Heat', player_image: 'https://randomuser.me/api/portraits/men/10.jpg', player_points_per_game: '20.8', player_rebounds_per_game: '5.3', player_assists_per_game: '5.0', player_field_goal_percentage: '49.9', player_three_point_percentage: '35.0', player_free_throw_percentage: '85.8', player_rating: '8.7' },
  { player_key: '11', player_name: 'Bam Adebayo', player_number: '13', player_type: 'Center', player_age: '26', team_key: '4', team_name: 'Miami Heat', player_image: 'https://randomuser.me/api/portraits/men/11.jpg', player_points_per_game: '19.3', player_rebounds_per_game: '10.4', player_assists_per_game: '3.9', player_field_goal_percentage: '55.1', player_three_point_percentage: '0.0', player_free_throw_percentage: '75.8', player_rating: '8.6' },
  
  // Milwaukee Bucks
  { player_key: '12', player_name: 'Giannis Antetokounmpo', player_number: '34', player_type: 'Forward', player_age: '29', team_key: '5', team_name: 'Milwaukee Bucks', player_image: 'https://randomuser.me/api/portraits/men/12.jpg', player_points_per_game: '30.4', player_rebounds_per_game: '11.5', player_assists_per_game: '6.5', player_field_goal_percentage: '61.1', player_three_point_percentage: '27.5', player_free_throw_percentage: '65.7', player_rating: '9.6' },
  { player_key: '13', player_name: 'Damian Lillard', player_number: '0', player_type: 'Guard', player_age: '33', team_key: '5', team_name: 'Milwaukee Bucks', player_image: 'https://randomuser.me/api/portraits/men/13.jpg', player_points_per_game: '24.3', player_rebounds_per_game: '4.4', player_assists_per_game: '7.0', player_field_goal_percentage: '42.4', player_three_point_percentage: '35.4', player_free_throw_percentage: '92.0', player_rating: '8.9' },
  
  // Phoenix Suns
  { player_key: '14', player_name: 'Kevin Durant', player_number: '35', player_type: 'Forward', player_age: '35', team_key: '6', team_name: 'Phoenix Suns', player_image: 'https://randomuser.me/api/portraits/men/14.jpg', player_points_per_game: '27.1', player_rebounds_per_game: '6.6', player_assists_per_game: '5.0', player_field_goal_percentage: '52.3', player_three_point_percentage: '41.3', player_free_throw_percentage: '85.8', player_rating: '9.1' },
  { player_key: '15', player_name: 'Devin Booker', player_number: '1', player_type: 'Guard', player_age: '27', team_key: '6', team_name: 'Phoenix Suns', player_image: 'https://randomuser.me/api/portraits/men/15.jpg', player_points_per_game: '27.1', player_rebounds_per_game: '4.5', player_assists_per_game: '6.9', player_field_goal_percentage: '49.2', player_three_point_percentage: '36.4', player_free_throw_percentage: '88.6', player_rating: '9.0' },
  
  // Denver Nuggets
  { player_key: '16', player_name: 'Nikola Jokic', player_number: '15', player_type: 'Center', player_age: '29', team_key: '7', team_name: 'Denver Nuggets', player_image: 'https://randomuser.me/api/portraits/men/16.jpg', player_points_per_game: '26.4', player_rebounds_per_game: '12.4', player_assists_per_game: '9.0', player_field_goal_percentage: '63.2', player_three_point_percentage: '35.9', player_free_throw_percentage: '81.7', player_rating: '9.7' },
  { player_key: '17', player_name: 'Jamal Murray', player_number: '27', player_type: 'Guard', player_age: '27', team_key: '7', team_name: 'Denver Nuggets', player_image: 'https://randomuser.me/api/portraits/men/17.jpg', player_points_per_game: '21.2', player_rebounds_per_game: '4.1', player_assists_per_game: '6.5', player_field_goal_percentage: '45.6', player_three_point_percentage: '40.1', player_free_throw_percentage: '83.6', player_rating: '8.5' },
  
  // Dallas Mavericks
  { player_key: '18', player_name: 'Luka Doncic', player_number: '77', player_type: 'Guard-Forward', player_age: '25', team_key: '8', team_name: 'Dallas Mavericks', player_image: 'https://randomuser.me/api/portraits/men/18.jpg', player_points_per_game: '33.9', player_rebounds_per_game: '9.2', player_assists_per_game: '9.8', player_field_goal_percentage: '48.7', player_three_point_percentage: '38.2', player_free_throw_percentage: '78.6', player_rating: '9.8' },
  { player_key: '19', player_name: 'Kyrie Irving', player_number: '11', player_type: 'Guard', player_age: '32', team_key: '8', team_name: 'Dallas Mavericks', player_image: 'https://randomuser.me/api/portraits/men/19.jpg', player_points_per_game: '25.6', player_rebounds_per_game: '5.0', player_assists_per_game: '5.2', player_field_goal_percentage: '49.7', player_three_point_percentage: '41.1', player_free_throw_percentage: '90.5', player_rating: '8.9' },
];

// Helper function to get date strings
const getDateString = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const mockEvents: BasketballEvent[] = [
  // PAST RESULTS (Finished matches)
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
  {
    event_key: '102',
    event_date: getDateString(-6),
    event_time: '20:00',
    event_home_team: 'Golden State Warriors',
    home_team_key: '3',
    event_away_team: 'Miami Heat',
    away_team_key: '4',
    event_final_result: '118 - 110',
    event_status: 'Finished',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/22.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/23.jpg',
    scores: {
      '1stQuarter': [{ score_home: '32', score_away: '28' }],
      '2ndQuarter': [{ score_home: '28', score_away: '26' }],
      '3rdQuarter': [{ score_home: '30', score_away: '30' }],
      '4thQuarter': [{ score_home: '28', score_away: '26' }],
    }
  },
  {
    event_key: '103',
    event_date: getDateString(-5),
    event_time: '18:00',
    event_home_team: 'Milwaukee Bucks',
    home_team_key: '5',
    event_away_team: 'Phoenix Suns',
    away_team_key: '6',
    event_final_result: '105 - 102',
    event_status: 'Finished',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/24.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/25.jpg',
    scores: {
      '1stQuarter': [{ score_home: '25', score_away: '28' }],
      '2ndQuarter': [{ score_home: '27', score_away: '24' }],
      '3rdQuarter': [{ score_home: '26', score_away: '25' }],
      '4thQuarter': [{ score_home: '27', score_away: '25' }],
    }
  },
  {
    event_key: '104',
    event_date: getDateString(-4),
    event_time: '21:00',
    event_home_team: 'Denver Nuggets',
    home_team_key: '7',
    event_away_team: 'Dallas Mavericks',
    away_team_key: '8',
    event_final_result: '122 - 118',
    event_status: 'Finished',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/26.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/27.jpg',
    scores: {
      '1stQuarter': [{ score_home: '30', score_away: '32' }],
      '2ndQuarter': [{ score_home: '32', score_away: '28' }],
      '3rdQuarter': [{ score_home: '28', score_away: '30' }],
      '4thQuarter': [{ score_home: '32', score_away: '28' }],
    }
  },
  {
    event_key: '105',
    event_date: getDateString(-3),
    event_time: '19:00',
    event_home_team: 'Boston Celtics',
    home_team_key: '2',
    event_away_team: 'Golden State Warriors',
    away_team_key: '3',
    event_final_result: '115 - 112',
    event_status: 'Finished',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/21.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/22.jpg',
    scores: {
      '1stQuarter': [{ score_home: '28', score_away: '30' }],
      '2ndQuarter': [{ score_home: '30', score_away: '26' }],
      '3rdQuarter': [{ score_home: '29', score_away: '28' }],
      '4thQuarter': [{ score_home: '28', score_away: '28' }],
    }
  },
  {
    event_key: '106',
    event_date: getDateString(-2),
    event_time: '20:30',
    event_home_team: 'Miami Heat',
    home_team_key: '4',
    event_away_team: 'Milwaukee Bucks',
    away_team_key: '5',
    event_final_result: '108 - 110',
    event_status: 'Finished',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/23.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/24.jpg',
    scores: {
      '1stQuarter': [{ score_home: '26', score_away: '28' }],
      '2ndQuarter': [{ score_home: '28', score_away: '27' }],
      '3rdQuarter': [{ score_home: '27', score_away: '26' }],
      '4thQuarter': [{ score_home: '27', score_away: '29' }],
    }
  },
  {
    event_key: '107',
    event_date: getDateString(-1),
    event_time: '19:30',
    event_home_team: 'Phoenix Suns',
    home_team_key: '6',
    event_away_team: 'Los Angeles Lakers',
    away_team_key: '1',
    event_final_result: '120 - 115',
    event_status: 'Finished',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/25.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/20.jpg',
    scores: {
      '1stQuarter': [{ score_home: '30', score_away: '28' }],
      '2ndQuarter': [{ score_home: '32', score_away: '30' }],
      '3rdQuarter': [{ score_home: '28', score_away: '29' }],
      '4thQuarter': [{ score_home: '30', score_away: '28' }],
    }
  },

  // LIVE MATCHES (Currently in progress)
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
  {
    event_key: '202',
    event_date: getDateString(0),
    event_time: '22:30',
    event_home_team: 'Los Angeles Lakers',
    home_team_key: '1',
    event_away_team: 'Miami Heat',
    away_team_key: '4',
    event_final_result: '52 - 48',
    event_quarter: '2nd Quarter',
    event_status: '2nd Quarter',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '1',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/20.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/23.jpg',
    scores: {
      '1stQuarter': [{ score_home: '28', score_away: '26' }],
      '2ndQuarter': [{ score_home: '24', score_away: '22' }],
    }
  },

  // UPCOMING MATCHES (Scheduled for future)
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
  {
    event_key: '302',
    event_date: getDateString(1),
    event_time: '21:30',
    event_home_team: 'Golden State Warriors',
    home_team_key: '3',
    event_away_team: 'Phoenix Suns',
    away_team_key: '6',
    event_final_result: '- - -',
    event_status: 'Not Started',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/22.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/25.jpg',
  },
  {
    event_key: '303',
    event_date: getDateString(2),
    event_time: '20:00',
    event_home_team: 'Denver Nuggets',
    home_team_key: '7',
    event_away_team: 'Los Angeles Lakers',
    away_team_key: '1',
    event_final_result: '- - -',
    event_status: 'Not Started',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/26.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/20.jpg',
  },
  {
    event_key: '304',
    event_date: getDateString(2),
    event_time: '22:00',
    event_home_team: 'Miami Heat',
    home_team_key: '4',
    event_away_team: 'Dallas Mavericks',
    away_team_key: '8',
    event_final_result: '- - -',
    event_status: 'Not Started',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/23.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/27.jpg',
  },
  {
    event_key: '305',
    event_date: getDateString(3),
    event_time: '19:30',
    event_home_team: 'Milwaukee Bucks',
    home_team_key: '5',
    event_away_team: 'Golden State Warriors',
    away_team_key: '3',
    event_final_result: '- - -',
    event_status: 'Not Started',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/24.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    event_key: '306',
    event_date: getDateString(3),
    event_time: '21:00',
    event_home_team: 'Phoenix Suns',
    home_team_key: '6',
    event_away_team: 'Boston Celtics',
    away_team_key: '2',
    event_final_result: '- - -',
    event_status: 'Not Started',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/25.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/21.jpg',
  },
  {
    event_key: '307',
    event_date: getDateString(4),
    event_time: '20:00',
    event_home_team: 'Los Angeles Lakers',
    home_team_key: '1',
    event_away_team: 'Denver Nuggets',
    away_team_key: '7',
    event_final_result: '- - -',
    event_status: 'Not Started',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/20.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/26.jpg',
  },
  {
    event_key: '308',
    event_date: getDateString(5),
    event_time: '19:00',
    event_home_team: 'Dallas Mavericks',
    home_team_key: '8',
    event_away_team: 'Miami Heat',
    away_team_key: '4',
    event_final_result: '- - -',
    event_status: 'Not Started',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/27.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/23.jpg',
  },
  {
    event_key: '309',
    event_date: getDateString(6),
    event_time: '20:30',
    event_home_team: 'Boston Celtics',
    home_team_key: '2',
    event_away_team: 'Phoenix Suns',
    away_team_key: '6',
    event_final_result: '- - -',
    event_status: 'Not Started',
    country_name: 'USA',
    league_name: 'NBA',
    league_key: '1',
    league_round: 'Regular Season',
    league_season: '2024-25',
    event_live: '0',
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/21.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/25.jpg',
  },
  {
    event_key: '310',
    event_date: getDateString(7),
    event_time: '21:30',
    event_home_team: 'Golden State Warriors',
    home_team_key: '3',
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
    event_home_team_logo: 'https://randomuser.me/api/portraits/men/22.jpg',
    event_away_team_logo: 'https://randomuser.me/api/portraits/men/24.jpg',
  },
];

const mockStandings: BasketballStanding[] = [
  { standing_place: '1', standing_place_type: 'Promotion', standing_team: 'Boston Celtics', standing_P: '20', standing_W: '15', standing_WO: '0', standing_L: '5', standing_LO: '0', standing_F: '2280', standing_A: '2150', standing_PCT: '.750', team_key: '2', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '2', standing_place_type: 'Promotion', standing_team: 'Milwaukee Bucks', standing_P: '20', standing_W: '14', standing_WO: '0', standing_L: '6', standing_LO: '0', standing_F: '2260', standing_A: '2180', standing_PCT: '.700', team_key: '5', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '3', standing_place_type: 'Promotion', standing_team: 'Denver Nuggets', standing_P: '20', standing_W: '13', standing_WO: '0', standing_L: '7', standing_LO: '0', standing_F: '2240', standing_A: '2200', standing_PCT: '.650', team_key: '7', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '4', standing_place_type: 'Promotion', standing_team: 'Los Angeles Lakers', standing_P: '20', standing_W: '12', standing_WO: '0', standing_L: '8', standing_LO: '0', standing_F: '2220', standing_A: '2210', standing_PCT: '.600', team_key: '1', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '5', standing_place_type: '', standing_team: 'Golden State Warriors', standing_P: '20', standing_W: '11', standing_WO: '0', standing_L: '9', standing_LO: '0', standing_F: '2200', standing_A: '2220', standing_PCT: '.550', team_key: '3', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '6', standing_place_type: '', standing_team: 'Phoenix Suns', standing_P: '20', standing_W: '10', standing_WO: '0', standing_L: '10', standing_LO: '0', standing_F: '2180', standing_A: '2230', standing_PCT: '.500', team_key: '6', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '7', standing_place_type: '', standing_team: 'Miami Heat', standing_P: '20', standing_W: '9', standing_WO: '0', standing_L: '11', standing_LO: '0', standing_F: '2160', standing_A: '2250', standing_PCT: '.450', team_key: '4', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
  { standing_place: '8', standing_place_type: '', standing_team: 'Dallas Mavericks', standing_P: '20', standing_W: '8', standing_WO: '0', standing_L: '12', standing_LO: '0', standing_F: '2140', standing_A: '2270', standing_PCT: '.400', team_key: '8', league_key: '1', league_season: '2024-25', league_round: 'Regular Season', standing_updated: getDateString(0) },
];

const mockOdds: { [matchId: string]: any } = {
  // Past matches odds
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
  '102': {
    'Home/Away': {
      'Home': { 'Bet365': '1.70', 'Bwin': '1.68', '1xBet': '1.72' },
      'Away': { 'Bet365': '2.10', 'Bwin': '2.15', '1xBet': '2.08' }
    }
  },
  '103': {
    'Home/Away': {
      'Home': { 'Bet365': '1.95', 'Bwin': '1.93', '1xBet': '1.97' },
      'Away': { 'Bet365': '1.85', 'Bwin': '1.87', '1xBet': '1.83' }
    }
  },
  '104': {
    'Home/Away': {
      'Home': { 'Bet365': '1.80', 'Bwin': '1.78', '1xBet': '1.82' },
      'Away': { 'Bet365': '2.00', 'Bwin': '2.05', '1xBet': '1.98' }
    }
  },
  '105': {
    'Home/Away': {
      'Home': { 'Bet365': '1.75', 'Bwin': '1.72', '1xBet': '1.78' },
      'Away': { 'Bet365': '2.05', 'Bwin': '2.10', '1xBet': '2.02' }
    }
  },
  '106': {
    'Home/Away': {
      'Home': { 'Bet365': '2.10', 'Bwin': '2.15', '1xBet': '2.08' },
      'Away': { 'Bet365': '1.70', 'Bwin': '1.68', '1xBet': '1.72' }
    }
  },
  '107': {
    'Home/Away': {
      'Home': { 'Bet365': '1.90', 'Bwin': '1.88', '1xBet': '1.92' },
      'Away': { 'Bet365': '1.90', 'Bwin': '1.92', '1xBet': '1.88' }
    }
  },

  // Live match odds
  '201': {
    'Home/Away': {
      'Home': { 'Bet365': '2.20', 'Bwin': '2.25', '1xBet': '2.18' },
      'Away': { 'Bet365': '1.65', 'Bwin': '1.62', '1xBet': '1.68' }
    }
  },
  '202': {
    'Home/Away': {
      'Home': { 'Bet365': '1.75', 'Bwin': '1.72', '1xBet': '1.78' },
      'Away': { 'Bet365': '2.05', 'Bwin': '2.10', '1xBet': '2.02' }
    }
  },

  // Upcoming matches odds
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
  },
  '302': {
    'Home/Away': {
      'Home': { 'Bet365': '1.70', 'Bwin': '1.68', '1xBet': '1.72' },
      'Away': { 'Bet365': '2.10', 'Bwin': '2.15', '1xBet': '2.08' }
    },
    'Total': {
      'Over 228.5': { 'Bet365': '1.85', 'Bwin': '1.83', '1xBet': '1.87' },
      'Under 228.5': { 'Bet365': '1.95', 'Bwin': '1.97', '1xBet': '1.93' }
    }
  },
  '303': {
    'Home/Away': {
      'Home': { 'Bet365': '1.85', 'Bwin': '1.83', '1xBet': '1.87' },
      'Away': { 'Bet365': '1.95', 'Bwin': '1.97', '1xBet': '1.93' }
    },
    'Total': {
      'Over 230.5': { 'Bet365': '1.90', 'Bwin': '1.88', '1xBet': '1.92' },
      'Under 230.5': { 'Bet365': '1.90', 'Bwin': '1.92', '1xBet': '1.88' }
    }
  },
  '304': {
    'Home/Away': {
      'Home': { 'Bet365': '2.00', 'Bwin': '2.05', '1xBet': '1.98' },
      'Away': { 'Bet365': '1.80', 'Bwin': '1.78', '1xBet': '1.82' }
    }
  },
  '305': {
    'Home/Away': {
      'Home': { 'Bet365': '1.75', 'Bwin': '1.72', '1xBet': '1.78' },
      'Away': { 'Bet365': '2.05', 'Bwin': '2.10', '1xBet': '2.02' }
    },
    'Total': {
      'Over 226.5': { 'Bet365': '1.88', 'Bwin': '1.86', '1xBet': '1.90' },
      'Under 226.5': { 'Bet365': '1.92', 'Bwin': '1.94', '1xBet': '1.90' }
    }
  },
  '306': {
    'Home/Away': {
      'Home': { 'Bet365': '1.90', 'Bwin': '1.88', '1xBet': '1.92' },
      'Away': { 'Bet365': '1.90', 'Bwin': '1.92', '1xBet': '1.88' }
    }
  },
  '307': {
    'Home/Away': {
      'Home': { 'Bet365': '2.10', 'Bwin': '2.15', '1xBet': '2.08' },
      'Away': { 'Bet365': '1.70', 'Bwin': '1.68', '1xBet': '1.72' }
    },
    'Total': {
      'Over 232.5': { 'Bet365': '1.90', 'Bwin': '1.88', '1xBet': '1.92' },
      'Under 232.5': { 'Bet365': '1.90', 'Bwin': '1.92', '1xBet': '1.88' }
    }
  },
  '308': {
    'Home/Away': {
      'Home': { 'Bet365': '1.95', 'Bwin': '1.93', '1xBet': '1.97' },
      'Away': { 'Bet365': '1.85', 'Bwin': '1.87', '1xBet': '1.83' }
    }
  },
  '309': {
    'Home/Away': {
      'Home': { 'Bet365': '1.80', 'Bwin': '1.78', '1xBet': '1.82' },
      'Away': { 'Bet365': '2.00', 'Bwin': '2.05', '1xBet': '1.98' }
    },
    'Total': {
      'Over 224.5': { 'Bet365': '1.85', 'Bwin': '1.83', '1xBet': '1.87' },
      'Under 224.5': { 'Bet365': '1.95', 'Bwin': '1.97', '1xBet': '1.93' }
    }
  },
  '310': {
    'Home/Away': {
      'Home': { 'Bet365': '1.85', 'Bwin': '1.83', '1xBet': '1.87' },
      'Away': { 'Bet365': '1.95', 'Bwin': '1.97', '1xBet': '1.93' }
    }
  }
};

// API Configuration
const API_BASE_URL = 'https://apiv2.allsportsapi.com/basketball/';
const API_KEY = '1637c7ddbd7bed5f5ffb6973d267ab8782d23d56f4fadc9399af4c05839680af';

// Helper function to build URL with parameters
const buildUrl = (method: string, params: Record<string, any> = {}): string => {
  const url = new URL(API_BASE_URL);
  url.searchParams.append('met', method);
  url.searchParams.append('APIkey', API_KEY);
  
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
        // Silently handle 500/504 if possible or return empty
        if (response.status >= 500) {
            console.warn(`Upstream API issue: ${response.status}`);
            return { success: 1, result: [] } as any;
        }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching basketball ${method}:`, error);
    // Return empty success instead of throwing to avoid UI crashes
    return { success: 1, result: [] } as any;
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

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
  BasketballOddsParams,
  BasketballOddsResponse,
  BasketballLeague,
  BasketballTeam,
  BasketballEvent,
  BasketballStanding,
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

class BasketballApi implements BasketballAPIClient {
  private async simulateDelay() {
    return new Promise(resolve => setTimeout(() => resolve(undefined), 800));
  }

  async getCountries(params: Omit<BasketballCountriesParams, 'met'>): Promise<BasketballCountriesResponse> {
    await this.simulateDelay();
    return { success: 1, result: mockLeagues };
  }

  async getLeagues(params: Omit<BasketballLeaguesParams, 'met'>): Promise<BasketballLeaguesResponse> {
    await this.simulateDelay();
    let result = mockLeagues;
    if (params.countryId) {
      result = result.filter(l => Number(l.country_key) === params.countryId);
    }
    return { success: 1, result };
  }

  async getFixtures(params: Omit<BasketballFixturesParams, 'met'>): Promise<BasketballFixturesResponse> {
    await this.simulateDelay();
    let result = mockEvents;

    if (params.leagueId) {
      result = result.filter(e => Number(e.league_key) === params.leagueId);
    }
    if (params.matchId) {
      result = result.filter(e => Number(e.event_key) === params.matchId);
    }
    if (params.teamId) {
      result = result.filter(e => Number(e.home_team_key) === params.teamId || Number(e.away_team_key) === params.teamId);
    }

    if (params.from && params.to) {
      const fromDate = new Date(params.from);
      const toDate = new Date(params.to);
      result = result.filter(e => {
        const eventDate = new Date(e.event_date);
        return eventDate >= fromDate && eventDate <= toDate;
      });
    }

    return { success: 1, result };
  }

  async getH2H(params: Omit<BasketballH2HParams, 'met'>): Promise<BasketballH2HResponse> {
    await this.simulateDelay();

    const h2h = mockEvents.filter(e =>
      (Number(e.home_team_key) === params.firstTeamId && Number(e.away_team_key) === params.secondTeamId) ||
      (Number(e.home_team_key) === params.secondTeamId && Number(e.away_team_key) === params.firstTeamId)
    );

    const firstTeamResults = mockEvents.filter(e =>
      (Number(e.home_team_key) === params.firstTeamId || Number(e.away_team_key) === params.firstTeamId) &&
      !((Number(e.home_team_key) === params.secondTeamId) || (Number(e.away_team_key) === params.secondTeamId))
    ).slice(0, 5);

    const secondTeamResults = mockEvents.filter(e =>
      (Number(e.home_team_key) === params.secondTeamId || Number(e.away_team_key) === params.secondTeamId) &&
      !((Number(e.home_team_key) === params.firstTeamId) || (Number(e.away_team_key) === params.firstTeamId))
    ).slice(0, 5);

    return {
      success: 1,
      result: {
        H2H: h2h,
        firstTeamResults,
        secondTeamResults
      }
    };
  }

  async getLivescore(params: Omit<BasketballLivescoreParams, 'met'>): Promise<BasketballLivescoreResponse> {
    await this.simulateDelay();
    let liveEvents = mockEvents.filter(e => e.event_live === '1');
    if (params.leagueId) {
      liveEvents = liveEvents.filter(e => Number(e.league_key) === params.leagueId);
    }
    if (params.matchId) {
      liveEvents = liveEvents.filter(e => Number(e.event_key) === params.matchId);
    }
    return { success: 1, result: liveEvents };
  }

  async getStandings(params: Omit<BasketballStandingsParams, 'met'>): Promise<BasketballStandingsResponse> {
    await this.simulateDelay();
    let result = mockStandings;
    if (params.leagueId) {
      result = result.filter(s => Number(s.league_key) === params.leagueId);
    }
    return { success: 1, result: { total: result } };
  }

  async getTeams(params: Omit<BasketballTeamsParams, 'met'>): Promise<BasketballTeamsResponse> {
    await this.simulateDelay();
    let result = mockTeams;
    if (params.teamId) {
      result = result.filter(t => Number(t.team_key) === params.teamId);
    }
    return { success: 1, result };
  }

  async getOdds(params: Omit<BasketballOddsParams, 'met'>): Promise<BasketballOddsResponse> {
    await this.simulateDelay();
    const result: { [key: string]: any } = {};

    if (params.matchId) {
      if (mockOdds[params.matchId]) {
        result[params.matchId] = mockOdds[params.matchId];
      }
    } else {
      Object.assign(result, mockOdds);
    }
    return { success: 1, result };
  }
}

export const basketballApi = new BasketballApi();

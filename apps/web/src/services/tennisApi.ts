import {
  TennisAPIClient,
  TennisCountriesParams,
  TennisCountriesResponse,
  TennisLeaguesParams,
  TennisLeaguesResponse,
  TennisFixturesParams,
  TennisFixturesResponse,
  TennisH2HParams,
  TennisH2HResponse,
  TennisLivescoreParams,
  TennisLivescoreResponse,
  TennisStandingsParams,
  TennisStandingsResponse,
  TennisPlayersParams,
  TennisPlayersResponse,
  TennisOddsParams,
  TennisOddsResponse,
  TennisLiveOddsParams,
  TennisLiveOddsResponse,
  TennisLeague,
  TennisPlayer,
  TennisEvent,
  TennisStanding,
} from '@goalmills/types';

// Mock Data

const mockLeagues: TennisLeague[] = [
  { league_key: 1, league_name: 'Wimbledon', country_key: 1, country_name: 'United Kingdom', league_surface: 'Grass' },
  { league_key: 2, league_name: 'French Open', country_key: 2, country_name: 'France', league_surface: 'Clay' },
  { league_key: 3, league_name: 'US Open', country_key: 3, country_name: 'USA', league_surface: 'Hard' },
  { league_key: 4, league_name: 'Australian Open', country_key: 4, country_name: 'Australia', league_surface: 'Hard' },
  { league_key: 5, league_name: 'ATP Finals', country_key: 5, country_name: 'Italy', league_surface: 'Hard (indoor)' },
];

const mockPlayers: TennisPlayer[] = [
  {
    player_key: 1,
    player_name: 'Novak Djokovic',
    player_country: 'Serbia',
    player_logo: 'https://randomuser.me/api/portraits/men/10.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '1', titles: '3', matches_won: '45', matches_lost: '5', hard_won: '20', hard_lost: '2', clay_won: '15', clay_lost: '2', grass_won: '10', grass_lost: '1' }
    ]
  },
  {
    player_key: 2,
    player_name: 'Carlos Alcaraz',
    player_country: 'Spain',
    player_logo: 'https://randomuser.me/api/portraits/men/11.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '2', titles: '2', matches_won: '40', matches_lost: '6', hard_won: '18', hard_lost: '3', clay_won: '12', clay_lost: '2', grass_won: '10', grass_lost: '1' }
    ]
  },
  {
    player_key: 3,
    player_name: 'Jannik Sinner',
    player_country: 'Italy',
    player_logo: 'https://randomuser.me/api/portraits/men/12.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '3', titles: '2', matches_won: '38', matches_lost: '7', hard_won: '22', hard_lost: '4', clay_won: '10', clay_lost: '2', grass_won: '6', grass_lost: '1' }
    ]
  },
  {
    player_key: 4,
    player_name: 'Daniil Medvedev',
    player_country: 'Russia',
    player_logo: 'https://randomuser.me/api/portraits/men/13.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '4', titles: '1', matches_won: '35', matches_lost: '9', hard_won: '25', hard_lost: '5', clay_won: '5', clay_lost: '3', grass_won: '5', grass_lost: '1' }
    ]
  },
  {
    player_key: 5,
    player_name: 'Alexander Zverev',
    player_country: 'Germany',
    player_logo: 'https://randomuser.me/api/portraits/men/14.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '5', titles: '2', matches_won: '42', matches_lost: '8', hard_won: '20', hard_lost: '4', clay_won: '15', clay_lost: '3', grass_won: '7', grass_lost: '1' }
    ]
  },
  {
    player_key: 6,
    player_name: 'Andrey Rublev',
    player_country: 'Russia',
    player_logo: 'https://randomuser.me/api/portraits/men/15.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '6', titles: '1', matches_won: '38', matches_lost: '10', hard_won: '22', hard_lost: '6', clay_won: '10', clay_lost: '3', grass_won: '6', grass_lost: '1' }
    ]
  },
  {
    player_key: 7,
    player_name: 'Stefanos Tsitsipas',
    player_country: 'Greece',
    player_logo: 'https://randomuser.me/api/portraits/men/16.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '7', titles: '1', matches_won: '36', matches_lost: '11', hard_won: '18', hard_lost: '6', clay_won: '12', clay_lost: '4', grass_won: '6', grass_lost: '1' }
    ]
  },
  {
    player_key: 8,
    player_name: 'Holger Rune',
    player_country: 'Denmark',
    player_logo: 'https://randomuser.me/api/portraits/men/17.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '8', titles: '1', matches_won: '34', matches_lost: '12', hard_won: '16', hard_lost: '6', clay_won: '12', clay_lost: '5', grass_won: '6', grass_lost: '1' }
    ]
  },
  {
    player_key: 9,
    player_name: 'Iga Swiatek',
    player_country: 'Poland',
    player_logo: 'https://randomuser.me/api/portraits/women/10.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '1', titles: '4', matches_won: '52', matches_lost: '4', hard_won: '20', hard_lost: '2', clay_won: '25', clay_lost: '1', grass_won: '7', grass_lost: '1' }
    ]
  },
  {
    player_key: 10,
    player_name: 'Aryna Sabalenka',
    player_country: 'Belarus',
    player_logo: 'https://randomuser.me/api/portraits/women/11.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '2', titles: '3', matches_won: '46', matches_lost: '6', hard_won: '28', hard_lost: '3', clay_won: '12', clay_lost: '2', grass_won: '6', grass_lost: '1' }
    ]
  },
  {
    player_key: 11,
    player_name: 'Coco Gauff',
    player_country: 'USA',
    player_logo: 'https://randomuser.me/api/portraits/women/12.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '3', titles: '2', matches_won: '44', matches_lost: '7', hard_won: '26', hard_lost: '4', clay_won: '12', clay_lost: '2', grass_won: '6', grass_lost: '1' }
    ]
  },
  {
    player_key: 12,
    player_name: 'Elena Rybakina',
    player_country: 'Kazakhstan',
    player_logo: 'https://randomuser.me/api/portraits/women/13.jpg',
    stats: [
        { season: '2024', type: 'singles', rank: '4', titles: '2', matches_won: '40', matches_lost: '8', hard_won: '20', hard_lost: '4', clay_won: '10', clay_lost: '3', grass_won: '10', grass_lost: '1' }
    ]
  }
];

// Helper function to get date strings
const getDateString = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const mockEvents: TennisEvent[] = [
  // PAST RESULTS (Finished matches)
  {
    event_key: 101,
    event_date: getDateString(-7),
    event_time: '14:00',
    event_first_player: 'Novak Djokovic',
    first_player_key: 1,
    event_second_player: 'Carlos Alcaraz',
    second_player_key: 2,
    event_final_result: '2 - 3',
    event_game_result: '-',
    event_serve: null,
    event_winner: 'Carlos Alcaraz',
    event_status: 'Finished',
    country_name: 'United Kingdom',
    league_name: 'Wimbledon',
    league_key: 1,
    league_round: 'Final',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/10.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/11.jpg',
    scores: [
      { score_first: '6', score_second: '1', score_set: '1' },
      { score_first: '6', score_second: '7', score_set: '2' },
      { score_first: '1', score_second: '6', score_set: '3' },
      { score_first: '6', score_second: '3', score_set: '4' },
      { score_first: '4', score_second: '6', score_set: '5' },
    ]
  },
  {
    event_key: 102,
    event_date: getDateString(-6),
    event_time: '13:00',
    event_first_player: 'Jannik Sinner',
    first_player_key: 3,
    event_second_player: 'Daniil Medvedev',
    second_player_key: 4,
    event_final_result: '3 - 0',
    event_game_result: '-',
    event_serve: null,
    event_winner: 'Jannik Sinner',
    event_status: 'Finished',
    country_name: 'United Kingdom',
    league_name: 'Wimbledon',
    league_key: 1,
    league_round: 'Semi-Final',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/12.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/13.jpg',
    scores: [
      { score_first: '6', score_second: '3', score_set: '1' },
      { score_first: '6', score_second: '4', score_set: '2' },
      { score_first: '7', score_second: '6', score_set: '3' },
    ]
  },
  {
    event_key: 103,
    event_date: getDateString(-5),
    event_time: '16:00',
    event_first_player: 'Alexander Zverev',
    first_player_key: 5,
    event_second_player: 'Andrey Rublev',
    second_player_key: 6,
    event_final_result: '3 - 1',
    event_game_result: '-',
    event_serve: null,
    event_winner: 'Alexander Zverev',
    event_status: 'Finished',
    country_name: 'France',
    league_name: 'French Open',
    league_key: 2,
    league_round: 'Quarter-Final',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/14.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/15.jpg',
    scores: [
      { score_first: '6', score_second: '4', score_set: '1' },
      { score_first: '3', score_second: '6', score_set: '2' },
      { score_first: '6', score_second: '2', score_set: '3' },
      { score_first: '6', score_second: '4', score_set: '4' },
    ]
  },
  {
    event_key: 104,
    event_date: getDateString(-4),
    event_time: '12:00',
    event_first_player: 'Iga Swiatek',
    first_player_key: 9,
    event_second_player: 'Aryna Sabalenka',
    second_player_key: 10,
    event_final_result: '2 - 1',
    event_game_result: '-',
    event_serve: null,
    event_winner: 'Iga Swiatek',
    event_status: 'Finished',
    country_name: 'France',
    league_name: 'French Open',
    league_key: 2,
    league_round: 'Final',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/women/10.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/women/11.jpg',
    scores: [
      { score_first: '6', score_second: '2', score_set: '1' },
      { score_first: '4', score_second: '6', score_set: '2' },
      { score_first: '6', score_second: '4', score_set: '3' },
    ]
  },
  {
    event_key: 105,
    event_date: getDateString(-3),
    event_time: '18:00',
    event_first_player: 'Coco Gauff',
    first_player_key: 11,
    event_second_player: 'Elena Rybakina',
    second_player_key: 12,
    event_final_result: '2 - 0',
    event_game_result: '-',
    event_serve: null,
    event_winner: 'Coco Gauff',
    event_status: 'Finished',
    country_name: 'USA',
    league_name: 'US Open',
    league_key: 3,
    league_round: 'Semi-Final',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/women/12.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/women/13.jpg',
    scores: [
      { score_first: '7', score_second: '6', score_set: '1' },
      { score_first: '6', score_second: '4', score_set: '2' },
    ]
  },
  {
    event_key: 106,
    event_date: getDateString(-2),
    event_time: '14:30',
    event_first_player: 'Stefanos Tsitsipas',
    first_player_key: 7,
    event_second_player: 'Holger Rune',
    second_player_key: 8,
    event_final_result: '3 - 2',
    event_game_result: '-',
    event_serve: null,
    event_winner: 'Stefanos Tsitsipas',
    event_status: 'Finished',
    country_name: 'USA',
    league_name: 'US Open',
    league_key: 3,
    league_round: 'Round of 16',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/16.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/17.jpg',
    scores: [
      { score_first: '6', score_second: '7', score_set: '1' },
      { score_first: '6', score_second: '4', score_set: '2' },
      { score_first: '4', score_second: '6', score_set: '3' },
      { score_first: '6', score_second: '3', score_set: '4' },
      { score_first: '7', score_second: '6', score_set: '5' },
    ]
  },
  {
    event_key: 107,
    event_date: getDateString(-1),
    event_time: '11:00',
    event_first_player: 'Novak Djokovic',
    first_player_key: 1,
    event_second_player: 'Daniil Medvedev',
    second_player_key: 4,
    event_final_result: '3 - 1',
    event_game_result: '-',
    event_serve: null,
    event_winner: 'Novak Djokovic',
    event_status: 'Finished',
    country_name: 'Australia',
    league_name: 'Australian Open',
    league_key: 4,
    league_round: 'Final',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/10.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/13.jpg',
    scores: [
      { score_first: '6', score_second: '3', score_set: '1' },
      { score_first: '4', score_second: '6', score_set: '2' },
      { score_first: '6', score_second: '4', score_set: '3' },
      { score_first: '6', score_second: '3', score_set: '4' },
    ]
  },

  // LIVE MATCHES (Currently in progress)
  {
    event_key: 201,
    event_date: getDateString(0),
    event_time: '15:00',
    event_first_player: 'Carlos Alcaraz',
    first_player_key: 2,
    event_second_player: 'Jannik Sinner',
    second_player_key: 3,
    event_final_result: '1 - 1',
    event_game_result: '15 - 30',
    event_serve: 'First Player',
    event_winner: null,
    event_status: 'Set 3',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '1',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/11.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/12.jpg',
    scores: [
      { score_first: '6', score_second: '4', score_set: '1' },
      { score_first: '4', score_second: '6', score_set: '2' },
      { score_first: '2', score_second: '2', score_set: '3' },
    ],
    pointbypoint: [
      {
        set_number: '3',
        number_game: '5',
        player_served: 'First Player',
        serve_winner: null,
        serve_lost: null,
        score: '15 - 30',
        points: []
      }
    ]
  },
  {
    event_key: 202,
    event_date: getDateString(0),
    event_time: '17:30',
    event_first_player: 'Iga Swiatek',
    first_player_key: 9,
    event_second_player: 'Coco Gauff',
    second_player_key: 11,
    event_final_result: '1 - 0',
    event_game_result: '40 - 15',
    event_serve: 'Second Player',
    event_winner: null,
    event_status: 'Set 2',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '1',
    event_first_player_logo: 'https://randomuser.me/api/portraits/women/10.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/women/12.jpg',
    scores: [
      { score_first: '6', score_second: '3', score_set: '1' },
      { score_first: '3', score_second: '3', score_set: '2' },
    ],
    pointbypoint: [
      {
        set_number: '2',
        number_game: '7',
        player_served: 'Second Player',
        serve_winner: null,
        serve_lost: null,
        score: '40 - 15',
        points: []
      }
    ]
  },

  // UPCOMING MATCHES (Scheduled for future)
  {
    event_key: 301,
    event_date: getDateString(1),
    event_time: '14:00',
    event_first_player: 'Novak Djokovic',
    first_player_key: 1,
    event_second_player: 'Alexander Zverev',
    second_player_key: 5,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/10.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/14.jpg',
  },
  {
    event_key: 302,
    event_date: getDateString(1),
    event_time: '16:30',
    event_first_player: 'Daniil Medvedev',
    first_player_key: 4,
    event_second_player: 'Andrey Rublev',
    second_player_key: 6,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/13.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/15.jpg',
  },
  {
    event_key: 303,
    event_date: getDateString(2),
    event_time: '13:00',
    event_first_player: 'Aryna Sabalenka',
    first_player_key: 10,
    event_second_player: 'Elena Rybakina',
    second_player_key: 12,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/women/11.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/women/13.jpg',
  },
  {
    event_key: 304,
    event_date: getDateString(2),
    event_time: '15:30',
    event_first_player: 'Stefanos Tsitsipas',
    first_player_key: 7,
    event_second_player: 'Jannik Sinner',
    second_player_key: 3,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/16.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
  {
    event_key: 305,
    event_date: getDateString(3),
    event_time: '12:00',
    event_first_player: 'Carlos Alcaraz',
    first_player_key: 2,
    event_second_player: 'Holger Rune',
    second_player_key: 8,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/11.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/17.jpg',
  },
  {
    event_key: 306,
    event_date: getDateString(3),
    event_time: '18:00',
    event_first_player: 'Iga Swiatek',
    first_player_key: 9,
    event_second_player: 'Elena Rybakina',
    second_player_key: 12,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/women/10.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/women/13.jpg',
  },
  {
    event_key: 307,
    event_date: getDateString(4),
    event_time: '14:00',
    event_first_player: 'Novak Djokovic',
    first_player_key: 1,
    event_second_player: 'Andrey Rublev',
    second_player_key: 6,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/10.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/15.jpg',
  },
  {
    event_key: 308,
    event_date: getDateString(5),
    event_time: '16:00',
    event_first_player: 'Jannik Sinner',
    first_player_key: 3,
    event_second_player: 'Alexander Zverev',
    second_player_key: 5,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Group Stage',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/12.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/14.jpg',
  },
  {
    event_key: 309,
    event_date: getDateString(6),
    event_time: '13:30',
    event_first_player: 'Coco Gauff',
    first_player_key: 11,
    event_second_player: 'Aryna Sabalenka',
    second_player_key: 10,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Semi-Final',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/women/12.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/women/11.jpg',
  },
  {
    event_key: 310,
    event_date: getDateString(7),
    event_time: '15:00',
    event_first_player: 'Carlos Alcaraz',
    first_player_key: 2,
    event_second_player: 'Daniil Medvedev',
    second_player_key: 4,
    event_final_result: '- - -',
    event_game_result: '-',
    event_serve: null,
    event_winner: null,
    event_status: 'Not Started',
    country_name: 'Italy',
    league_name: 'ATP Finals',
    league_key: 5,
    league_round: 'Semi-Final',
    league_season: '2024',
    event_live: '0',
    event_first_player_logo: 'https://randomuser.me/api/portraits/men/11.jpg',
    event_second_player_logo: 'https://randomuser.me/api/portraits/men/13.jpg',
  },
];

const mockStandings: TennisStanding[] = [
  { place: '1', player: 'Novak Djokovic', player_key: 1, league: 'ATP', movement: 'same', country: 'Serbia', points: '11245' },
  { place: '2', player: 'Carlos Alcaraz', player_key: 2, league: 'ATP', movement: 'up', country: 'Spain', points: '9845' },
  { place: '3', player: 'Jannik Sinner', player_key: 3, league: 'ATP', movement: 'down', country: 'Italy', points: '8570' },
  { place: '4', player: 'Daniil Medvedev', player_key: 4, league: 'ATP', movement: 'same', country: 'Russia', points: '7650' },
];

const mockOdds: { [matchId: string]: any } = {
  // Past matches odds
  '101': {
    'Match Winner': {
      'Home': { 'Bet365': '1.80', 'Bwin': '1.75' },
      'Away': { 'Bet365': '2.00', 'Bwin': '2.10' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.70', 'Bwin': '1.65' },
      'Away': { 'Bet365': '2.10', 'Bwin': '2.20' }
    }
  },
  '102': {
    'Match Winner': {
      'Home': { 'Bet365': '1.65', 'Bwin': '1.60', '1xBet': '1.68' },
      'Away': { 'Bet365': '2.20', 'Bwin': '2.25', '1xBet': '2.18' }
    }
  },
  '103': {
    'Match Winner': {
      'Home': { 'Bet365': '1.75', 'Bwin': '1.72', '1xBet': '1.78' },
      'Away': { 'Bet365': '2.05', 'Bwin': '2.10', '1xBet': '2.02' }
    }
  },
  '104': {
    'Match Winner': {
      'Home': { 'Bet365': '1.45', 'Bwin': '1.42', '1xBet': '1.48' },
      'Away': { 'Bet365': '2.70', 'Bwin': '2.75', '1xBet': '2.65' }
    }
  },
  '105': {
    'Match Winner': {
      'Home': { 'Bet365': '1.90', 'Bwin': '1.88', '1xBet': '1.92' },
      'Away': { 'Bet365': '1.85', 'Bwin': '1.87', '1xBet': '1.83' }
    }
  },
  '106': {
    'Match Winner': {
      'Home': { 'Bet365': '1.70', 'Bwin': '1.68', '1xBet': '1.72' },
      'Away': { 'Bet365': '2.10', 'Bwin': '2.15', '1xBet': '2.08' }
    }
  },
  '107': {
    'Match Winner': {
      'Home': { 'Bet365': '1.55', 'Bwin': '1.52', '1xBet': '1.58' },
      'Away': { 'Bet365': '2.40', 'Bwin': '2.45', '1xBet': '2.35' }
    }
  },
  
  // Live match odds
  '201': {
    'Match Winner': {
      'Home': { 'Bet365': '1.50', 'Bwin': '1.55' },
      'Away': { 'Bet365': '2.50', 'Bwin': '2.40' }
    }
  },
  '202': {
    'Match Winner': {
      'Home': { 'Bet365': '1.35', 'Bwin': '1.38', '1xBet': '1.33' },
      'Away': { 'Bet365': '3.10', 'Bwin': '3.00', '1xBet': '3.15' }
    }
  },

  // Upcoming matches odds
  '301': {
    'Match Winner': {
      'Home': { 'Bet365': '1.60', 'Bwin': '1.58', '1xBet': '1.62' },
      'Away': { 'Bet365': '2.30', 'Bwin': '2.35', '1xBet': '2.28' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.55', 'Bwin': '1.52', '1xBet': '1.57' },
      'Away': { 'Bet365': '2.40', 'Bwin': '2.45', '1xBet': '2.38' }
    },
    'Total Sets': {
      'Over 2.5': { 'Bet365': '1.85', 'Bwin': '1.88', '1xBet': '1.83' },
      'Under 2.5': { 'Bet365': '1.95', 'Bwin': '1.92', '1xBet': '1.97' }
    }
  },
  '302': {
    'Match Winner': {
      'Home': { 'Bet365': '1.75', 'Bwin': '1.72', '1xBet': '1.78' },
      'Away': { 'Bet365': '2.05', 'Bwin': '2.10', '1xBet': '2.02' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.70', 'Bwin': '1.68', '1xBet': '1.72' },
      'Away': { 'Bet365': '2.10', 'Bwin': '2.15', '1xBet': '2.08' }
    }
  },
  '303': {
    'Match Winner': {
      'Home': { 'Bet365': '1.85', 'Bwin': '1.82', '1xBet': '1.88' },
      'Away': { 'Bet365': '1.95', 'Bwin': '1.98', '1xBet': '1.92' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.80', 'Bwin': '1.78', '1xBet': '1.82' },
      'Away': { 'Bet365': '2.00', 'Bwin': '2.05', '1xBet': '1.98' }
    }
  },
  '304': {
    'Match Winner': {
      'Home': { 'Bet365': '2.20', 'Bwin': '2.25', '1xBet': '2.18' },
      'Away': { 'Bet365': '1.65', 'Bwin': '1.62', '1xBet': '1.68' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '2.10', 'Bwin': '2.15', '1xBet': '2.08' },
      'Away': { 'Bet365': '1.70', 'Bwin': '1.68', '1xBet': '1.72' }
    }
  },
  '305': {
    'Match Winner': {
      'Home': { 'Bet365': '1.55', 'Bwin': '1.52', '1xBet': '1.58' },
      'Away': { 'Bet365': '2.40', 'Bwin': '2.45', '1xBet': '2.35' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.50', 'Bwin': '1.48', '1xBet': '1.52' },
      'Away': { 'Bet365': '2.50', 'Bwin': '2.55', '1xBet': '2.45' }
    },
    'Total Sets': {
      'Over 2.5': { 'Bet365': '1.90', 'Bwin': '1.92', '1xBet': '1.88' },
      'Under 2.5': { 'Bet365': '1.90', 'Bwin': '1.88', '1xBet': '1.92' }
    }
  },
  '306': {
    'Match Winner': {
      'Home': { 'Bet365': '1.40', 'Bwin': '1.38', '1xBet': '1.42' },
      'Away': { 'Bet365': '2.90', 'Bwin': '2.95', '1xBet': '2.85' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.35', 'Bwin': '1.33', '1xBet': '1.37' },
      'Away': { 'Bet365': '3.10', 'Bwin': '3.15', '1xBet': '3.05' }
    }
  },
  '307': {
    'Match Winner': {
      'Home': { 'Bet365': '1.50', 'Bwin': '1.48', '1xBet': '1.52' },
      'Away': { 'Bet365': '2.50', 'Bwin': '2.55', '1xBet': '2.45' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.45', 'Bwin': '1.43', '1xBet': '1.47' },
      'Away': { 'Bet365': '2.65', 'Bwin': '2.70', '1xBet': '2.60' }
    }
  },
  '308': {
    'Match Winner': {
      'Home': { 'Bet365': '1.70', 'Bwin': '1.68', '1xBet': '1.72' },
      'Away': { 'Bet365': '2.10', 'Bwin': '2.15', '1xBet': '2.08' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.65', 'Bwin': '1.63', '1xBet': '1.67' },
      'Away': { 'Bet365': '2.20', 'Bwin': '2.25', '1xBet': '2.18' }
    },
    'Total Sets': {
      'Over 2.5': { 'Bet365': '1.95', 'Bwin': '1.98', '1xBet': '1.92' },
      'Under 2.5': { 'Bet365': '1.85', 'Bwin': '1.82', '1xBet': '1.88' }
    }
  },
  '309': {
    'Match Winner': {
      'Home': { 'Bet365': '2.00', 'Bwin': '2.05', '1xBet': '1.98' },
      'Away': { 'Bet365': '1.80', 'Bwin': '1.78', '1xBet': '1.82' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.95', 'Bwin': '1.98', '1xBet': '1.92' },
      'Away': { 'Bet365': '1.85', 'Bwin': '1.82', '1xBet': '1.88' }
    }
  },
  '310': {
    'Match Winner': {
      'Home': { 'Bet365': '1.65', 'Bwin': '1.62', '1xBet': '1.68' },
      'Away': { 'Bet365': '2.20', 'Bwin': '2.25', '1xBet': '2.18' }
    },
    'Set 1 Winner': {
      'Home': { 'Bet365': '1.60', 'Bwin': '1.58', '1xBet': '1.62' },
      'Away': { 'Bet365': '2.30', 'Bwin': '2.35', '1xBet': '2.28' }
    },
    'Total Sets': {
      'Over 2.5': { 'Bet365': '1.88', 'Bwin': '1.90', '1xBet': '1.86' },
      'Under 2.5': { 'Bet365': '1.92', 'Bwin': '1.90', '1xBet': '1.94' }
    }
  }
};

const mockLiveOdds: { [matchId: string]: any } = {
  '201': {
    ...mockEvents.find(e => e.event_key === 201),
    live_odds: [
      { odd_name: 'Match Winner', suspended: 'No', type: 'Home', value: '1.65', handicap: '' },
      { odd_name: 'Match Winner', suspended: 'No', type: 'Away', value: '2.20', handicap: '' },
      { odd_name: 'Set 3 Winner', suspended: 'No', type: 'Home', value: '1.40', handicap: '' },
      { odd_name: 'Set 3 Winner', suspended: 'No', type: 'Away', value: '2.80', handicap: '' }
    ]
  }
};

class TennisApi implements TennisAPIClient {
  private async simulateDelay() {
    return new Promise(resolve => setTimeout(() => resolve(undefined), 800));
  }

  async getCountries(params: Omit<TennisCountriesParams, 'met'>): Promise<TennisCountriesResponse> {
    await this.simulateDelay();
    return { success: 1, result: mockLeagues };
  }

  async getLeagues(params: Omit<TennisLeaguesParams, 'met'>): Promise<TennisLeaguesResponse> {
    await this.simulateDelay();
    let result = mockLeagues;
    if (params.countryId) {
        result = result.filter(l => Number(l.country_key) === params.countryId);
    }
    return { success: 1, result };
  }

  async getFixtures(params: Omit<TennisFixturesParams, 'met'>): Promise<TennisFixturesResponse> {
      await this.simulateDelay();
      let result = mockEvents;

      if (params.leagueId) {
          result = result.filter(e => Number(e.league_key) === params.leagueId);
      }
      if (params.matchId) {
            result = result.filter(e => Number(e.event_key) === params.matchId);
      }
      if (params.playerId) {
          result = result.filter(e => Number(e.first_player_key) === params.playerId || Number(e.second_player_key) === params.playerId);
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

  async getH2H(params: Omit<TennisH2HParams, 'met'>): Promise<TennisH2HResponse> {
      await this.simulateDelay();
      
      const h2h = mockEvents.filter(e => 
          (Number(e.first_player_key) === params.firstPlayerId && Number(e.second_player_key) === params.secondPlayerId) ||
          (Number(e.first_player_key) === params.secondPlayerId && Number(e.second_player_key) === params.firstPlayerId)
      );

      const firstTeamResults = mockEvents.filter(e => 
          (Number(e.first_player_key) === params.firstPlayerId || Number(e.second_player_key) === params.firstPlayerId) &&
          // Exclude H2H matches to just show their other recent form
          !((Number(e.first_player_key) === params.secondPlayerId) || (Number(e.second_player_key) === params.secondPlayerId))
      ).slice(0, 5);

      const secondTeamResults = mockEvents.filter(e => 
          (Number(e.first_player_key) === params.secondPlayerId || Number(e.second_player_key) === params.secondPlayerId) &&
          // Exclude H2H matches to just show their other recent form
          !((Number(e.first_player_key) === params.firstPlayerId) || (Number(e.second_player_key) === params.firstPlayerId))
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

  async getLivescore(params: Omit<TennisLivescoreParams, 'met'>): Promise<TennisLivescoreResponse> {
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

  async getStandings(params: Omit<TennisStandingsParams, 'met'>): Promise<TennisStandingsResponse> {
      await this.simulateDelay();
      let result = mockStandings;
      if (params.league) {
          result = result.filter(s => s.league === params.league);
      }
      return { success: 1, result };
  }

  async getPlayers(params: Omit<TennisPlayersParams, 'met'>): Promise<TennisPlayersResponse> {
      await this.simulateDelay();
      let result = mockPlayers;
      if (params.playerId) {
          result = result.filter(p => Number(p.player_key) === params.playerId);
      }
      return { success: 1, result };
  }

  async getOdds(params: Omit<TennisOddsParams, 'met'>): Promise<TennisOddsResponse> {
      await this.simulateDelay();
      const result: { [key: string]: any } = {};
      
      if (params.matchId) {
         if (mockOdds[params.matchId]) {
             result[params.matchId] = mockOdds[params.matchId];
         }
      } else {
          // Return all mock odds
          Object.assign(result, mockOdds);
      }
      return { success: 1, result };
  }

  async getLiveOdds(params: Omit<TennisLiveOddsParams, 'met'>): Promise<TennisLiveOddsResponse> {
      await this.simulateDelay();
      const result: { [key: string]: any } = {};

      if (params.matchId) {
          if (mockLiveOdds[params.matchId]) {
              result[params.matchId] = mockLiveOdds[params.matchId];
          }
      } else {
          Object.assign(result, mockLiveOdds);
      }
      return { success: 1, result };
  }
}

export const tennisApi = new TennisApi();

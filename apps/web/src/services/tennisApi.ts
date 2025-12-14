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
  }
];

const mockEvents: TennisEvent[] = [
  {
    event_key: 101,
    event_date: '2024-07-14',
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
    event_date: '2024-07-12',
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
      event_key: 201,
      event_date: new Date().toISOString().split('T')[0],
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
  }
];

const mockStandings: TennisStanding[] = [
  { place: '1', player: 'Novak Djokovic', player_key: 1, league: 'ATP', movement: 'same', country: 'Serbia', points: '11245' },
  { place: '2', player: 'Carlos Alcaraz', player_key: 2, league: 'ATP', movement: 'up', country: 'Spain', points: '9845' },
  { place: '3', player: 'Jannik Sinner', player_key: 3, league: 'ATP', movement: 'down', country: 'Italy', points: '8570' },
  { place: '4', player: 'Daniil Medvedev', player_key: 4, league: 'ATP', movement: 'same', country: 'Russia', points: '7650' },
];

const mockOdds: { [matchId: string]: any } = {
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
  '201': {
    'Match Winner': {
      'Home': { 'Bet365': '1.50', 'Bwin': '1.55' },
      'Away': { 'Bet365': '2.50', 'Bwin': '2.40' }
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

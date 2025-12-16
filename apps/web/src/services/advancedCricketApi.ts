
import {
  CricketLeague,
  CricketTeam,
  CricketEvent,
  CricketStanding,
  CricketLeaguesResponse,
  CricketFixturesResponse,
  CricketLivescoreResponse,
  CricketH2HResponse,
  CricketStandingsResponse,
  CricketTeamsResponse,
  CricketOddsResponse,
  CricketLeaguesParams,
  CricketFixturesParams,
  CricketLivescoreParams,
  CricketH2HParams,
  CricketStandingsParams,
  CricketTeamsParams,
  CricketOddsParams,
  CricketScorecardPlayer,
  CricketComment,
  CricketLineups,
  CricketWicket,
  CricketExtra,
} from '@goalmills/types';

// Mock Data - Leagues
const mockLeagues: CricketLeague[] = [
  { 
    league_key: '1', 
    league_name: 'Indian Premier League', 
    league_year: '2024',
    league_season: '2024',
    league_logo: 'https://i.imgur.com/xQx7VJp.png', // IPL logo
    country_name: 'India',
    country_key: '1'
  },
  { 
    league_key: '2', 
    league_name: 'ICC Cricket World Cup', 
    league_year: '2023',
    league_season: '2023',
    league_logo: 'https://i.imgur.com/KqXpNhH.png', // ICC logo
    country_name: 'International',
    country_key: '0'
  },
  { 
    league_key: '3', 
    league_name: 'Big Bash League', 
    league_year: '2024',
    league_season: '2023-24',
    league_logo: 'https://i.imgur.com/9mZqYvL.png', // BBL logo
    country_name: 'Australia',
    country_key: '2'
  },
  { 
    league_key: '4', 
    league_name: 'The Ashes', 
    league_year: '2023',
    league_season: '2023',
    country_name: 'England & Australia',
    country_key: '3'
  },
  { 
    league_key: '5', 
    league_name: 'T20 World Cup', 
    league_year: '2024',
    league_season: '2024',
    country_name: 'International',
    country_key: '0'
  },
];

// Mock Data - Teams
const mockTeams: CricketTeam[] = [
  { team_key: '1', team_name: 'India', team_logo: 'https://flagcdn.com/w80/in.png' },
  { team_key: '2', team_name: 'Australia', team_logo: 'https://flagcdn.com/w80/au.png' },
  { team_key: '3', team_name: 'England', team_logo: 'https://flagcdn.com/w80/gb-eng.png' },
  { team_key: '4', team_name: 'Mumbai Indians', team_logo: 'https://i.imgur.com/5JQvKYm.png' },
  { team_key: '5', team_name: 'Chennai Super Kings', team_logo: 'https://i.imgur.com/TnmlkPK.png' },
  { team_key: '6', team_name: 'Pakistan', team_logo: 'https://flagcdn.com/w80/pk.png' },
  { team_key: '7', team_name: 'South Africa', team_logo: 'https://flagcdn.com/w80/za.png' },
  { team_key: '8', team_name: 'New Zealand', team_logo: 'https://flagcdn.com/w80/nz.png' },
];

// Helper function to generate mock events
const generateMockEvents = (): CricketEvent[] => {
  const events: CricketEvent[] = [];
  const now = new Date();
  const statuses = ['Finished', 'In Progress', 'Not Started', 'Stumps'];

  for (let i = 0; i < 20; i++) {
    const homeTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
    let awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
    while (awayTeam.team_key === homeTeam.team_key) {
      awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
    }

    const league = mockLeagues[Math.floor(Math.random() * mockLeagues.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const dayOffset = i < 5 ? -1 : i < 10 ? 0 : Math.floor(Math.random() * 7) + 1;
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + dayOffset);
    
    const isFinished = status === 'Finished';
    const isLive = status === 'In Progress';
    
    // Mock scores
    const homeRuns = Math.floor(Math.random() * 200) + 100;
    const homeWickets = Math.floor(Math.random() * 10);
    const homeOvers = isFinished ? 20 : Math.floor(Math.random() * 20);
    
    const awayRuns = Math.floor(Math.random() * homeRuns);
    const awayWickets = Math.floor(Math.random() * 10);
    const awayOvers = isFinished ? 20 : Math.floor(Math.random() * 20);

    const scorecard: { [innings: string]: CricketScorecardPlayer[] } = {};
    const comments: { [innings: string]: CricketComment[] } = {};
    const wickets: { [innings: string]: CricketWicket[] } = {};
    const extra: { [innings: string]: CricketExtra } = {};

    if (isFinished || isLive) {
      scorecard['1 INN'] = Array.from({ length: 11 }).map((_, idx) => ({
        innings: '1 INN',
        player: `Player ${idx + 1}`,
        type: 'Batsman',
        status: idx < 2 ? 'not out' : 'out',
        R: String(Math.floor(Math.random() * 100)),
        B: String(Math.floor(Math.random() * 60)),
        Min: String(Math.floor(Math.random() * 90)),
        '4s': String(Math.floor(Math.random() * 10)),
        '6s': String(Math.floor(Math.random() * 5)),
        SR: '150.00',
        O: null, M: null, W: null, ER: null,
      }));
       scorecard['2 INN'] = Array.from({ length: 11 }).map((_, idx) => ({
        innings: '2 INN',
        player: `Player ${idx + 1}`,
        type: 'Batsman',
        status: idx < 2 ? 'not out' : 'out',
        R: String(Math.floor(Math.random() * 100)),
        B: String(Math.floor(Math.random() * 60)),
        Min: String(Math.floor(Math.random() * 90)),
        '4s': String(Math.floor(Math.random() * 10)),
        '6s': String(Math.floor(Math.random() * 5)),
        SR: '150.00',
        O: null, M: null, W: null, ER: null,
      }));
    }

    events.push({
      event_key: `${100 + i}`,
      event_date_start: eventDate.toISOString().split('T')[0],
      event_date_stop: eventDate.toISOString().split('T')[0],
      event_time: '14:00',
      event_home_team: homeTeam.team_name,
      home_team_key: homeTeam.team_key,
      event_away_team: awayTeam.team_name,
      away_team_key: awayTeam.team_key,
      event_service_home: homeTeam.team_name,
      event_service_away: awayTeam.team_name,
      event_home_final_result: isFinished || isLive ? `${homeRuns}/${homeWickets} (${homeOvers})` : '',
      event_away_final_result: isFinished || isLive ? `${awayRuns}/${awayWickets} (${awayOvers})` : '',
      event_home_rr: '8.5',
      event_away_rr: '7.2',
      event_status: status,
      event_status_info: isFinished ? `${homeTeam.team_name} won by ${Math.abs(homeRuns - awayRuns)} runs` : status,
      league_name: league.league_name,
      league_key: league.league_key,
      league_round: 'League Match',
      league_season: league.league_year,
      event_live: isLive ? '1' : '0',
      event_type: 'T20',
      event_toss: `${homeTeam.team_name} won toss and elected to bat`,
      event_stadium: 'Melbourne Cricket Ground',
      event_home_team_logo: homeTeam.team_logo || undefined,
      event_away_team_logo: awayTeam.team_logo || undefined,
      scorecard: scorecard,
      comments: comments,
      lineups: undefined,
      wickets: wickets,
      extra: extra,
    });
  }
  return events;
};

const mockEvents = generateMockEvents();

// Mock Data - Standings
const mockStandings: CricketStanding[] = [
  // World Cup (League 2)
  {
    standing_place: '1',
    standing_place_type: 'Final',
    standing_team: 'India',
    standing_MP: '10',
    standing_W: '10',
    standing_L: '0',
    standing_NR: '0',
    standing_R: '2500',
    standing_NRR: '+2.500',
    standing_Pts: '20',
    team_key: '1',
    league_key: '2',
    league_round: 'Group Stage',
    standing_updated: new Date().toISOString(),
  },
  {
    standing_place: '2',
    standing_place_type: 'Final',
    standing_team: 'Australia',
    standing_MP: '10',
    standing_W: '8',
    standing_L: '2',
    standing_NR: '0',
    standing_R: '2400',
    standing_NRR: '+1.500',
    standing_Pts: '16',
    team_key: '2',
    league_key: '2',
    league_round: 'Group Stage',
    standing_updated: new Date().toISOString(),
  },
  // Test Rankings (League 101)
  { standing_place: '1', standing_place_type: 'Rank', standing_team: 'Australia', standing_MP: '30', standing_W: '20', standing_L: '5', standing_NR: '5', standing_R: '', standing_NRR: '', standing_Pts: '124', team_key: '2', league_key: '101', league_round: '', standing_updated: '' },
  { standing_place: '2', standing_place_type: 'Rank', standing_team: 'India', standing_MP: '28', standing_W: '18', standing_L: '6', standing_NR: '4', standing_R: '', standing_NRR: '', standing_Pts: '120', team_key: '1', league_key: '101', league_round: '', standing_updated: '' },
  { standing_place: '3', standing_place_type: 'Rank', standing_team: 'England', standing_MP: '35', standing_W: '15', standing_L: '15', standing_NR: '5', standing_R: '', standing_NRR: '', standing_Pts: '105', team_key: '3', league_key: '101', league_round: '', standing_updated: '' },
  
  // ODI Rankings (League 102)
  { standing_place: '1', standing_place_type: 'Rank', standing_team: 'India', standing_MP: '40', standing_W: '35', standing_L: '5', standing_NR: '0', standing_R: '', standing_NRR: '', standing_Pts: '118', team_key: '1', league_key: '102', league_round: '', standing_updated: '' },
  { standing_place: '2', standing_place_type: 'Rank', standing_team: 'Australia', standing_MP: '38', standing_W: '30', standing_L: '8', standing_NR: '0', standing_R: '', standing_NRR: '', standing_Pts: '113', team_key: '2', league_key: '102', league_round: '', standing_updated: '' },
  
  // T20 Rankings (League 103)
  { standing_place: '1', standing_place_type: 'Rank', standing_team: 'India', standing_MP: '55', standing_W: '45', standing_L: '10', standing_NR: '0', standing_R: '', standing_NRR: '', standing_Pts: '264', team_key: '1', league_key: '103', league_round: '', standing_updated: '' },
  { standing_place: '2', standing_place_type: 'Rank', standing_team: 'West Indies', standing_MP: '50', standing_W: '30', standing_L: '20', standing_NR: '0', standing_R: '', standing_NRR: '', standing_Pts: '252', team_key: '10', league_key: '103', league_round: '', standing_updated: '' },
];

// Delay simulation
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

// API Implementation
export const advancedCricketApi = {
  /**
   * Get list of supported cricket leagues/competitions
   */
  getLeagues: async (params?: Omit<CricketLeaguesParams, 'met'>): Promise<CricketLeaguesResponse> => {
    await delay(500);
    return {
      success: 1,
      result: mockLeagues,
    };
  },

  /**
   * Get cricket fixtures/matches
   */
  getFixtures: async (params?: Omit<CricketFixturesParams, 'met'>): Promise<CricketFixturesResponse> => {
    await delay(500);
    let events = mockEvents;

    if (params?.leagueId) {
      events = events.filter((e) => e.league_key === String(params.leagueId));
    }
    if (params?.matchId) {
      events = events.filter((e) => e.event_key === String(params.matchId));
    }
    
    // Sort by date
    events.sort((a, b) => {
        const dateA = a.event_date_start ? new Date(a.event_date_start).getTime() : 0;
        const dateB = b.event_date_start ? new Date(b.event_date_start).getTime() : 0;
        return dateA - dateB;
    });

    return {
      success: 1,
      result: events,
    };
  },

  /**
   * Get live cricket matches
   */
  getLivescore: async (params?: Omit<CricketLivescoreParams, 'met'>): Promise<CricketLivescoreResponse> => {
    await delay(500);
    let liveEvents = mockEvents.filter((e) => e.event_live === '1');

    if (params?.leagueId) {
      liveEvents = liveEvents.filter((e) => e.league_key === String(params.leagueId));
    }
    if (params?.matchId) {
        liveEvents = liveEvents.filter((e) => e.event_key === String(params.matchId));
    }

    return {
      success: 1,
      result: liveEvents,
    };
  },

  /**
   * Get head to head results between two teams
   */
  getH2H: async (params: Omit<CricketH2HParams, 'met'>): Promise<CricketH2HResponse> => {
    await delay(500);
    const h2h = mockEvents.filter(
      (e) =>
        (e.home_team_key === String(params.firstTeamId) && e.away_team_key === String(params.secondTeamId)) ||
        (e.home_team_key === String(params.secondTeamId) && e.away_team_key === String(params.firstTeamId))
    );
     const firstTeamResults = mockEvents.filter(
      (e) => e.home_team_key === String(params.firstTeamId) || e.away_team_key === String(params.firstTeamId)
    );

    const secondTeamResults = mockEvents.filter(
      (e) => e.home_team_key === String(params.secondTeamId) || e.away_team_key === String(params.secondTeamId)
    );

    return {
      success: 1,
      result: {
        H2H: h2h,
        firstTeamResults: firstTeamResults.slice(0, 5),
        secondTeamResults: secondTeamResults.slice(0, 5),
      },
    };
  },

  /**
   * Get league standings
   */
  getStandings: async (params: Omit<CricketStandingsParams, 'met'>): Promise<CricketStandingsResponse> => {
    await delay(500);
    const standings = mockStandings.filter((s) => s.league_key === String(params.leagueId));
    return {
      success: 1,
      result: {
        total: standings,
      },
    };
  },

  /**
   * Get teams information
   */
  getTeams: async (params?: Omit<CricketTeamsParams, 'met'>): Promise<CricketTeamsResponse> => {
    await delay(500);
    let teams = mockTeams;
    if (params?.teamId) {
      teams = teams.filter(t => t.team_key === String(params.teamId));
    }
    return {
      success: 1,
      result: teams,
    };
  },

  /**
   * Get pre-match odds for cricket events
   */
  getOdds: async (params?: Omit<CricketOddsParams, 'met'>): Promise<CricketOddsResponse> => {
    await delay(500);
    // Return empty mock odds for now
    return {
      success: 1,
      result: {},
    };
  },
};

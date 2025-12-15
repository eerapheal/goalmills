import {
  FootballCountry,
  FootballLeague,
  FootballEvent,
  FootballStanding,
  FootballTopscorer,
  FootballTeam,
  FootballPlayer,
  FootballVideo,
  FootballOdds,
  FootballProbability,
  FootballLiveOdd,
  FootballComment,
  FootballFullMatchOdds,
  FootballCountriesResponse,
  FootballLeaguesResponse,
  FootballFixturesResponse,
  FootballH2HResponse,
  FootballLivescoreResponse,
  FootballStandingsResponse,
  FootballTopscorersResponse,
  FootballTeamsResponse,
  FootballPlayersResponse,
  FootballVideosResponse,
  FootballOddsResponse,
  FootballProbabilitiesResponse,
  FootballLiveOddsResponse,
  FootballCommentsResponse,
  FootballFullOddsResponse,
  FootballGoalScorer,
  FootballCard,
  FootballStatistic,
  FootballLineups,
  FootballCoach,
  FootballOfficial,
} from '@goalmills/types';

// Mock Data - Countries
const mockCountries: FootballCountry[] = [
  { country_key: '44', country_name: 'England', country_iso2: 'GB', country_logo: 'https://apiv3.apifootball.com/badges/logo_country/44_england.png' },
  { country_key: '6', country_name: 'Spain', country_iso2: 'ES', country_logo: 'https://apiv3.apifootball.com/badges/logo_country/6_spain.png' },
  { country_key: '5', country_name: 'Germany', country_iso2: 'DE', country_logo: 'https://apiv3.apifootball.com/badges/logo_country/5_germany.png' },
  { country_key: '4', country_name: 'Italy', country_iso2: 'IT', country_logo: 'https://apiv3.apifootball.com/badges/logo_country/4_italy.png' },
  { country_key: '3', country_name: 'France', country_iso2: 'FR', country_logo: 'https://apiv3.apifootball.com/badges/logo_country/3_france.png' },
  { country_key: '169', country_name: 'UEFA', country_iso2: null, country_logo: 'https://apiv3.apifootball.com/badges/logo_country/169_uefa.png' },
];

// League Rankings (higher = more important)
const leagueRankings: { [key: string]: number } = {
  '152': 100, // Premier League
  '302': 95,  // La Liga
  '175': 90,  // Bundesliga
  '207': 85,  // Serie A
  '3': 80,    // UEFA Champions League
  '168': 75,  // Ligue 1
};

// Mock Data - Leagues
const mockLeagues: FootballLeague[] = [
  {
    league_key: '152',
    league_name: 'Premier League',
    country_key: '44',
    country_name: 'England',
    league_logo: 'https://apiv3.apifootball.com/badges/logo_leagues/152_premier-league.png',
    country_logo: 'https://apiv3.apifootball.com/badges/logo_country/44_england.png',
  },
  {
    league_key: '302',
    league_name: 'La Liga',
    country_key: '6',
    country_name: 'Spain',
    league_logo: 'https://apiv3.apifootball.com/badges/logo_leagues/302_la-liga.png',
    country_logo: 'https://apiv3.apifootball.com/badges/logo_country/6_spain.png',
  },
  {
    league_key: '175',
    league_name: 'Bundesliga',
    country_key: '5',
    country_name: 'Germany',
    league_logo: 'https://apiv3.apifootball.com/badges/logo_leagues/175_bundesliga.png',
    country_logo: 'https://apiv3.apifootball.com/badges/logo_country/5_germany.png',
  },
  {
    league_key: '207',
    league_name: 'Serie A',
    country_key: '4',
    country_name: 'Italy',
    league_logo: 'https://apiv3.apifootball.com/badges/logo_leagues/207_serie-a.png',
    country_logo: 'https://apiv3.apifootball.com/badges/logo_country/4_italy.png',
  },
  {
    league_key: '168',
    league_name: 'Ligue 1',
    country_key: '3',
    country_name: 'France',
    league_logo: 'https://apiv3.apifootball.com/badges/logo_leagues/168_ligue-1.png',
    country_logo: 'https://apiv3.apifootball.com/badges/logo_country/3_france.png',
  },
  {
    league_key: '3',
    league_name: 'UEFA Champions League',
    country_key: '169',
    country_name: 'UEFA',
    league_logo: 'https://apiv3.apifootball.com/badges/logo_leagues/3_uefa-champions-league.png',
    country_logo: 'https://apiv3.apifootball.com/badges/logo_country/169_uefa.png',
  },
];

// Mock Data - Teams
const mockTeams: FootballTeam[] = [
  { team_key: '33', team_name: 'Manchester United', team_logo: 'https://crests.football-data.org/66.png' },
  { team_key: '50', team_name: 'Manchester City', team_logo: 'https://crests.football-data.org/65.png' },
  { team_key: '40', team_name: 'Liverpool', team_logo: 'https://crests.football-data.org/64.png' },
  { team_key: '42', team_name: 'Arsenal', team_logo: 'https://crests.football-data.org/57.png' },
  { team_key: '49', team_name: 'Chelsea', team_logo: 'https://crests.football-data.org/61.png' },
  { team_key: '47', team_name: 'Tottenham', team_logo: 'https://crests.football-data.org/73.png' },
  { team_key: '529', team_name: 'Barcelona', team_logo: 'https://crests.football-data.org/81.png' },
  { team_key: '541', team_name: 'Real Madrid', team_logo: 'https://crests.football-data.org/86.png' },
  { team_key: '157', team_name: 'Bayern Munich', team_logo: 'https://crests.football-data.org/5.png' },
  { team_key: '489', team_name: 'AC Milan', team_logo: 'https://crests.football-data.org/98.png' },
  { team_key: '496', team_name: 'Juventus', team_logo: 'https://crests.football-data.org/109.png' },
  { team_key: '85', team_name: 'Paris Saint Germain', team_logo: 'https://crests.football-data.org/524.png' },
];

// Helper function to generate mock events
const generateMockEvents = (): FootballEvent[] => {
  const events: FootballEvent[] = [];
  const now = new Date();
  const statuses = ['Finished', 'Live', 'Not Started', '45', '67', '23'];

  for (let i = 0; i < 30; i++) {
    const homeTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
    let awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
    while (awayTeam.team_key === homeTeam.team_key) {
      awayTeam = mockTeams[Math.floor(Math.random() * mockTeams.length)];
    }

    const league = mockLeagues[Math.floor(Math.random() * mockLeagues.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const dayOffset = i < 10 ? -1 : i < 15 ? 0 : Math.floor(Math.random() * 7) + 1;
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + dayOffset);
    
    const isFinished = status === 'Finished';
    const isLive = status === 'Live' || !isNaN(Number(status));
    const homeGoals = isFinished || isLive ? Math.floor(Math.random() * 4) : 0;
    const awayGoals = isFinished || isLive ? Math.floor(Math.random() * 4) : 0;
    const htHomeGoals = isFinished || isLive ? Math.floor(homeGoals * 0.6) : 0;
    const htAwayGoals = isFinished || isLive ? Math.floor(awayGoals * 0.6) : 0;

    const goalscorers: FootballGoalScorer[] = [];
    for (let g = 0; g < homeGoals; g++) {
      goalscorers.push({
        time: `${Math.floor(Math.random() * 90)}'`,
        home_scorer: `Player ${g + 1}`,
        score: `${g + 1} - ${awayGoals}`,
        away_scorer: '',
      });
    }
    for (let g = 0; g < awayGoals; g++) {
      goalscorers.push({
        time: `${Math.floor(Math.random() * 90)}'`,
        home_scorer: '',
        score: `${homeGoals} - ${g + 1}`,
        away_scorer: `Player ${g + 1}`,
      });
    }

    const cards: FootballCard[] = [];
    const numCards = Math.floor(Math.random() * 4);
    for (let c = 0; c < numCards; c++) {
      cards.push({
        time: `${Math.floor(Math.random() * 90)}'`,
        home_fault: Math.random() > 0.5 ? `Player ${c + 1}` : '',
        card: Math.random() > 0.8 ? 'red card' : 'yellow card',
        away_fault: Math.random() > 0.5 ? `Player ${c + 1}` : '',
      });
    }

    const statistics: FootballStatistic[] = [
      { type: 'Ball Possession', home: `${45 + Math.floor(Math.random() * 20)}%`, away: `${45 + Math.floor(Math.random() * 20)}%` },
      { type: 'Shots Total', home: `${Math.floor(Math.random() * 20)}`, away: `${Math.floor(Math.random() * 20)}` },
      { type: 'Shots On Goal', home: `${Math.floor(Math.random() * 10)}`, away: `${Math.floor(Math.random() * 10)}` },
      { type: 'Fouls', home: `${Math.floor(Math.random() * 15)}`, away: `${Math.floor(Math.random() * 15)}` },
      { type: 'Corners', home: `${Math.floor(Math.random() * 10)}`, away: `${Math.floor(Math.random() * 10)}` },
      { type: 'Offsides', home: `${Math.floor(Math.random() * 5)}`, away: `${Math.floor(Math.random() * 5)}` },
    ];

    const generateLineuPlayers = (count: number, startNum: number): { player: string; player_number: string; player_position: string; player_country: null; player_key: string; player_image: string }[] => {
      return Array.from({ length: count }).map((_, idx) => ({
        player: `Player ${startNum + idx}`,
        player_number: `${startNum + idx}`,
        player_position: idx === 0 ? 'Goalkeeper' : idx < 5 ? 'Defender' : idx < 9 ? 'Midfielder' : 'Forward',
        player_country: null,
        player_key: `${1000 + startNum + idx}`,
        player_image: `https://ui-avatars.com/api/?name=Player+${startNum + idx}&background=random&size=200`,
      }));
    };

    const lineups: FootballLineups = {
      home_team: {
        starting_lineups: generateLineuPlayers(11, 1),
        substitutes: generateLineuPlayers(7, 12),
        coaches: [{
          coache: `Coach Home`,
          coache_country: null,
          coache_image: 'https://ui-avatars.com/api/?name=Coach+Home&background=random&size=200'
        }],
        missing_players: [
          { player: 'Injured Player 1', player_number: '20', player_image: 'https://ui-avatars.com/api/?name=Injured+1&background=random&size=200', reason: 'Knee Injury' },
        ],
      },
      away_team: {
        starting_lineups: generateLineuPlayers(11, 1),
        substitutes: generateLineuPlayers(7, 12),
        coaches: [{
          coache: `Coach Away`,
          coache_country: null,
          coache_image: 'https://ui-avatars.com/api/?name=Coach+Away&background=random&size=200'
        }],
        missing_players: [],
      }
    };

    events.push({
      event_key: `${1000 + i}`,
      event_date: eventDate.toISOString().split('T')[0],
      event_time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      event_home_team: homeTeam.team_name,
      home_team_key: homeTeam.team_key,
      event_away_team: awayTeam.team_name,
      away_team_key: awayTeam.team_key,
      event_halftime_result: isFinished || isLive ? `${htHomeGoals} - ${htAwayGoals}` : '',
      event_final_result: isFinished ? `${homeGoals} - ${awayGoals}` : '',
      event_ft_result: isFinished ? `${homeGoals} - ${awayGoals}` : '',
      event_penalty_result: '',
      event_status: status,
      country_name: league.country_name,
      league_name: league.league_name,
      league_key: league.league_key,
      league_round: `Round ${Math.floor(Math.random() * 38) + 1}`,
      league_season: '2024/2025',
      event_live: isLive ? '1' : '0',
      event_stadium: `${homeTeam.team_name} Stadium`,
      event_referee: isFinished || isLive ? 'Michael Oliver' : '',
      home_team_logo: homeTeam.team_logo,
      away_team_logo: awayTeam.team_logo,
      league_logo: league.league_logo,
      country_logo: league.country_logo,
      event_home_formation: isLive || isFinished ? '4-3-3' : '',
      event_away_formation: isLive || isFinished ? '4-4-2' : '',
      goalscorers: isLive || isFinished ? goalscorers : [],
      cards: isLive || isFinished ? cards : [],
      statistics: isLive || isFinished ? statistics : [],
      lineups: isLive || isFinished ? lineups : undefined,
    });
  }

  return events.sort((a, b) => {
    const dateA = new Date(`${a.event_date} ${a.event_time}`);
    const dateB = new Date(`${b.event_date} ${b.event_time}`);
    return dateA.getTime() - dateB.getTime();
  });
};

const mockEvents = generateMockEvents();

// Mock Data - Standings
const mockStandings: FootballStanding[] = [
  {
    standing_place: '1',
    standing_place_type: null,
    standing_team: 'Manchester City',
    standing_P: '18',
    standing_W: '14',
    standing_D: '3',
    standing_L: '1',
    standing_F: '48',
    standing_A: '20',
    standing_GD: '28',
    standing_PTS: '45',
    team_key: '50',
    league_key: '152',
    league_season: '2024/2025',
    league_round: 'Round 18',
  },
  {
    standing_place: '2',
    standing_place_type: null,
    standing_team: 'Liverpool',
    standing_P: '18',
    standing_W: '13',
    standing_D: '3',
    standing_L: '2',
    standing_F: '44',
    standing_A: '20',
    standing_GD: '24',
    standing_PTS: '42',
    team_key: '40',
    league_key: '152',
    league_season: '2024/2025',
    league_round: 'Round 18',
  },
  {
    standing_place: '3',
    standing_place_type: null,
    standing_team: 'Arsenal',
    standing_P: '18',
    standing_W: '12',
    standing_D: '4',
    standing_L: '2',
    standing_F: '42',
    standing_A: '20',
    standing_GD: '22',
    standing_PTS: '40',
    team_key: '42',
    league_key: '152',
    league_season: '2024/2025',
    league_round: 'Round 18',
  },
  {
    standing_place: '4',
    standing_place_type: null,
    standing_team: 'Chelsea',
    standing_P: '18',
    standing_W: '10',
    standing_D: '5',
    standing_L: '3',
    standing_F: '38',
    standing_A: '23',
    standing_GD: '15',
    standing_PTS: '35',
    team_key: '49',
    league_key: '152',
    league_season: '2024/2025',
    league_round: 'Round 18',
  },
  {
    standing_place: '5',
    standing_place_type: null,
    standing_team: 'Manchester United',
    standing_P: '18',
    standing_W: '9',
    standing_D: '5',
    standing_L: '4',
    standing_F: '32',
    standing_A: '22',
    standing_GD: '10',
    standing_PTS: '32',
    team_key: '33',
    league_key: '152',
    league_season: '2024/2025',
    league_round: 'Round 18',
  },
];

// Mock Data - Top Scorers
const mockTopscorers: FootballTopscorer[] = [
  {
    player_place: '1',
    player_name: 'Erling Haaland',
    player_key: 1100,
    team_name: 'Manchester City',
    team_key: '50',
    goals: '18',
    assists: '5',
    penalty_goals: '3',
  },
  {
    player_place: '2',
    player_name: 'Mohamed Salah',
    player_key: 306,
    team_name: 'Liverpool',
    team_key: '40',
    goals: '15',
    assists: '8',
    penalty_goals: '2',
  },
  {
    player_place: '3',
    player_name: 'Harry Kane',
    player_key: 276,
    team_name: 'Bayern Munich',
    team_key: '157',
    goals: '14',
    assists: '4',
    penalty_goals: '4',
  },
];

// Mock Data - Players
const mockPlayers: FootballPlayer[] = [
  {
    player_key: 276,
    player_name: 'Marcus Rashford',
    player_number: '10',
    player_country: 'England',
    player_type: 'Forwards',
    player_age: '26',
    player_match_played: '18',
    player_goals: '8',
    player_yellow_cards: '2',
    player_red_cards: '0',
    player_image: 'https://ui-avatars.com/api/?name=Marcus+Rashford&background=random&size=200',
    player_assists: '4',
    player_rating: '7.5',
    team_name: 'Manchester United',
    team_key: '33',
  },
  {
    player_key: 1100,
    player_name: 'Erling Haaland',
    player_number: '9',
    player_country: 'Norway',
    player_type: 'Forwards',
    player_age: '23',
    player_match_played: '18',
    player_goals: '18',
    player_yellow_cards: '1',
    player_red_cards: '0',
    player_image: 'https://ui-avatars.com/api/?name=Erling+Haaland&background=random&size=200',
    player_assists: '5',
    player_rating: '8.9',
    team_name: 'Manchester City',
    team_key: '50',
  },
  {
    player_key: 306,
    player_name: 'Mohamed Salah',
    player_number: '11',
    player_country: 'Egypt',
    player_type: 'Forwards',
    player_age: '31',
    player_match_played: '18',
    player_goals: '15',
    player_yellow_cards: '1',
    player_red_cards: '0',
    player_image: 'https://ui-avatars.com/api/?name=Mohamed+Salah&background=random&size=200',
    player_assists: '8',
    player_rating: '8.5',
    team_name: 'Liverpool',
    team_key: '40',
  },
];

// Mock Data - Coaches
const mockCoaches: FootballCoach[] = [
  { coache: 'Pep Guardiola', coache_country: 'Spain', team_name: 'Manchester City', trophies: 38, coache_image: 'https://ui-avatars.com/api/?name=Pep+Guardiola&background=random&size=200' },
  { coache: 'Jürgen Klopp', coache_country: 'Germany', team_name: 'Liverpool', trophies: 12, coache_image: 'https://ui-avatars.com/api/?name=Jurgen+Klopp&background=random&size=200' },
  { coache: 'Carlo Ancelotti', coache_country: 'Italy', team_name: 'Real Madrid', trophies: 28, coache_image: 'https://ui-avatars.com/api/?name=Carlo+Ancelotti&background=random&size=200' },
  { coache: 'Mikel Arteta', coache_country: 'Spain', team_name: 'Arsenal', trophies: 2, coache_image: 'https://ui-avatars.com/api/?name=Mikel+Arteta&background=random&size=200' },
  { coache: 'Erik ten Hag', coache_country: 'Netherlands', team_name: 'Manchester United', trophies: 6, coache_image: 'https://ui-avatars.com/api/?name=Erik+ten+Hag&background=random&size=200' },
  { coache: 'Thomas Tuchel', coache_country: 'Germany', team_name: 'Bayern Munich', trophies: 11, coache_image: 'https://ui-avatars.com/api/?name=Thomas+Tuchel&background=random&size=200' },
];

// Mock Data - Officials/Referees
const mockOfficials: FootballOfficial[] = [
  { name: 'Michael Oliver', country: 'England', matches: 245, image: 'https://ui-avatars.com/api/?name=Michael+Oliver&background=random&size=200', yellowCards: 1234, redCards: 89 },
  { name: 'Anthony Taylor', country: 'England', matches: 198, image: 'https://ui-avatars.com/api/?name=Anthony+Taylor&background=random&size=200', yellowCards: 987, redCards: 67 },
  { name: 'Björn Kuipers', country: 'Netherlands', matches: 312, image: 'https://ui-avatars.com/api/?name=Bjorn+Kuipers&background=random&size=200', yellowCards: 1567, redCards: 102 },
  { name: 'Daniele Orsato', country: 'Italy', matches: 267, image: 'https://ui-avatars.com/api/?name=Daniele+Orsato&background=random&size=200', yellowCards: 1345, redCards: 95 },
  { name: 'Clément Turpin', country: 'France', matches: 189, image: 'https://ui-avatars.com/api/?name=Clement+Turpin&background=random&size=200', yellowCards: 876, redCards: 54 },
];

// Delay simulation
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

// API Implementation
export const advancedFootballApi = {
  /**
   * Get list of supported countries
   */
  getCountries: async (): Promise<FootballCountriesResponse> => {
    await delay(500);
    return {
      success: 1,
      result: mockCountries,
    };
  },

  /**
   * Get list of supported leagues/competitions
   */
  getLeagues: async (countryId?: number): Promise<FootballLeaguesResponse> => {
    await delay(500);
    let leagues = mockLeagues;
    if (countryId) {
      leagues = mockLeagues.filter((l) => l.country_key === String(countryId));
    }
    return {
      success: 1,
      result: leagues,
    };
  },

  /**
   * Get football fixtures/events
   */
  getFixtures: async (params: {
    from: string;
    to: string;
    leagueId?: number;
    matchId?: number;
    teamId?: number;
  }): Promise<FootballFixturesResponse> => {
    await delay(500);
    let events = mockEvents;

    if (params.leagueId) {
      events = events.filter((e) => e.league_key === String(params.leagueId));
    }
    if (params.matchId) {
      events = events.filter((e) => e.event_key === String(params.matchId));
    }
    if (params.teamId) {
      events = events.filter(
        (e) => e.home_team_key === String(params.teamId) || e.away_team_key === String(params.teamId)
      );
    }

    return {
      success: 1,
      result: events,
    };
  },

  /**
   * Get head to head results between two teams
   */
  getH2H: async (firstTeamId: number, secondTeamId: number): Promise<FootballH2HResponse> => {
    await delay(500);
    const h2h = mockEvents.filter(
      (e) =>
        (e.home_team_key === String(firstTeamId) && e.away_team_key === String(secondTeamId)) ||
        (e.home_team_key === String(secondTeamId) && e.away_team_key === String(firstTeamId))
    );

    const firstTeamResults = mockEvents.filter(
      (e) => e.home_team_key === String(firstTeamId) || e.away_team_key === String(firstTeamId)
    );

    const secondTeamResults = mockEvents.filter(
      (e) => e.home_team_key === String(secondTeamId) || e.away_team_key === String(secondTeamId)
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
   * Get live football matches
   */
  getLivescore: async (params?: { leagueId?: number; matchId?: number }): Promise<FootballLivescoreResponse> => {
    await delay(500);
    let liveEvents = mockEvents.filter((e) => e.event_live === '1');

    if (params?.leagueId) {
      liveEvents = liveEvents.filter((e) => e.league_key === String(params.leagueId));
    }
    if (params?.matchId) {
      liveEvents = liveEvents.filter((e) => e.event_key === String(params.matchId));
    }

    // Sort by league ranking (EPL first, then by ranking)
    liveEvents.sort((a, b) => {
      const rankA = leagueRankings[a.league_key] || 0;
      const rankB = leagueRankings[b.league_key] || 0;
      return rankB - rankA;
    });

    return {
      success: 1,
      result: liveEvents,
    };
  },

  /**
   * Get league standings (total, home, away)
   */
  getStandings: async (leagueId: number): Promise<FootballStandingsResponse> => {
    await delay(500);
    const standings = mockStandings.filter((s) => s.league_key === String(leagueId));

    return {
      success: 1,
      result: {
        total: standings,
        home: standings,
        away: standings,
      },
    };
  },

  /**
   * Get top scorers for a league
   */
  getTopscorers: async (leagueId: number): Promise<FootballTopscorersResponse> => {
    await delay(500);
    return {
      success: 1,
      result: mockTopscorers,
    };
  },

  /**
   * Get teams information with players
   */
  getTeams: async (params?: { leagueId?: number; teamId?: number }): Promise<FootballTeamsResponse> => {
    await delay(500);
    let teams = mockTeams;

    if (params?.teamId) {
      teams = teams.filter((t) => t.team_key === String(params.teamId));
    }

    return {
      success: 1,
      result: teams,
    };
  },

  /**
   * Get player information and statistics
   */
  getPlayers: async (params?: { playerId?: number; teamId?: number }): Promise<FootballPlayersResponse> => {
    await delay(500);
    let players = mockPlayers;

    if (params?.playerId) {
      players = players.filter((p) => p.player_key === params.playerId);
    }
    if (params?.teamId) {
      players = players.filter((p) => p.team_key === String(params.teamId));
    }

    return {
      success: 1,
      result: players,
    };
  },

  /**
   * Get video highlights for events
   */
  getVideos: async (eventId: number): Promise<FootballVideosResponse> => {
    await delay(500);
    const videos: FootballVideo[] = [
      {
        event_key: String(eventId),
        video_title_full: 'Full Match Highlights',
        video_title: 'Highlights',
        video_url: 'https://www.youtube.com/watch?v=example',
      },
    ];

    return {
      success: 1,
      result: videos,
    };
  },

  /**
   * Get pre-match odds for events
   */
  getOdds: async (params?: { matchId?: number }): Promise<FootballOddsResponse> => {
    await delay(500);
    const odds: { [matchId: string]: FootballOdds[] } = {};

    if (params?.matchId) {
      odds[String(params.matchId)] = [
        {
          match_id: String(params.matchId),
          odd_bookmakers: 'Bet365',
          odd_1: '2.10',
          odd_x: '3.40',
          odd_2: '3.20',
          odd_1x: '1.30',
          odd_12: '1.25',
          odd_x2: '1.65',
          'o+2.5': '1.85',
          'u+2.5': '1.95',
          bts_yes: '1.70',
          bts_no: '2.10',
          'ah-4.5_1': null,
          'ah-4.5_2': null,
          'ah-4_1': null,
          'ah-4_2': null,
          'ah-3.5_1': null,
          'ah-3.5_2': null,
          'ah-3_1': null,
          'ah-3_2': null,
          'ah-2.5_1': null,
          'ah-2.5_2': null,
          'ah-2_1': null,
          'ah-2_2': null,
          'ah-1.5_1': null,
          'ah-1.5_2': null,
          'ah-1_1': null,
          'ah-1_2': null,
          'ah0_1': null,
          'ah0_2': null,
          'ah+0.5_1': null,
          'ah+1_1': null,
          'ah+1_2': null,
          'ah+1.5_1': null,
          'ah+1.5_2': null,
          'ah+2_1': null,
          'ah+2_2': null,
          'ah+2.5_1': null,
          'ah+2.5_2': null,
          'ah+3_1': null,
          'ah+3_2': null,
          'ah+3.5_1': null,
          'ah+3.5_2': null,
          'ah+4_1': null,
          'ah+4_2': null,
          'ah+4.5_1': null,
          'ah+4.5_2': null,
          'o+0.5': null,
          'u+0.5': null,
          'o+1': null,
          'u+1': null,
          'o+1.5': null,
          'u+1.5': null,
          'o+2': null,
          'u+2': null,
          'o+3': null,
          'u+3': null,
          'o+3.5': null,
          'u+3.5': null,
          'o+4': null,
          'u+4': null,
          'o+4.5': null,
          'u+4.5': null,
          'o+5': null,
          'u+5': null,
          'o+5.5': null,
          'u+5.5': null,
        },
      ];
    }

    return {
      success: 1,
      result: odds,
    };
  },

  /**
   * Get match probabilities
   */
  getProbabilities: async (params?: { matchId?: number }): Promise<FootballProbabilitiesResponse> => {
    await delay(500);
    return {
      success: 1,
      result: [],
    };
  },

  /**
   * Get live odds for ongoing events
   */
  getLiveOdds: async (params?: { matchId?: number }): Promise<FootballLiveOddsResponse> => {
    await delay(500);
    return {
      success: 1,
      result: {},
    };
  },

  /**
   * Get live match comments/commentary
   */
  getComments: async (params?: { matchId?: number }): Promise<FootballCommentsResponse> => {
    await delay(500);
    const comments: { [matchId: string]: FootballComment[] } = {};

    if (params?.matchId) {
      comments[String(params.matchId)] = [
        {
          comments_time: "45'",
          comments_text: 'Half time whistle',
          comments_state_info: 'HT',
          match_id: String(params.matchId),
        },
        {
          comments_time: "23'",
          comments_text: 'Goal! What a strike!',
          comments_state_info: 'GOAL',
          match_id: String(params.matchId),
        },
      ];
    }

    return {
      success: 1,
      result: comments,
    };
  },

  /**
   * Get full odds list with all bookmakers and markets
   */
  getFullOdds: async (params?: { matchId?: number }): Promise<FootballFullOddsResponse> => {
    await delay(500);
    return {
      success: 1,
      result: {},
    };
  },

  /**
   * Get coaches list
   */
  getCoaches: async (): Promise<{ success: number; result: FootballCoach[] }> => {
    await delay(500);
    return {
      success: 1,
      result: mockCoaches,
    };
  },

  /**
   * Get officials list
   */
  getOfficials: async (): Promise<{ success: number; result: FootballOfficial[] }> => {
    await delay(500);
    return {
      success: 1,
      result: mockOfficials,
    };
  },
};

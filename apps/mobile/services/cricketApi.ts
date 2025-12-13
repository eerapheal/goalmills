import {
  CricbuzzAPIClient,
  CricketMatchInfo,
  CricketSeries,
  CricketTeam,
  CricketPlayer,
  CricketScoreboard,
  GetCricketFixturesParams,

  CricketFixturesResponse,
  CricketSeriesResponse,
  GetCricketSeriesParams,
  GetCricketMatchesParams,
  CricketLiveMatchResponse,
  GetCricketMatchInfoParams,
  CricketMatchDetailResponse,
  GetCricketScoreboardParams,
  CricketScoreboardResponse,
  GetCricketSchedulesParams,
  CricketSchedulesResponse,
  CricketTeamsResponse,
  GetCricketTeamsParams,
  GetCricketPlayersParams,
  CricketPlayersResponse,
} from '@goalmills/types';

// Mock Data
const mockTeams: CricketTeam[] = [
  { id: 1, name: 'India', shortName: 'IND', logo: 'https://flagcdn.com/w320/in.png', country: 'India' },
  { id: 2, name: 'Australia', shortName: 'AUS', logo: 'https://flagcdn.com/w320/au.png', country: 'Australia' },
  { id: 3, name: 'England', shortName: 'ENG', logo: 'https://flagcdn.com/w320/gb-eng.png', country: 'England' },
  { id: 4, name: 'South Africa', shortName: 'RSA', logo: 'https://flagcdn.com/w320/za.png', country: 'South Africa' },
  { id: 5, name: 'New Zealand', shortName: 'NZ', logo: 'https://flagcdn.com/w320/nz.png', country: 'New Zealand' },
  { id: 6, name: 'Pakistan', shortName: 'PAK', logo: 'https://flagcdn.com/w320/pk.png', country: 'Pakistan' },
];

const mockPlayers: CricketPlayer[] = [
  // India
  { id: 1, name: 'Virat Kohli', teamId: 1, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 2, name: 'Rohit Sharma', teamId: 1, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: 3, name: 'Jasprit Bumrah', teamId: 1, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 4, name: 'Hardik Pandya', teamId: 1, role: 'All-Rounder', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { id: 5, name: 'Ravindra Jadeja', teamId: 1, role: 'All-Rounder', battingStyle: 'Left Handed', image: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { id: 6, name: 'KL Rahul', teamId: 1, role: 'Wicketkeeper', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/6.jpg' },
  { id: 7, name: 'Shubman Gill', teamId: 1, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/7.jpg' },
  { id: 8, name: 'Mohammed Shami', teamId: 1, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/8.jpg' },
  { id: 9, name: 'Mohammed Siraj', teamId: 1, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/9.jpg' },
  { id: 10, name: 'Kuldeep Yadav', teamId: 1, role: 'Bowler', bowlingStyle: 'Left-arm Wrist Spin', image: 'https://randomuser.me/api/portraits/men/10.jpg' },
  { id: 11, name: 'Suryakumar Yadav', teamId: 1, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/11.jpg' },

  // Australia
  { id: 12, name: 'Pat Cummins', teamId: 2, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/12.jpg' },
  { id: 13, name: 'Steve Smith', teamId: 2, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/13.jpg' },
  { id: 14, name: 'David Warner', teamId: 2, role: 'Batsman', battingStyle: 'Left Handed', image: 'https://randomuser.me/api/portraits/men/14.jpg' },
  { id: 15, name: 'Mitchell Starc', teamId: 2, role: 'Bowler', bowlingStyle: 'Left-arm Fast', image: 'https://randomuser.me/api/portraits/men/15.jpg' },
  { id: 16, name: 'Glenn Maxwell', teamId: 2, role: 'All-Rounder', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/16.jpg' },
  { id: 17, name: 'Travis Head', teamId: 2, role: 'Batsman', battingStyle: 'Left Handed', image: 'https://randomuser.me/api/portraits/men/17.jpg' },
  { id: 18, name: 'Marnus Labuschagne', teamId: 2, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/18.jpg' },
  { id: 19, name: 'Josh Hazlewood', teamId: 2, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/19.jpg' },
  { id: 20, name: 'Nathan Lyon', teamId: 2, role: 'Bowler', bowlingStyle: 'Right-arm Off Spin', image: 'https://randomuser.me/api/portraits/men/20.jpg' },
  { id: 21, name: 'Cameron Green', teamId: 2, role: 'All-Rounder', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/21.jpg' },
  { id: 22, name: 'Alex Carey', teamId: 2, role: 'Wicketkeeper', battingStyle: 'Left Handed', image: 'https://randomuser.me/api/portraits/men/22.jpg' },

  // England
  { id: 23, name: 'Joe Root', teamId: 3, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/23.jpg' },
  { id: 24, name: 'Ben Stokes', teamId: 3, role: 'All-Rounder', battingStyle: 'Left Handed', image: 'https://randomuser.me/api/portraits/men/24.jpg' },
  { id: 25, name: 'Jos Buttler', teamId: 3, role: 'Wicketkeeper', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/25.jpg' },
  { id: 26, name: 'Harry Brook', teamId: 3, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/26.jpg' },
  { id: 27, name: 'Mark Wood', teamId: 3, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/27.jpg' },
  { id: 28, name: 'Jofra Archer', teamId: 3, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/28.jpg' },
  { id: 29, name: 'Jonny Bairstow', teamId: 3, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/29.jpg' },

  // South Africa
  { id: 30, name: 'Temba Bavuma', teamId: 4, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/30.jpg' },
  { id: 31, name: 'Kagiso Rabada', teamId: 4, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/31.jpg' },
  { id: 32, name: 'Aiden Markram', teamId: 4, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 33, name: 'Quinton de Kock', teamId: 4, role: 'Wicketkeeper', battingStyle: 'Left Handed', image: 'https://randomuser.me/api/portraits/men/33.jpg' },
  { id: 34, name: 'Heinrich Klaasen', teamId: 4, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/34.jpg' },

  // New Zealand
  { id: 35, name: 'Kane Williamson', teamId: 5, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/35.jpg' },
  { id: 36, name: 'Trent Boult', teamId: 5, role: 'Bowler', bowlingStyle: 'Left-arm Fast', image: 'https://randomuser.me/api/portraits/men/36.jpg' },
  { id: 37, name: 'Rachin Ravindra', teamId: 5, role: 'All-Rounder', battingStyle: 'Left Handed', image: 'https://randomuser.me/api/portraits/men/37.jpg' },
  { id: 38, name: 'Daryl Mitchell', teamId: 5, role: 'All-Rounder', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/38.jpg' },
  { id: 39, name: 'Tim Southee', teamId: 5, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/39.jpg' },

  // Pakistan
  { id: 40, name: 'Babar Azam', teamId: 6, role: 'Batsman', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/40.jpg' },
  { id: 41, name: 'Shaheen Afridi', teamId: 6, role: 'Bowler', bowlingStyle: 'Left-arm Fast', image: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { id: 42, name: 'Mohammad Rizwan', teamId: 6, role: 'Wicketkeeper', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/42.jpg' },
  { id: 43, name: 'Naseem Shah', teamId: 6, role: 'Bowler', bowlingStyle: 'Right-arm Fast', image: 'https://randomuser.me/api/portraits/men/43.jpg' },
  { id: 44, name: 'Shadab Khan', teamId: 6, role: 'All-Rounder', battingStyle: 'Right Handed', image: 'https://randomuser.me/api/portraits/men/44.jpg' },
];

const mockSeries: CricketSeries[] = [
  { id: 1, name: 'Border-Gavaskar Trophy', startDate: '2024-11-22', endDate: '2025-01-07', seriesType: 'Test', country: 'Australia', image: 'https://images.unsplash.com/photo-1531415074984-6a8a95d3da39?w=800' },
  { id: 2, name: 'The Ashes', startDate: '2025-06-16', endDate: '2025-07-29', seriesType: 'Test', country: 'England', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800' },
  { id: 3, name: 'IPL 2025', startDate: '2025-03-22', endDate: '2025-05-26', seriesType: 'T20', tournament: 'IPL', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800' },
];

const generateMockMatches = (count: number, status: string, startId: number): CricketMatchInfo[] => {
  return Array.from({ length: count }).map((_, i) => {
    const homeTeam = mockTeams[i % mockTeams.length];
    const awayTeam = mockTeams[(i + 1) % mockTeams.length];
    return {
      id: startId + i,
      name: `${homeTeam.name} vs ${awayTeam.name}`,
      matchType: 'T20',
      status: status,
      venue: { id: 1, name: 'Melbourne Cricket Ground', city: 'Melbourne', country: 'Australia' },
      date: new Date().toISOString(),
      dateTimeGMT: new Date().toISOString(),
      teams: [homeTeam.name, awayTeam.name],
      teamInfo: [homeTeam, awayTeam],
      score: [
        { team: homeTeam.name, teamId: homeTeam.id, innings: '1', runs: 180 + i, wickets: 4, overs: 20 },
        { team: awayTeam.name, teamId: awayTeam.id, innings: '2', runs: 170 + i, wickets: 6, overs: 20 },
      ],
      series: 'International Tour',
      seriesId: 1,
      matchStarted: true,
      matchEnded: status === 'Complete',
    };
  });
};

const mockLiveMatches = generateMockMatches(3, 'Live', 100);
const mockUpcomingMatches = generateMockMatches(5, 'Upcoming', 200).map(m => ({ ...m, status: 'Upcoming', matchStarted: false, score: undefined }));
const mockRecentMatches = generateMockMatches(5, 'Complete', 300);

class CricketApi implements CricbuzzAPIClient {
  private async simulateDelay() {
    return new Promise(resolve => setTimeout(() => resolve(undefined), 500));
  }

  // Fixtures
  async getFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> {
    await this.simulateDelay();
    return { fixtures: [...mockLiveMatches, ...mockUpcomingMatches], totalMatches: 8 };
  }
  async getInternationalFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> { return this.getFixtures(params); }
  async getDomesticFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> { return this.getFixtures(params); }
  async getLeagueFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> { return this.getFixtures(params); }
  async getWomenFixtures(params?: GetCricketFixturesParams): Promise<CricketFixturesResponse> { return this.getFixtures(params); }

  // Series
  async getSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> {
    await this.simulateDelay();
    return { series: mockSeries, totalSeries: mockSeries.length };
  }
  async getInternationalSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> { return this.getSeries(params); }
  async getDomesticSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> { return this.getSeries(params); }
  async getLeagueSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> { return this.getSeries(params); }
  async getWomenSeries(params?: GetCricketSeriesParams): Promise<CricketSeriesResponse> { return this.getSeries(params); }

  // Matches
  async getLiveMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse> {
    await this.simulateDelay();
    return { matches: mockLiveMatches, totalMatches: mockLiveMatches.length };
  }
  async getRecentMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse> {
    await this.simulateDelay();
    return { matches: mockRecentMatches, totalMatches: mockRecentMatches.length };
  }
  async getUpcomingMatches(params?: GetCricketMatchesParams): Promise<CricketLiveMatchResponse> {
    await this.simulateDelay();
    return { matches: mockUpcomingMatches, totalMatches: mockUpcomingMatches.length };
  }
  
  async getMatchInfo(params: GetCricketMatchInfoParams): Promise<CricketMatchDetailResponse> {
    await this.simulateDelay();
    const match = [...mockLiveMatches, ...mockUpcomingMatches, ...mockRecentMatches].find(m => m.id === params.matchId) || mockLiveMatches[0];
    return {
      matchInfo: match,
      venueInfo: match.venue,
      matchFormat: 'T20',
      tossResults: { winner: match.teams[0], decision: 'Batting' },
    };
  }

  async getMatchScoreboard(params: GetCricketScoreboardParams): Promise<CricketScoreboardResponse> {
    await this.simulateDelay();
    const match = [...mockLiveMatches, ...mockRecentMatches].find(m => m.id === params.matchId) || mockLiveMatches[0];
    const scoreboard: CricketScoreboard = {
        matchId: match.id,
        currentInnings: 2,
        battingTeam: match.teamInfo[1],
        bowlingTeam: match.teamInfo[0],
        batsmen: [
            { playerId: 1, name: 'Batsman 1', runs: 50, balls: 30, fours: 4, sixes: 2, strikeRate: 166.6, isOut: false },
            { playerId: 2, name: 'Batsman 2', runs: 20, balls: 15, fours: 2, sixes: 0, strikeRate: 133.3, isOut: true, dismissal: 'Caught' },
        ],
        bowlers: [
            { playerId: 3, name: 'Bowler 1', overs: 4, maidens: 0, runs: 30, wickets: 2, economy: 7.5 },
        ],
        totalRuns: match.score?.[1]?.runs || 0,
        totalWickets: match.score?.[1]?.wickets || 0,
        totalOvers: match.score?.[1]?.overs || 0,
        runRate: 8.5,
    };
    return { scoreboard, matchInfo: match };
  }

  // Schedules
  async getSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> {
    await this.simulateDelay();
    return {
        schedules: [
            { date: '2024-12-14', matches: mockUpcomingMatches },
            { date: '2024-12-15', matches: mockUpcomingMatches },
        ],
        totalDays: 2
    };
  }
  async getInternationalSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> { return this.getSchedules(params); }
  async getDomesticSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> { return this.getSchedules(params); }
  async getLeagueSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> { return this.getSchedules(params); }
  async getWomenSchedules(params?: GetCricketSchedulesParams): Promise<CricketSchedulesResponse> { return this.getSchedules(params); }

  // Teams
  async getTeams(): Promise<CricketTeamsResponse> {
    await this.simulateDelay();
    return { teams: mockTeams, totalTeams: mockTeams.length };
  }
  async getInternationalTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse> { return this.getTeams(); }
  async getDomesticTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse> { return this.getTeams(); }
  async getLeagueTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse> { return this.getTeams(); }
  async getWomenTeams(params?: GetCricketTeamsParams): Promise<CricketTeamsResponse> { return this.getTeams(); }

  // Players
  async getPlayersByTeamId(params: GetCricketPlayersParams): Promise<CricketPlayersResponse> {
    await this.simulateDelay();
    const players = mockPlayers.filter(p => p.teamId === params.teamId);
    return { players, totalPlayers: players.length };
  }

  // News & Videos (Extra features for UI consistency)
  async getBlogPosts() {
    await this.simulateDelay();
    return [
      {
        _id: '1',
        title: 'Kohli Hits Another Century',
        excerpt: 'Virat Kohli smashes his 80th international century in a thrilling match against Australia.',
        content: '...',
        image: 'https://images.unsplash.com/photo-1531415074984-6a8a95d3da39?w=800',
        author: 'Cricket Fan',
        readTime: 5,
        createdAt: new Date().toISOString(),
        category: 'Cricket',
      },
      {
        _id: '2',
        title: 'IPL Auction 2025: Top Buys',
        excerpt: 'The most expensive players in this year\'s IPL auction.',
        image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800',
        author: 'Cricbuzz',
        readTime: 4,
        createdAt: new Date().toISOString(),
        category: 'Cricket',
      }
    ];
  }

  async getVideoHighlights() {
    await this.simulateDelay();
    return [
      {
        id: '1',
        title: 'Last Over Thriller: IND vs PAK',
        thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
        views: 500000,
        duration: '12:30',
        createdAt: new Date().toISOString(),
        teams: ['India', 'Pakistan'],
        description: 'Watch the nail-biting finish!',
      },
      {
        id: '2',
        title: 'Best Catches of the Tournament',
        thumbnail: 'https://images.unsplash.com/photo-1607734834519-d8576ae6058d?w=800',
        views: 300000,
        duration: '5:45',
        createdAt: new Date().toISOString(),
        teams: [],
        description: 'Gravity-defying catches from the World Cup.',
      }
    ];
  }
}

export const cricketApi = new CricketApi();

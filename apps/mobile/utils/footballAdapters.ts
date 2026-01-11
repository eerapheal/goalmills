import {
    FootballEvent,
    FootballVideo,
    FootballStanding,
    Fixture,
    VideoHighlight,
    Standing,
    MatchEvent,
    Lineup,
    FootballLeague,
    League
} from '@goalmills/types';

// Helper to parse "3 - 1" to { home: 3, away: 1 }
const parseScore = (scoreStr: string | null) => {
    if (!scoreStr) return { home: null, away: null };
    const parts = scoreStr.split('-').map(s => s.trim());
    if (parts.length !== 2) return { home: null, away: null };
    const h = parseInt(parts[0]);
    const a = parseInt(parts[1]);
    return {
        home: isNaN(h) ? null : h,
        away: isNaN(a) ? null : a
    };
};

export const mapEventToFixture = (event: FootballEvent): Fixture => {
    const goals = parseScore(event.event_final_result);
    // Use halftime result if available, otherwise null
    const halftime = parseScore(event.event_halftime_result);

    // Determine status short code
    let statusShort = 'NS';
    if (event.event_status === 'Finished') statusShort = 'FT';
    else if (event.event_status === 'Not Started') statusShort = 'NS';
    else if (event.event_status === 'Live') statusShort = 'LIVE';
    else if (!isNaN(Number(event.event_status))) statusShort = '2H'; // Assuming minutes means live
    else statusShort = event.event_status.substring(0, 3).toUpperCase();

    return {
        fixture: {
            id: parseInt(event.event_key),
            referee: event.event_referee || null,
            timezone: 'UTC',
            date: `${event.event_date}T${event.event_time}:00`,
            timestamp: new Date(`${event.event_date}T${event.event_time}:00`).getTime() / 1000,
            periods: { first: null, second: null },
            venue: {
                id: null,
                name: event.event_stadium || null,
                city: ''
            },
            status: {
                long: event.event_status,
                short: statusShort,
                elapsed: event.event_live === '1' ? 45 : null 
            }
        },
        league: {
            id: parseInt(event.league_key),
            name: event.league_name,
            country: event.country_name,
            logo: event.league_logo || '',
            flag: event.country_logo,
            season: parseInt(event.league_season), // extracting year
            round: event.league_round
        },
        teams: {
            home: {
                id: parseInt(event.home_team_key),
                name: event.event_home_team,
                logo: event.home_team_logo || '',
                winner: goals.home !== null && goals.away !== null ? goals.home > goals.away : undefined
            },
            away: {
                id: parseInt(event.away_team_key),
                name: event.event_away_team,
                logo: event.away_team_logo || '',
                winner: goals.home !== null && goals.away !== null ? goals.away > goals.home : undefined
            }
        },
        goals: {
            home: goals.home,
            away: goals.away
        },
        score: {
            halftime: { home: halftime.home, away: halftime.away },
            fulltime: { home: goals.home, away: goals.away },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null }
        }
    };
};

export const mapVideoToHighlight = (video: FootballVideo): VideoHighlight => {
    // Extract ID from youtube url if possible
    let thumbnail = 'https://via.placeholder.com/640x360';
    if (video.video_url && video.video_url.includes('embed/')) {
        const parts = video.video_url.split('embed/');
        if (parts[1]) {
           const idPart = parts[1].split('?')[0];
           thumbnail = `https://img.youtube.com/vi/${idPart}/mqdefault.jpg`;
        }
    }

    // Attempt to extract teams from title if needed
    let teams: string[] = [];
    if (video.video_title.includes(' vs ')) {
        teams = video.video_title.split(' vs ');
    } else {
        teams = [video.video_title];
    }

    return {
        id: video.event_key,
        title: video.video_title,
        thumbnail: thumbnail,
        duration: 'Highlights', // Mock or generic
        views: Math.floor(Math.random() * 50000) + 1000, // randomized views for mock feel
        date: new Date().toISOString(),
        league: {
            name: 'Football',
            logo: ''
        },
        teams: teams,
        videoUrl: video.video_url,
        description: video.video_title_full,
        createdAt: new Date().toISOString(),
    };
};

export const mapInternalVideoToHighlight = (video: any): VideoHighlight => {
  let teams: string[] = [];
  if (video.video_title.includes(' vs ')) {
      teams = video.video_title.split(' vs ');
  } else {
      teams = [video.video_title];
  }

  return {
      id: video._id,
      title: video.video_title,
      thumbnail: video.video_thumbnail || 'https://via.placeholder.com/640x360',
      duration: 'Highlights',
      views: Math.floor(Math.random() * 1000) + 50, // Randomized for UI
      date: video.createdAt,
      league: {
          name: video.category || 'Football',
          logo: ''
      },
      teams: teams,
      videoUrl: video.video_url,
      description: video.source || '',
      createdAt: video.createdAt,
  };
};

export const mapStandingToStanding = (standing: FootballStanding): Standing => {
    return {
        rank: parseInt(standing.standing_place),
        team: {
            id: parseInt(standing.team_key),
            name: standing.standing_team,
            logo: standing.team_key ? `https://crests.football-data.org/${standing.team_key}.png` : ''
        },
        points: parseInt(standing.standing_PTS),
        goalsDiff: parseInt(standing.standing_GD),
        group: standing.league_round,
        form: 'WWDLD', // Mock form
        status: '',
        description: standing.standing_place_type || '',
        all: {
            played: parseInt(standing.standing_P),
            win: parseInt(standing.standing_W),
            draw: parseInt(standing.standing_D),
            lose: parseInt(standing.standing_L),
            goals: {
                for: parseInt(standing.standing_F),
                against: parseInt(standing.standing_A)
            }
        },
        home: {
            played: parseInt(standing.standing_P) / 2, // Mock 
            win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 }
        },
        away: {
            played: parseInt(standing.standing_P) / 2, // Mock
            win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 }
        },
        update: new Date().toISOString()
    };
};

export const mapEventToMatchEvents = (event: FootballEvent): MatchEvent[] => {
    const events: MatchEvent[] = [];
    const homeTeamId = parseInt(event.home_team_key);
    const awayTeamId = parseInt(event.away_team_key);

    // Map Goals
    if (event.goalscorers) {
        event.goalscorers.forEach(g => {
            const time = parseInt(g.time.replace("'", ''));
            if (g.home_scorer) {
                events.push({
                    time: { elapsed: time, extra: null },
                    team: { id: homeTeamId, name: event.event_home_team, logo: event.home_team_logo || '' },
                    player: { id: 0, name: g.home_scorer },
                    assist: { id: 0, name: g.home_assist || '' },
                    type: 'Goal',
                    detail: 'Normal Goal',
                    comments: null
                });
            }
            if (g.away_scorer) {
                events.push({
                    time: { elapsed: time, extra: null },
                    team: { id: awayTeamId, name: event.event_away_team, logo: event.away_team_logo || '' },
                    player: { id: 0, name: g.away_scorer },
                    assist: { id: 0, name: g.away_assist || '' },
                    type: 'Goal',
                    detail: 'Normal Goal',
                    comments: null
                });
            }
        });
    }

    // Map Cards
    if (event.cards) {
        event.cards.forEach(c => {
             const time = parseInt(c.time.replace("'", ''));
             const cardType = c.card === 'yellow card' ? 'Card' : 'Card'; 
             const detail = c.card === 'yellow card' ? 'Yellow Card' : 'Red Card';
             
             if (c.home_fault) {
                 events.push({
                    time: { elapsed: time, extra: null },
                    team: { id: homeTeamId, name: event.event_home_team, logo: event.home_team_logo || '' },
                    player: { id: 0, name: c.home_fault },
                    assist: { id: 0, name: '' },
                    type: cardType,
                    detail: detail,
                    comments: null
                 });
             }
             if (c.away_fault) {
                 events.push({
                    time: { elapsed: time, extra: null },
                    team: { id: awayTeamId, name: event.event_away_team, logo: event.away_team_logo || '' },
                    player: { id: 0, name: c.away_fault },
                    assist: { id: 0, name: '' },
                    type: cardType,
                    detail: detail,
                    comments: null
                 });
             }
        });
    }

    return events.sort((a, b) => (a.time.elapsed || 0) - (b.time.elapsed || 0));
};

export const mapLineupsToLineups = (event: FootballEvent): Lineup[] => {
    if (!event.lineups) return [];
    
    // Helper to map team data
    const mapTeamLineup = (teamData: any, teamName: string, teamId: number, teamLogo: string, formation: string): Lineup => {
        return {
            team: { id: teamId, name: teamName, logo: teamLogo, colors: null },
            formation: formation,
            startXI: teamData.starting_lineups.map((p: any) => ({
                player: {
                    id: parseInt(p.player_key) || 0,
                    name: p.player,
                    number: parseInt(p.player_number) || 0,
                    pos: p.player_position ? p.player_position.charAt(0) : '?',
                    grid: null
                }
            })),
            substitutes: teamData.substitutes.map((p: any) => ({
                player: {
                     id: parseInt(p.player_key) || 0,
                    name: p.player,
                    number: parseInt(p.player_number) || 0,
                    pos: p.player_position ? p.player_position.charAt(0) : '?',
                    grid: null
                }
            })),
            coach: {
                id: 0,
                name: teamData.coaches?.[0]?.coache || 'Unknown',
                photo: ''
            }
        };
    };

    const homeLineup = mapTeamLineup(event.lineups.home_team, event.event_home_team, parseInt(event.home_team_key), event.home_team_logo || '', event.event_home_formation || '');
    const awayLineup = mapTeamLineup(event.lineups.away_team, event.event_away_team, parseInt(event.away_team_key), event.away_team_logo || '', event.event_away_formation || '');

    return [homeLineup, awayLineup];
};

export const mapLeagueToLeague = (league: FootballLeague): League => {
    return {
        id: parseInt(league.league_key),
        name: league.league_name,
        type: 'League',
        logo: league.league_logo,
        country: league.country_name,
        flag: league.country_logo
    };
};

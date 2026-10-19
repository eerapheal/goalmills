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
  League,
} from '@goalmills/types';
import { getLeagueShortName } from '../lib/football/topLeagues';

// Helper to safely parse string/number to int with fallback
const toInt = (val: string | number | undefined | null, fallback = 0): number => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : Math.floor(val);
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? fallback : parsed;
};

// Helper to parse "3 - 1" to { home: 3, away: 1 }
const parseScore = (scoreStr?: string | null) => {
  if (!scoreStr) return { home: null, away: null };
  const parts = scoreStr.split('-').map((s) => s.trim());
  if (parts.length !== 2) return { home: null, away: null };
  const h = parseInt(parts[0], 10);
  const a = parseInt(parts[1], 10);
  return {
    home: isNaN(h) ? null : h,
    away: isNaN(a) ? null : a,
  };
};

export const mapEventToFixture = (event: FootballEvent): Fixture => {
  const goals = parseScore(event.event_final_result);
  const halftime = parseScore(event.event_halftime_result);

  // Determine status short code
  const statusStr = event.event_status || 'Not Started';
  let statusShort = 'NS';
  if (statusStr === 'Finished') statusShort = 'FT';
  else if (statusStr === 'Not Started') statusShort = 'NS';
  else if (statusStr === 'Live') statusShort = 'LIVE';
  else if (!isNaN(Number(statusStr)))
    statusShort = '2H'; // Assuming minutes means live
  else statusShort = statusStr.substring(0, 3).toUpperCase();

  const rawLeagueName = event.league_name || 'Football';
  const country = (event.country_name || '').trim();
  const isGenericPL =
    rawLeagueName.toLowerCase() === 'premier league' && country.toLowerCase() !== 'england';
  const disambiguatedLeagueName =
    isGenericPL && country ? `${country} Premier League` : rawLeagueName;

  const eventDate = event.event_date || '';
  const eventTime = event.event_time || '00:00';
  const isoDate = eventDate ? `${eventDate}T${eventTime}:00` : new Date().toISOString();
  const timestamp = eventDate ? new Date(isoDate).getTime() / 1000 : 0;

  return {
    fixture: {
      id: toInt(event.event_key),
      referee: event.event_referee || null,
      timezone: 'UTC',
      date: isoDate,
      timestamp,
      periods: { first: null, second: null },
      venue: {
        id: null,
        name: event.event_stadium || null,
        city: '',
      },
      status: {
        long: statusStr,
        short: statusShort,
        elapsed: event.event_live === '1' ? 45 : null,
      },
    },
    league: {
      id: toInt(event.league_key),
      name: disambiguatedLeagueName,
      country: event.country_name || '',
      logo: event.league_logo || '',
      flag: event.country_logo,
      season: toInt(event.league_season, new Date().getFullYear()),
      round: event.league_round || '',
    },
    teams: {
      home: {
        id: toInt(event.home_team_key),
        name: event.event_home_team || 'Home',
        logo: event.home_team_logo || '',
        winner: goals.home !== null && goals.away !== null ? goals.home > goals.away : undefined,
      },
      away: {
        id: toInt(event.away_team_key),
        name: event.event_away_team || 'Away',
        logo: event.away_team_logo || '',
        winner: goals.home !== null && goals.away !== null ? goals.away > goals.home : undefined,
      },
    },
    goals: {
      home: goals.home,
      away: goals.away,
    },
    score: {
      halftime: { home: halftime.home, away: halftime.away },
      fulltime: { home: goals.home, away: goals.away },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
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
    duration: 'Highlights',
    views: Math.floor(Math.random() * 50000) + 1000,
    date: new Date().toISOString(),
    league: {
      name: 'Football',
      logo: '',
    },
    teams: teams,
    videoUrl: video.video_url,
    description: video.video_title_full,
    createdAt: new Date().toISOString(),
  };
};

export const mapInternalVideoToHighlight = (video: any): VideoHighlight => {
  let teams: string[] = [];
  if (video.video_title && video.video_title.includes(' vs ')) {
    teams = video.video_title.split(' vs ');
  } else {
    teams = [video.video_title || 'Match'];
  }

  let thumb = video.video_thumbnail;
  if (!thumb && video.video_url) {
    const match = video.video_url.match(
      /(?:youtu\.be\/|watch\?v=|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/
    );
    if (match && match[1]) {
      thumb = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }

  const leagueStr = video.league || video.category || 'Football';

  return {
    id: video._id ? video._id.toString() : video.id,
    title: video.video_title || 'Match Highlight',
    thumbnail: thumb || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
    duration: video.duration || 'HD Replay',
    views: typeof video.views === 'number' ? video.views : 0,
    date: video.createdAt,
    league: {
      name: leagueStr,
      logo: '',
    },
    matchInfo: {
      league: leagueStr,
      date: video.createdAt
        ? new Date(video.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : undefined,
    } as any,
    teams: teams,
    videoUrl: video.video_url,
    description: video.video_description || video.source || '',
    createdAt: video.createdAt,
  };
};

export const mapStandingToStanding = (standing: FootballStanding): Standing => {
  return {
    rank: toInt(standing.standing_place),
    team: {
      id: toInt(standing.team_key),
      name: standing.standing_team,
      logo: standing.team_key ? `https://crests.football-data.org/${standing.team_key}.png` : '',
    },
    points: toInt(standing.standing_PTS),
    goalsDiff: toInt(standing.standing_GD),
    group: standing.league_round,
    form: 'WWDLD',
    status: '',
    description: standing.standing_place_type || '',
    all: {
      played: toInt(standing.standing_P),
      win: toInt(standing.standing_W),
      draw: toInt(standing.standing_D),
      lose: toInt(standing.standing_L),
      goals: {
        for: toInt(standing.standing_F),
        against: toInt(standing.standing_A),
      },
    },
    home: {
      played: toInt(standing.standing_P) / 2,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    away: {
      played: toInt(standing.standing_P) / 2,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    update: new Date().toISOString(),
  };
};

export const mapEventToMatchEvents = (event: FootballEvent): MatchEvent[] => {
  const events: MatchEvent[] = [];
  const homeTeamId = toInt(event.home_team_key);
  const awayTeamId = toInt(event.away_team_key);

  // Map Goals
  if (event.goalscorers) {
    event.goalscorers.forEach((g) => {
      const time = parseInt(g.time.replace("'", ''), 10) || 0;
      if (g.home_scorer) {
        events.push({
          time: { elapsed: time, extra: null },
          team: { id: homeTeamId, name: event.event_home_team, logo: event.home_team_logo || '' },
          player: { id: 0, name: g.home_scorer },
          assist: { id: 0, name: g.home_assist || '' },
          type: 'Goal',
          detail: 'Normal Goal',
          comments: null,
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
          comments: null,
        });
      }
    });
  }

  // Map Cards
  if (event.cards) {
    event.cards.forEach((c) => {
      const time = parseInt(c.time.replace("'", ''), 10) || 0;
      const cardType = 'Card';
      const detail = c.card === 'yellow card' ? 'Yellow Card' : 'Red Card';

      if (c.home_fault) {
        events.push({
          time: { elapsed: time, extra: null },
          team: { id: homeTeamId, name: event.event_home_team, logo: event.home_team_logo || '' },
          player: { id: 0, name: c.home_fault },
          assist: { id: 0, name: '' },
          type: cardType,
          detail: detail,
          comments: null,
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
          comments: null,
        });
      }
    });
  }

  return events.sort((a, b) => (a.time.elapsed || 0) - (b.time.elapsed || 0));
};

export const mapLineupsToLineups = (event: FootballEvent): Lineup[] => {
  if (!event.lineups) return [];

  const mapTeamLineup = (
    teamData: any,
    teamName: string,
    teamId: number,
    teamLogo: string,
    formation: string
  ): Lineup => {
    return {
      team: { id: teamId, name: teamName, logo: teamLogo, colors: null },
      formation: formation,
      startXI: (teamData?.starting_lineups || []).map((p: any) => ({
        player: {
          id: toInt(p.player_key),
          name: p.player,
          number: toInt(p.player_number),
          pos: p.player_position ? p.player_position.charAt(0) : '?',
          grid: null,
        },
      })),
      substitutes: (teamData?.substitutes || []).map((p: any) => ({
        player: {
          id: toInt(p.player_key),
          name: p.player,
          number: toInt(p.player_number),
          pos: p.player_position ? p.player_position.charAt(0) : '?',
          grid: null,
        },
      })),
      coach: {
        id: 0,
        name: teamData?.coaches?.[0]?.coache || 'Unknown',
        photo: '',
      },
    };
  };

  const homeLineup = mapTeamLineup(
    event.lineups.home_team,
    event.event_home_team,
    toInt(event.home_team_key),
    event.home_team_logo || '',
    event.event_home_formation || ''
  );
  const awayLineup = mapTeamLineup(
    event.lineups.away_team,
    event.event_away_team,
    toInt(event.away_team_key),
    event.away_team_logo || '',
    event.event_away_formation || ''
  );

  return [homeLineup, awayLineup];
};

export const mapLeagueToLeague = (league: FootballLeague): League => {
  const rawLeagueName = league.league_name || 'Football';
  const country = (league.country_name || '').trim();
  const isGenericPL =
    rawLeagueName.toLowerCase() === 'premier league' && country.toLowerCase() !== 'england';
  const disambiguatedLeagueName =
    isGenericPL && country ? `${country} Premier League` : rawLeagueName;

  return {
    id: toInt(league.league_key),
    name: disambiguatedLeagueName,
    type: 'League',
    logo: league.league_logo,
    country: league.country_name || '',
    flag: league.country_logo,
  };
};

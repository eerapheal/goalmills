import type { UnifiedMatch, UnifiedStanding, MatchStatus, MatchPeriod, UnifiedTeam, UnifiedCompetition } from '../domain/types';

export function normalizeFootballPeriod(rawStatus: string): { status: MatchStatus; period?: MatchPeriod } {
  const s = (rawStatus || '').toUpperCase().trim();
  switch (s) {
    case '1H':
    case 'FIRST_HALF':
      return { status: 'LIVE', period: 'FIRST_HALF' };
    case 'HT':
    case 'HALF_TIME':
      return { status: 'HT', period: 'HALF_TIME' };
    case '2H':
    case 'SECOND_HALF':
      return { status: 'LIVE', period: 'SECOND_HALF' };
    case 'ET':
    case 'EXTRA_TIME':
      return { status: 'AET', period: 'EXTRA_TIME' };
    case 'PEN':
    case 'PENALTIES':
      return { status: 'PEN', period: 'PENALTIES' };
    case 'FT':
    case 'FINISHED':
    case 'AET_FT':
      return { status: 'FT', period: 'FULL_TIME' };
    case 'POSTP':
    case 'PPD':
    case 'POSTPONED':
      return { status: 'PPD' };
    case 'CANC':
    case 'CANCELLED':
      return { status: 'CANC' };
    case 'IN_PLAY':
    case 'LIVE':
      return { status: 'LIVE' };
    default:
      return { status: 'UPCOMING', period: 'PRE_MATCH' };
  }
}

export function normalizeFootballMatch(raw: any): UnifiedMatch {
  const { status, period } = normalizeFootballPeriod(raw.status || raw.event_status);
  const homeScore = Number(raw.homeScore ?? raw.event_final_result?.split('-')?.[0] ?? 0);
  const awayScore = Number(raw.awayScore ?? raw.event_final_result?.split('-')?.[1] ?? 0);
  const id = String(raw.id || raw.event_key || 'match_unknown');

  const competition: UnifiedCompetition = {
    id: String(raw.competitionId || raw.league_key || 'comp_unknown'),
    name: raw.competitionName || raw.league_name || 'Unknown League',
    slug: (raw.competitionSlug || raw.league_name || 'unknown').toLowerCase().replace(/\s+/g, '-'),
    sport: 'football',
    category: raw.country || raw.country_name || 'International',
    country: raw.country || raw.country_name,
  };

  const homeTeam: UnifiedTeam = {
    id: String(raw.homeTeamId || raw.home_team_key || 'home'),
    name: raw.homeTeamName || raw.event_home_team || 'Home Team',
    shortName: raw.homeTeamShort,
    logo: raw.homeTeamLogo || raw.home_team_logo || '',
  };

  const awayTeam: UnifiedTeam = {
    id: String(raw.awayTeamId || raw.away_team_key || 'away'),
    name: raw.awayTeamName || raw.event_away_team || 'Away Team',
    shortName: raw.awayTeamShort,
    logo: raw.awayTeamLogo || raw.away_team_logo || '',
  };

  const dateStr = raw.date || raw.event_date || new Date().toISOString().slice(0, 10);
  const startTime = raw.startTime || raw.event_time ? `${dateStr}T${raw.event_time || '00:00:00'}Z` : new Date().toISOString();

  return {
    id,
    canonicalId: `football:${id}`,
    sport: 'football',
    status,
    period,
    minute: raw.minute ? Number(raw.minute) : null,
    startTime,
    date: dateStr,
    competition,
    homeTeam,
    awayTeam,
    score: {
      home: isNaN(homeScore) ? 0 : homeScore,
      away: isNaN(awayScore) ? 0 : awayScore,
      minute: raw.minute ? Number(raw.minute) : null,
    },
    provider: raw.provider || 'allsports',
    providerEventId: id,
    lastUpdated: new Date().toISOString(),
  };
}

export function normalizeFootballStanding(raw: any, rank: number): UnifiedStanding {
  const team: UnifiedTeam = {
    id: String(raw.teamId || raw.standing_team_key || `team_${rank}`),
    name: raw.teamName || raw.standing_team || 'Team',
    logo: raw.teamLogo || raw.standing_team_logo || '',
  };

  return {
    position: Number(raw.position || raw.rank || raw.standing_place || rank),
    team,
    played: Number(raw.played || raw.standing_P || 0),
    won: Number(raw.won || raw.standing_W || 0),
    drawn: Number(raw.drawn || raw.standing_D || 0),
    lost: Number(raw.lost || raw.standing_L || 0),
    goalsFor: Number(raw.goalsFor || raw.standing_F || 0),
    goalsAgainst: Number(raw.goalsAgainst || raw.standing_A || 0),
    goalDifference: Number(raw.goalDifference || raw.standing_GD || 0),
    points: Number(raw.points || raw.standing_PTS || 0),
    form: typeof raw.form === 'string' ? raw.form.split('') : raw.form,
  };
}

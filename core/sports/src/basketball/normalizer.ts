import type { UnifiedMatch, UnifiedTeam, UnifiedCompetition, MatchStatus, MatchPeriod } from '../domain/types';

export function normalizeBasketballMatch(raw: any): UnifiedMatch {
  const isFinished = raw.status === 'FT' || raw.status === 'finished' || raw.status === 'AOT';
  const isLive = !isFinished && /Q1|Q2|Q3|Q4|OT|live|LIVE/i.test(raw.status || '');
  const status: MatchStatus = isFinished ? 'FT' : isLive ? 'LIVE' : 'UPCOMING';
  const period: MatchPeriod | undefined = isLive ? 'Q1' : isFinished ? 'FULL_TIME' : 'PRE_MATCH';

  const homeScore = Number(raw.homeScore || raw.event_final_result?.split('-')?.[0] || 0);
  const awayScore = Number(raw.awayScore || raw.event_final_result?.split('-')?.[1] || 0);
  const id = String(raw.id || raw.event_key || 'basketball_unknown');

  const competition: UnifiedCompetition = {
    id: String(raw.competitionId || raw.league_key || 'comp_basketball'),
    name: raw.competitionName || raw.league_name || 'Basketball League',
    slug: (raw.competitionName || raw.league_name || 'basketball-league').toLowerCase().replace(/\s+/g, '-'),
    sport: 'basketball',
    category: raw.country || 'International',
  };

  const homeTeam: UnifiedTeam = {
    id: String(raw.homeTeamId || raw.home_team_key || 'home'),
    name: raw.homeTeamName || raw.event_home_team || 'Home Team',
    logo: raw.homeTeamLogo || raw.home_team_logo || '',
  };

  const awayTeam: UnifiedTeam = {
    id: String(raw.awayTeamId || raw.away_team_key || 'away'),
    name: raw.awayTeamName || raw.event_away_team || 'Away Team',
    logo: raw.awayTeamLogo || raw.away_team_logo || '',
  };

  const dateStr = raw.date || raw.event_date || new Date().toISOString().slice(0, 10);
  const startTime = raw.startTime || raw.event_time ? `${dateStr}T${raw.event_time || '00:00:00'}Z` : new Date().toISOString();

  return {
    id,
    canonicalId: `basketball:${id}`,
    sport: 'basketball',
    status,
    period,
    startTime,
    date: dateStr,
    competition,
    homeTeam,
    awayTeam,
    score: {
      home: homeScore,
      away: awayScore,
    },
    provider: raw.provider || 'allsports',
    providerEventId: id,
    lastUpdated: new Date().toISOString(),
  };
}

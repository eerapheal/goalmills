import type { UnifiedMatch, UnifiedTeam, UnifiedCompetition, MatchStatus, MatchPeriod } from '../domain/types';

export function normalizeCricketMatch(raw: any): UnifiedMatch {
  const isFinished = raw.status === 'FT' || raw.status === 'finished' || /won by|drawn|abandoned/i.test(raw.statusMessage || '');
  const isLive = !isFinished && /in_play|live|innings|LIVE/i.test(raw.status || '');
  const status: MatchStatus = isFinished ? 'FT' : isLive ? 'LIVE' : 'UPCOMING';
  const period: MatchPeriod | undefined = isLive ? 'INNINGS_1' : isFinished ? 'FULL_TIME' : 'PRE_MATCH';

  const homeScore = Number(raw.homeScore || raw.team1?.score || 0);
  const awayScore = Number(raw.awayScore || raw.team2?.score || 0);
  const id = String(raw.id || raw.matchId || 'cricket_unknown');

  const competition: UnifiedCompetition = {
    id: String(raw.seriesId || raw.competitionId || 'cricket_series'),
    name: raw.seriesName || raw.competitionName || 'Cricket Series',
    slug: (raw.seriesName || 'cricket-series').toLowerCase().replace(/\s+/g, '-'),
    sport: 'cricket',
    category: 'International',
  };

  const homeTeam: UnifiedTeam = {
    id: String(raw.team1?.id || raw.homeTeamId || 'team1'),
    name: raw.team1?.name || raw.homeTeamName || 'Team 1',
    shortName: raw.team1?.shortName,
    logo: raw.team1?.logo || '',
  };

  const awayTeam: UnifiedTeam = {
    id: String(raw.team2?.id || raw.awayTeamId || 'team2'),
    name: raw.team2?.name || raw.awayTeamName || 'Team 2',
    shortName: raw.team2?.shortName,
    logo: raw.team2?.logo || '',
  };

  const dateStr = raw.date || new Date().toISOString().slice(0, 10);
  const startTime = raw.startTime || raw.matchDate || new Date().toISOString();

  return {
    id,
    canonicalId: `cricket:${id}`,
    sport: 'cricket',
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
    provider: raw.provider || 'cricbuzz',
    providerEventId: id,
    lastUpdated: new Date().toISOString(),
  };
}

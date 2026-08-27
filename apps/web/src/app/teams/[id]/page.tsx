'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import {
  FootballTeam,
  FootballLeague,
  FootballPlayer,
  FootballEvent,
  FootballStanding,
} from '@goalmills/types';
import { BackButton } from '../../../components/BackButton';

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<FootballTeam | null>(null);
  const [players, setPlayers] = useState<FootballPlayer[]>([]);
  const [recentMatches, setRecentMatches] = useState<FootballEvent[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<FootballEvent[]>([]);
  const [standing, setStanding] = useState<FootballStanding | null>(null);
  const [leagueName, setLeagueName] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (!teamId) return;

      try {
        // Fetch team, players, and fixtures
        const [teamsRes, playersRes, fixturesRes] = await Promise.all([
          advancedFootballApi.getTeams({ teamId }),
          advancedFootballApi.getPlayers({ teamId }),
          advancedFootballApi.getFixtures({ teamId }),
        ]);

        if (teamsRes.result && teamsRes.result.length > 0) {
          setTeam(teamsRes.result[0]);
        }
        setPlayers(playersRes.result || []);

        // Process fixtures
        if (fixturesRes.result) {
          const allMatches = fixturesRes.result;
          const now = new Date();

          // Sort matches by date
          const sortedMatches = allMatches.sort((a, b) => {
            return (
              new Date(`${a.event_date} ${a.event_time}`).getTime() -
              new Date(`${b.event_date} ${b.event_time}`).getTime()
            );
          });

          const finished = sortedMatches
            .filter(
              (m) =>
                m.event_status === 'Finished' || new Date(`${m.event_date} ${m.event_time}`) < now
            )
            .reverse(); // Most recent first

          const upcoming = sortedMatches.filter(
            (m) =>
              m.event_status !== 'Finished' && new Date(`${m.event_date} ${m.event_time}`) > now
          );

          setRecentMatches(finished.slice(0, 5));
          setUpcomingMatches(upcoming.slice(0, 5));

          // Get standings if we have a league context from matches
          if (finished.length > 0 || upcoming.length > 0) {
            const leagueId = Number(finished[0]?.league_key || upcoming[0]?.league_key);
            if (leagueId) {
              setLeagueName(finished[0]?.league_name || upcoming[0]?.league_name || '');
              const standingsRes = await advancedFootballApi.getStandings(leagueId);
              if (standingsRes.result && standingsRes.result.total) {
                const teamStanding = standingsRes.result.total.find(
                  (s) => s.team_key === String(teamId)
                );
                if (teamStanding) setStanding(teamStanding);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teamId]);

  const getFormBadge = (match: FootballEvent) => {
    const isHome = match.home_team_key === String(teamId);
    const homeScore = parseInt(match.event_final_result.split(' - ')[0] || '0');
    const awayScore = parseInt(match.event_final_result.split(' - ')[1] || '0');

    let result: 'W' | 'D' | 'L' = 'D';
    if (isHome) {
      if (homeScore > awayScore) result = 'W';
      else if (homeScore < awayScore) result = 'L';
    } else {
      if (awayScore > homeScore) result = 'W';
      else if (awayScore < homeScore) result = 'L';
    }

    const colors = {
      W: 'bg-accent-green text-black',
      D: 'bg-gray-500 text-white',
      L: 'bg-accent-red text-white',
    };

    return (
      <div
        key={match.event_key}
        className={`w-8 h-8 rounded-full ${colors[result]} flex items-center justify-center font-bold text-xs border border-white/10`}
      >
        {result}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-[90px] p-4">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-48 bg-surfaceHighlight/30 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-64 bg-surfaceHighlight/30 rounded-xl" />
              <div className="h-96 bg-surfaceHighlight/30 rounded-xl" />
            </div>
            <div className="space-y-4">
              <div className="h-96 bg-surfaceHighlight/30 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Team Not Found</h1>
        <BackButton className="mt-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[90px] pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 pt-12 pb-8 px-4 relative overflow-hidden">
        <BackButton className="absolute top-4 left-4 z-20" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <img
            src={team.team_logo}
            alt=""
            className="object-cover blur-3xl scale-150 w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 relative drop-shadow-2xl bg-white/10 rounded-full p-4 shrink-0 backdrop-blur-sm border border-white/10">
            <img
              src={team.team_logo}
              alt={team.team_name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">{team.team_name}</h1>
            {leagueName && <p className="text-text-secondary text-lg font-medium">{leagueName}</p>}
          </div>

          {/* Team Form */}
          {recentMatches.length > 0 && (
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-sm font-bold text-text-muted uppercase tracking-wider">
                Recent Form
              </span>
              <div className="flex gap-2">
                {recentMatches
                  .slice(0, 5)
                  .reverse()
                  .map((match) => getFormBadge(match))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Standings & Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Standings Card */}
          {standing && (
            <div className="lg:col-span-1 bg-surface rounded-xl p-6 border border-white/5 h-full">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🏆</span> League Position
              </h2>
              <div className="flex items-center justify-around h-full pb-6">
                <div className="text-center">
                  <span className="block text-4xl font-black text-secondary mb-1">
                    #{standing.standing_place}
                  </span>
                  <span className="text-sm text-text-muted">Rank</span>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div className="text-center">
                  <span className="block text-4xl font-black text-white mb-1">
                    {standing.standing_PTS}
                  </span>
                  <span className="text-sm text-text-muted">Points</span>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div className="text-center">
                  <span className="block text-4xl font-black text-white mb-1">
                    {standing.standing_P}
                  </span>
                  <span className="text-sm text-text-muted">Played</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats or Next Match could go here, for now keeping it simple or expanding upcoming matches */}

          {/* Recent Results List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white">Recent Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentMatches.map((match, index) => (
                <Link
                  href={`/matches/${match.event_key}`}
                  key={`recent-${match.event_key}-${index}`}
                  className="bg-surface p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors flex items-center justify-between group"
                >
                  <div className="flex flex-col items-center w-12 text-xs text-text-muted">
                    <span className="font-bold">
                      {new Date(match.event_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>{match.league_round.replace('Round ', 'R')}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span
                        className={`font-bold text-sm text-right ${match.home_team_key === String(teamId) ? 'text-white' : 'text-text-muted'}`}
                      >
                        {match.event_home_team}
                      </span>
                      <img src={match.home_team_logo} className="w-6 h-6 object-contain" />
                    </div>
                    <div className="px-3 py-1 bg-background rounded-lg font-mono font-bold text-white mx-2">
                      {match.event_final_result}
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-start">
                      <img src={match.away_team_logo} className="w-6 h-6 object-contain" />
                      <span
                        className={`font-bold text-sm ${match.away_team_key === String(teamId) ? 'text-white' : 'text-text-muted'}`}
                      >
                        {match.event_away_team}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Fixtures */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Fixtures</h2>
          {upcomingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMatches.map((match, index) => (
                <Link
                  href={`/matches/${match.event_key}`}
                  key={`upcoming-${match.event_key}-${index}`}
                  className="bg-surface p-5 rounded-xl border border-white/5 hover:border-secondary/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-50">
                    <img src={match.league_logo} className="w-8 h-8 opacity-20 grayscale" />
                  </div>
                  <div className="text-xs font-bold text-secondary mb-3 uppercase tracking-wider">
                    {new Date(match.event_date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    • {match.event_time}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <img src={match.home_team_logo} className="w-8 h-8 object-contain" />
                      <span className="font-bold text-white">{match.event_home_team}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={match.away_team_logo} className="w-8 h-8 object-contain" />
                      <span className="font-bold text-white">{match.event_away_team}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-text-muted italic">No upcoming matches scheduled.</div>
          )}
        </div>

        {/* Squad */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Squad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <Link
                href={`/players/${player.player_key}`}
                key={player.player_key}
                className="glass-card p-4 rounded-xl flex items-center gap-4 hover:bg-surfaceHighlight/50 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full overflow-hidden shrink-0">
                  <img
                    src={player.player_image}
                    alt={player.player_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-secondary transition-colors">
                    {player.player_name}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {player.player_type} • #{player.player_number}
                  </p>
                </div>
              </Link>
            ))}
            {players.length === 0 && (
              <p className="text-text-muted col-span-full text-center py-8">
                No players found for this team.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

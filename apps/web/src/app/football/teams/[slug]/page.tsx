'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { advancedFootballApi } from '@/services/advancedFootballApi';
import { footballRoutes, slugify, buildMatchSlug } from '@/lib/slugUtils';
import { BackButton } from '@/components/BackButton';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import type {
  FootballTeam,
  FootballPlayer,
  FootballEvent,
  FootballStanding,
} from '@goalmills/types';

type TeamTab = 'overview' | 'squad' | 'fixtures' | 'results' | 'stats';

export default function FootballTeamPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TeamTab>('overview');
  const [team, setTeam] = useState<FootballTeam | null>(null);
  const [players, setPlayers] = useState<FootballPlayer[]>([]);
  const [recentMatches, setRecentMatches] = useState<FootballEvent[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<FootballEvent[]>([]);
  const [standing, setStanding] = useState<FootballStanding | null>(null);
  const [leagueName, setLeagueName] = useState('');

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true);

        // First try to find team by name (slugify matching)
        const teamsRes = await advancedFootballApi.getTeams({ teamName: slug.replace(/-/g, ' ') });
        let teamData: FootballTeam | null = null;
        let teamId: number | null = null;

        if (teamsRes?.result && teamsRes.result.length > 0) {
          // Find best match by slug
          const bestMatch = teamsRes.result.find(
            (t: FootballTeam) => slugify(t.team_name) === slug
          ) || teamsRes.result[0];
          teamData = bestMatch;
          teamId = Number(bestMatch.team_key);
        }

        if (!teamData || !teamId) {
          setLoading(false);
          return;
        }

        setTeam(teamData);

        // Fetch players and fixtures in parallel
        const [playersRes, fixturesRes] = await Promise.all([
          advancedFootballApi.getPlayers({ teamId }),
          advancedFootballApi.getFixtures({ teamId }),
        ]);

        setPlayers(playersRes?.result || []);

        if (fixturesRes?.result) {
          const now = new Date();
          const sorted = (fixturesRes.result as FootballEvent[]).sort(
            (a, b) =>
              new Date(`${a.event_date} ${a.event_time}`).getTime() -
              new Date(`${b.event_date} ${b.event_time}`).getTime()
          );

          const finished = sorted
            .filter(m => m.event_status === 'Finished' || m.event_status === 'FT' || new Date(`${m.event_date} ${m.event_time}`) < now)
            .reverse();

          const upcoming = sorted.filter(
            m => m.event_status !== 'Finished' && m.event_status !== 'FT' && new Date(`${m.event_date} ${m.event_time}`) > now
          );

          setRecentMatches(finished.slice(0, 10));
          setUpcomingMatches(upcoming.slice(0, 10));

          // Get league standings
          const firstMatch = finished[0] || upcoming[0];
          if (firstMatch?.league_key) {
            setLeagueName(firstMatch.league_name || '');
            try {
              const standingsRes = await advancedFootballApi.getStandings(Number(firstMatch.league_key));
              if (standingsRes?.result) {
                const resObj = standingsRes.result as any;
                const table = Array.isArray(resObj) ? resObj : resObj.total || [];
                const ts = table.find(
                  (s: FootballStanding) => s && String(s.team_key) === String(teamId)
                );
                if (ts) setStanding(ts);
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error('Error loading team:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadTeam();
  }, [slug]);

  const tabs: { id: TeamTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'squad', label: 'Squad', icon: '👥' },
    { id: 'fixtures', label: 'Fixtures', icon: '📅' },
    { id: 'results', label: 'Results', icon: '✅' },
    { id: 'stats', label: 'Stats', icon: '📊' },
  ];

  const getFormBadge = (match: FootballEvent) => {
    const isHome = slugify(match.event_home_team || '') === slug;
    const parts = (match.event_final_result || '0 - 0').split(' - ');
    const homeScore = parseInt(parts[0] || '0');
    const awayScore = parseInt(parts[1] || '0');
    let result: 'W' | 'D' | 'L' = 'D';
    if (isHome) {
      if (homeScore > awayScore) result = 'W';
      else if (homeScore < awayScore) result = 'L';
    } else {
      if (awayScore > homeScore) result = 'W';
      else if (awayScore < homeScore) result = 'L';
    }
    const colors = { W: 'bg-emerald-500 text-black', D: 'bg-gray-500 text-white', L: 'bg-red-500 text-white' };
    return (
      <div className={`w-7 h-7 rounded-full ${colors[result]} flex items-center justify-center font-bold text-[10px] border border-white/10`}>
        {result}
      </div>
    );
  };

  // Group players by position
  const playersByPosition = useMemo(() => {
    const groups: Record<string, FootballPlayer[]> = {};
    players.forEach(p => {
      const pos = p.player_type || 'Other';
      if (!groups[pos]) groups[pos] = [];
      groups[pos].push(p);
    });
    return groups;
  }, [players]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex items-center justify-center">
        <GoalmillsLoader />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Team Not Found</h1>
        <p className="text-slate-400 mb-6">Could not find a team matching &quot;{slug.replace(/-/g, ' ')}&quot;</p>
        <BackButton className="mt-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a1a] pt-[90px] pb-20">
      {/* Team Header */}
      <div className="bg-gradient-to-b from-[#0B1526] to-[#070a1a] border-b border-white/5 pt-12 pb-8 px-4 relative overflow-hidden">
        <BackButton className="absolute top-4 left-4 z-20" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <img src={team.team_logo} alt="" className="object-cover blur-3xl scale-150 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070a1a] via-transparent to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative drop-shadow-2xl bg-white/10 rounded-2xl p-3 shrink-0 backdrop-blur-sm border border-white/10">
            <img src={team.team_logo} alt={team.team_name} className="w-full h-full object-contain" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">{team.team_name}</h1>
            {leagueName && <p className="text-slate-300 text-sm font-medium">{leagueName}</p>}
          </div>

          {/* Team Form */}
          {recentMatches.length > 0 && (
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Form</span>
              <div className="flex gap-1.5">
                {recentMatches.slice(0, 5).reverse().map((m, i) => (
                  <React.Fragment key={`form-${i}`}>{getFormBadge(m)}</React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Standing Mini-Stats */}
        {standing && (
          <div className="max-w-4xl mx-auto mt-6 flex items-center justify-center gap-6 text-center">
            <div>
              <span className="block text-2xl font-black text-amber-400">#{standing.standing_place}</span>
              <span className="text-[10px] text-slate-400">Position</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="block text-2xl font-black text-white">{standing.standing_PTS}</span>
              <span className="text-[10px] text-slate-400">Points</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="block text-2xl font-black text-white">{standing.standing_P}</span>
              <span className="text-[10px] text-slate-400">Played</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="block text-2xl font-black text-emerald-400">{standing.standing_W}</span>
              <span className="text-[10px] text-slate-400">Won</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="block text-2xl font-black text-red-400">{standing.standing_L}</span>
              <span className="text-[10px] text-slate-400">Lost</span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[64px] z-30 bg-[#070a1a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center gap-1 overflow-x-auto px-4 py-2 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Upcoming */}
            {upcomingMatches.length > 0 && (
              <section>
                <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <span>📅</span> Next Fixtures
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingMatches.slice(0, 4).map((m, i) => (
                    <Link
                      key={`up-${m.event_key}-${i}`}
                      href={footballRoutes.matchFromEvent(m)}
                      className="p-4 rounded-2xl bg-[#0B1526]/50 border border-white/5 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="text-[10px] text-amber-400 font-bold uppercase mb-2">
                        {new Date(m.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {m.event_time}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {m.home_team_logo && <img src={m.home_team_logo} className="w-6 h-6 object-contain" alt="" />}
                          <span className="text-xs font-bold text-white">{m.event_home_team}</span>
                        </div>
                        <span className="text-slate-500 text-xs">vs</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{m.event_away_team}</span>
                          {m.away_team_logo && <img src={m.away_team_logo} className="w-6 h-6 object-contain" alt="" />}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Results */}
            {recentMatches.length > 0 && (
              <section>
                <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <span>✅</span> Recent Results
                </h2>
                <div className="space-y-2">
                  {recentMatches.slice(0, 5).map((m, i) => (
                    <Link
                      key={`rec-${m.event_key}-${i}`}
                      href={footballRoutes.matchFromEvent(m)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#0B1526]/50 border border-white/5 hover:border-blue-500/30 transition-all"
                    >
                      <div className="text-[10px] text-slate-500 font-mono w-12 text-center shrink-0">
                        {new Date(m.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-xs font-bold text-white truncate">{m.event_home_team}</span>
                          {m.home_team_logo && <img src={m.home_team_logo} className="w-5 h-5 object-contain" alt="" />}
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded-lg font-mono font-bold text-white text-xs mx-2 shrink-0">
                          {m.event_final_result || m.event_ft_result || '-'}
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          {m.away_team_logo && <img src={m.away_team_logo} className="w-5 h-5 object-contain" alt="" />}
                          <span className="text-xs font-bold text-white truncate">{m.event_away_team}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Key Players */}
            {players.length > 0 && (
              <section>
                <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <span>⭐</span> Key Players
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {players.slice(0, 6).map(p => (
                    <Link
                      key={p.player_key}
                      href={footballRoutes.playerFromName(p.player_name)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#0B1526]/50 border border-white/5 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 shrink-0">
                        <img src={p.player_image} alt={p.player_name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">{p.player_name}</div>
                        <div className="text-[10px] text-slate-400">{p.player_type} • #{p.player_number}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Squad Tab */}
        {activeTab === 'squad' && (
          <div className="space-y-6">
            {Object.entries(playersByPosition).map(([position, posPlayers]) => (
              <section key={position}>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {position}s ({posPlayers.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {posPlayers.map(p => (
                    <Link
                      key={p.player_key}
                      href={footballRoutes.playerFromName(p.player_name)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#0B1526]/50 border border-white/5 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 shrink-0">
                        <img src={p.player_image} alt={p.player_name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{p.player_name}</div>
                        <div className="text-[10px] text-slate-400">#{p.player_number} • {p.player_country}</div>
                        <div className="text-[10px] text-slate-500">{p.player_age} years</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
            {players.length === 0 && (
              <div className="text-center text-slate-400 py-12">No squad data available for this team.</div>
            )}
          </div>
        )}

        {/* Fixtures Tab */}
        {activeTab === 'fixtures' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>📅</span> Upcoming Fixtures
            </h2>
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((m, i) => (
                <Link
                  key={`fix-${m.event_key}-${i}`}
                  href={footballRoutes.matchFromEvent(m)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#0B1526]/50 border border-white/5 hover:border-blue-500/30 transition-all"
                >
                  <div className="text-[10px] text-slate-500 font-mono w-16 text-center shrink-0">
                    <div>{new Date(m.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    <div className="text-amber-400">{m.event_time}</div>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-xs font-bold text-white truncate">{m.event_home_team}</span>
                      {m.home_team_logo && <img src={m.home_team_logo} className="w-6 h-6 object-contain" alt="" />}
                    </div>
                    <span className="text-slate-500 text-xs mx-3">vs</span>
                    <div className="flex items-center gap-2 flex-1">
                      {m.away_team_logo && <img src={m.away_team_logo} className="w-6 h-6 object-contain" alt="" />}
                      <span className="text-xs font-bold text-white truncate">{m.event_away_team}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-slate-400 py-12">No upcoming fixtures scheduled.</div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>✅</span> Match Results
            </h2>
            {recentMatches.length > 0 ? (
              recentMatches.map((m, i) => (
                <Link
                  key={`res-${m.event_key}-${i}`}
                  href={footballRoutes.matchFromEvent(m)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#0B1526]/50 border border-white/5 hover:border-blue-500/30 transition-all"
                >
                  <div className="text-[10px] text-slate-500 font-mono w-12 text-center shrink-0">
                    {new Date(m.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-xs font-bold text-white truncate">{m.event_home_team}</span>
                      {m.home_team_logo && <img src={m.home_team_logo} className="w-5 h-5 object-contain" alt="" />}
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-lg font-mono font-bold text-white text-xs mx-2 shrink-0">
                      {m.event_final_result || m.event_ft_result || '-'}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      {m.away_team_logo && <img src={m.away_team_logo} className="w-5 h-5 object-contain" alt="" />}
                      <span className="text-xs font-bold text-white truncate">{m.event_away_team}</span>
                    </div>
                  </div>
                  <div className="shrink-0">{getFormBadge(m)}</div>
                </Link>
              ))
            ) : (
              <div className="text-center text-slate-400 py-12">No recent results available.</div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && standing && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-[#0B1526]/50 p-5">
              <h3 className="text-sm font-black text-white uppercase mb-4">League Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Played', value: standing.standing_P, color: 'text-white' },
                  { label: 'Won', value: standing.standing_W, color: 'text-emerald-400' },
                  { label: 'Drawn', value: standing.standing_D, color: 'text-amber-400' },
                  { label: 'Lost', value: standing.standing_L, color: 'text-red-400' },
                  { label: 'Goals For', value: standing.standing_F, color: 'text-blue-400' },
                  { label: 'Goals Against', value: standing.standing_A, color: 'text-orange-400' },
                  { label: 'Goal Diff', value: standing.standing_GD, color: 'text-cyan-400' },
                  { label: 'Points', value: standing.standing_PTS, color: 'text-amber-300' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-white/5">
                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        {activeTab === 'stats' && !standing && (
          <div className="text-center text-slate-400 py-12">No league statistics available for this team.</div>
        )}
      </div>
    </div>
  );
}

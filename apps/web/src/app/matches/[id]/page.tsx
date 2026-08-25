'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  webApiFootballService,
  ApiFootballFixtureItem,
  ApiFootballEvent,
  ApiFootballLineup,
  ApiFootballTeamStats,
  ApiFootballStandingItem,
} from '../../../services/apiFootball';

type DetailTab = 'overview' | 'events' | 'lineups' | 'stats' | 'standings';

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = Number(params?.id);

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [loading, setLoading] = useState(true);

  const [fixture, setFixture] = useState<ApiFootballFixtureItem | null>(null);
  const [events, setEvents] = useState<ApiFootballEvent[]>([]);
  const [lineups, setLineups] = useState<ApiFootballLineup[]>([]);
  const [stats, setStats] = useState<ApiFootballTeamStats[]>([]);
  const [standings, setStandings] = useState<ApiFootballStandingItem[]>([]);

  const loadData = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const [fix, evs, lns, st] = await Promise.allSettled([
        webApiFootballService.getFixtureById(matchId),
        webApiFootballService.getFixtureEvents({ fixture: matchId }),
        webApiFootballService.getFixtureLineups({ fixture: matchId }),
        webApiFootballService.getFixtureStatistics({ fixture: matchId }),
      ]);

      if (fix.status === 'fulfilled' && fix.value) {
        setFixture(fix.value);
        if (fix.value.league && fix.value.league.id) {
          webApiFootballService
            .getStandings({ league: fix.value.league.id, season: fix.value.league.season })
            .then((res) => setStandings(res))
            .catch(() => {});
        }
      }

      if (evs.status === 'fulfilled') setEvents(evs.value || []);
      if (lns.status === 'fulfilled') setLineups(lns.value || []);
      if (st.status === 'fulfilled') setStats(st.value || []);
    } catch (err) {
      console.error('[Web Match Details] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(
    fixture?.fixture.status.short || ''
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading match center...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back Link */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1 text-sm font-semibold text-slate-400 hover:text-white"
        >
          <span>← Back</span>
        </button>
        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-[#1E293B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
        >
          <span>🔄 Refresh</span>
        </button>
      </div>

      {/* Score Banner */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-[#141C2B] p-6 shadow-2xl">
        {/* League Info */}
        <div className="mb-6 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400">
          {fixture?.league.logo && (
            <img src={fixture.league.logo} alt={fixture.league.name} className="h-4 w-4 object-contain" />
          )}
          <span>
            {fixture?.league.name} • {fixture?.league.round}
          </span>
        </div>

        {/* Teams & Score */}
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Home */}
          <div className="flex flex-col items-center text-center">
            {fixture?.teams.home.logo ? (
              <img
                src={fixture.teams.home.logo}
                alt={fixture.teams.home.name}
                className="h-16 w-16 object-contain drop-shadow"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-2xl">🛡️</div>
            )}
            <h2 className="mt-2 text-base font-bold text-white">{fixture?.teams.home.name}</h2>
          </div>

          {/* Score / Center */}
          <div className="flex flex-col items-center justify-center">
            <span
              className={`mb-2 rounded-full px-3 py-0.5 text-xs font-bold ${
                isLive
                  ? 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {fixture?.fixture.status.short || 'VS'}
            </span>
            <div className="text-4xl font-black tracking-widest text-white">
              {fixture?.goals.home !== null && fixture?.goals.home !== undefined ? fixture.goals.home : '-'} :{' '}
              {fixture?.goals.away !== null && fixture?.goals.away !== undefined ? fixture.goals.away : '-'}
            </div>
            {fixture?.fixture.venue.name && (
              <span className="mt-2 text-[11px] text-slate-500">📍 {fixture.fixture.venue.name}</span>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center text-center">
            {fixture?.teams.away.logo ? (
              <img
                src={fixture.teams.away.logo}
                alt={fixture.teams.away.name}
                className="h-16 w-16 object-contain drop-shadow"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-2xl">🛡️</div>
            )}
            <h2 className="mt-2 text-base font-bold text-white">{fixture?.teams.away.name}</h2>
          </div>
        </div>
      </div>

      {/* 5-Tab Bar */}
      <div className="mb-6 flex space-x-2 rounded-xl bg-[#141C2B] p-1 border border-white/5">
        {(['overview', 'events', 'lineups', 'stats', 'standings'] as DetailTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold capitalize transition ${
                isActive
                  ? 'bg-[#1E293B] text-emerald-400 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            Match Info
          </h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between border-b border-white/5 py-2">
              <span className="text-slate-400">Date & Time</span>
              <span className="font-semibold text-white">
                {fixture?.fixture.date ? new Date(fixture.fixture.date).toLocaleString() : 'TBD'}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-2">
              <span className="text-slate-400">Referee</span>
              <span className="font-semibold text-white">{fixture?.fixture.referee || 'Not Assigned'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-2">
              <span className="text-slate-400">Stadium</span>
              <span className="font-semibold text-white">
                {fixture?.fixture.venue.name} ({fixture?.fixture.venue.city})
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-2">
              <span className="text-slate-400">Half-Time Score</span>
              <span className="font-semibold text-white">
                {fixture?.score.halftime.home ?? '-'} - {fixture?.score.halftime.away ?? '-'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Events */}
      {activeTab === 'events' && (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            Match Timeline
          </h3>
          {events.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No match events recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev, idx) => {
                const isGoal = ev.type === 'Goal';
                const isCard = ev.type === 'Card';
                const isYellow = isCard && ev.detail.includes('Yellow');

                return (
                  <div
                    key={idx}
                    className="flex items-center space-x-4 rounded-lg bg-white/[0.02] p-3 border border-white/5"
                  >
                    <span className="w-10 text-center text-sm font-black text-emerald-400">
                      {ev.time.elapsed}'
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {isGoal && <span>⚽</span>}
                        {isCard && (
                          <span
                            className={`inline-block h-3.5 w-2.5 rounded-sm ${
                              isYellow ? 'bg-amber-400' : 'bg-red-600'
                            }`}
                          />
                        )}
                        {ev.type === 'subst' && <span>🔄</span>}
                        <span className="text-sm font-bold text-white">{ev.player.name}</span>
                      </div>
                      {ev.assist.name && (
                        <span className="text-xs text-slate-400">Assist: {ev.assist.name}</span>
                      )}
                      <p className="text-xs text-slate-500">{ev.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Lineups & 2D Tactical Pitch */}
      {activeTab === 'lineups' && (
        <div className="space-y-6">
          {lineups.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-8 text-center text-sm text-slate-500">
              Lineups are announced ~1 hour before kickoff.
            </div>
          ) : (
            <>
              {/* 2D Tactical Pitch Graphic */}
              <div className="relative min-h-[320px] rounded-2xl border-2 border-emerald-500/50 bg-[#0F281E] p-6 shadow-inner flex flex-col justify-between overflow-hidden">
                {/* Pitch Markings */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
                <div className="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

                {/* Home Formations */}
                <div>
                  <div className="mb-4 text-center text-xs font-bold text-emerald-400 uppercase">
                    {lineups[0]?.team.name} ({lineups[0]?.formation})
                  </div>
                  <div className="flex flex-wrap justify-around gap-2">
                    {lineups[0]?.startXI.map((p: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow">
                          {p.player.number}
                        </div>
                        <span className="mt-1 text-[10px] font-medium text-white max-w-[60px] truncate text-center">
                          {p.player.name.split(' ').pop()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Away Formations */}
                {lineups[1] && (
                  <div>
                    <div className="flex flex-wrap justify-around gap-2 mb-4">
                      {lineups[1]?.startXI.map((p: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow">
                            {p.player.number}
                          </div>
                          <span className="mt-1 text-[10px] font-medium text-white max-w-[60px] truncate text-center">
                            {p.player.name.split(' ').pop()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-xs font-bold text-emerald-400 uppercase">
                      {lineups[1]?.team.name} ({lineups[1]?.formation})
                    </div>
                  </div>
                )}
              </div>

              {/* Substitutes */}
              <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6">
                <h3 className="mb-4 text-sm font-bold text-white uppercase">Substitutes Bench</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="mb-2 font-bold text-slate-300">{lineups[0]?.team.name}</h4>
                    <ul className="space-y-1 text-slate-400">
                      {lineups[0]?.substitutes.map((s: any, idx: number) => (
                        <li key={idx}>
                          {s.player.number}. {s.player.name} ({s.player.pos})
                        </li>
                      ))}
                    </ul>
                  </div>
                  {lineups[1] && (
                    <div>
                      <h4 className="mb-2 font-bold text-slate-300">{lineups[1]?.team.name}</h4>
                      <ul className="space-y-1 text-slate-400">
                        {lineups[1]?.substitutes.map((s: any, idx: number) => (
                          <li key={idx}>
                            {s.player.number}. {s.player.name} ({s.player.pos})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 4: Statistics */}
      {activeTab === 'stats' && (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            Match Statistics
          </h3>
          {stats.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">
              Match statistics available during and after the game.
            </p>
          ) : (
            stats[0]?.statistics.map((st: any, idx: number) => {
              const awayStat = stats[1]?.statistics.find((s: any) => s.type === st.type);

              const homeVal = String(st.value ?? 0).replace('%', '');
              const awayVal = String(awayStat?.value ?? 0).replace('%', '');
              const numHome = Number(homeVal) || 1;
              const numAway = Number(awayVal) || 1;
              const total = numHome + numAway || 2;
              const homePercent = (numHome / total) * 100;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-blue-400">{st.value ?? '0'}</span>
                    <span className="text-slate-300">{st.type}</span>
                    <span className="text-red-400">{awayStat?.value ?? '0'}</span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div style={{ width: `${homePercent}%` }} className="bg-blue-500" />
                    <div style={{ width: `${100 - homePercent}%` }} className="bg-red-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 5: Standings */}
      {activeTab === 'standings' && (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 shadow-xl">
          <h3 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">
            {fixture?.league.name} Standings
          </h3>
          {standings.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">Standings table not available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-4">Club</th>
                    <th className="py-3 px-3 text-center">PL</th>
                    <th className="py-3 px-3 text-center">GD</th>
                    <th className="py-3 px-4 text-right">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {standings.map((row) => {
                    const isCurrent =
                      row.team.id === fixture?.teams.home.id ||
                      row.team.id === fixture?.teams.away.id;
                    return (
                      <tr key={row.rank} className={isCurrent ? 'bg-emerald-500/10' : 'hover:bg-white/5'}>
                        <td className="py-3 px-2 font-bold text-slate-400">{row.rank}</td>
                        <td className="flex items-center space-x-3 py-3 px-4 font-bold text-white">
                          <img src={row.team.logo} alt={row.team.name} className="h-5 w-5 object-contain" />
                          <span className={isCurrent ? 'text-emerald-400 font-black' : ''}>{row.team.name}</span>
                        </td>
                        <td className="py-3 px-3 text-center">{row.all.played}</td>
                        <td className="py-3 px-3 text-center font-medium">{row.goalsDiff}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-400">{row.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

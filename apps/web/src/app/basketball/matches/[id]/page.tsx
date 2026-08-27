'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { webBasketballApiService, ApiBasketballGameItem } from '../../../../services/basketballApi';

type BasketballDetailTab = 'overview' | 'quarters' | 'stats' | 'h2h' | 'standings';

export default function BasketballMatchPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = Number(params?.id);

  const [activeTab, setActiveTab] = useState<BasketballDetailTab>('overview');
  const [loading, setLoading] = useState(true);

  const [game, setGame] = useState<ApiBasketballGameItem | null>(null);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [h2h, setH2H] = useState<ApiBasketballGameItem[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    try {
      const [g, st] = await Promise.allSettled([
        webBasketballApiService.getGameById(gameId),
        webBasketballApiService.getGameTeamStatistics({ id: gameId }),
      ]);

      if (g.status === 'fulfilled' && g.value) {
        setGame(g.value);

        if (g.value.teams?.home?.id && g.value.teams?.away?.id) {
          webBasketballApiService
            .getHeadToHead({
              h2h: `${g.value.teams.home.id}-${g.value.teams.away.id}`,
            })
            .then((res) => setH2H(res || []))
            .catch(() => {});
        }

        if (g.value.league?.id && g.value.league?.season) {
          webBasketballApiService
            .getStandings({
              league: g.value.league.id,
              season: g.value.league.season,
            })
            .then((res) => setStandings(res || []))
            .catch(() => {});
        }
      }

      if (st.status === 'fulfilled') {
        setTeamStats(st.value || []);
      }
    } catch (err) {
      console.error('[Web Basketball Match] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isLive = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT', 'LIVE'].includes(
    game?.status.short || ''
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading game center...</p>
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
        <div className="mb-6 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400">
          {game?.league.logo && (
            <img src={game.league.logo} alt={game.league.name} className="h-4 w-4 object-contain" />
          )}
          <span>
            {game?.league.name} • {game?.country.name}
          </span>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          {/* Home Team */}
          <div className="flex flex-col items-center text-center">
            {game?.teams.home.logo ? (
              <img
                src={game.teams.home.logo}
                alt={game.teams.home.name}
                className="h-16 w-16 object-contain drop-shadow"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-2xl">
                🏀
              </div>
            )}
            <h2 className="mt-2 text-base font-bold text-white">{game?.teams.home.name}</h2>
          </div>

          {/* Center Score */}
          <div className="flex flex-col items-center justify-center">
            <span
              className={`mb-2 rounded-full px-3 py-0.5 text-xs font-bold ${
                isLive
                  ? 'border border-orange-500/50 bg-orange-500/10 text-orange-400'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {game?.status.short || 'VS'}
            </span>
            <div className="text-4xl font-black tracking-widest text-white">
              {game?.scores.home.total ?? '-'}:{game?.scores.away.total ?? '-'}
            </div>
            {game?.time && (
              <span className="mt-2 text-[11px] text-slate-500">
                {game.date} • {game.time}
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center text-center">
            {game?.teams.away.logo ? (
              <img
                src={game.teams.away.logo}
                alt={game.teams.away.name}
                className="h-16 w-16 object-contain drop-shadow"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-2xl">
                🏀
              </div>
            )}
            <h2 className="mt-2 text-base font-bold text-white">{game?.teams.away.name}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 rounded-xl bg-[#141C2B] p-1 border border-white/5">
        {(['overview', 'quarters', 'stats', 'h2h', 'standings'] as BasketballDetailTab[]).map(
          (tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase transition ${
                  isActive
                    ? 'bg-[#1E293B] text-orange-400 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          }
        )}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            Game Info
          </h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between border-b border-white/5 py-2">
              <span className="text-slate-400">Competition</span>
              <span className="font-semibold text-white">{game?.league.name}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-2">
              <span className="text-slate-400">Season</span>
              <span className="font-semibold text-white">{game?.league.season}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-2">
              <span className="text-slate-400">Date & Time</span>
              <span className="font-semibold text-white">
                {game?.date} {game?.time}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-2">
              <span className="text-slate-400">Status</span>
              <span className="font-semibold text-white">
                {game?.status.long || game?.status.short}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quarters */}
      {activeTab === 'quarters' && (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
            Quarter-by-Quarter Breakdown
          </h3>
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3 text-center">Q1</th>
                <th className="py-2.5 px-3 text-center">Q2</th>
                <th className="py-2.5 px-3 text-center">Q3</th>
                <th className="py-2.5 px-3 text-center">Q4</th>
                {game?.scores.home.over_time !== null && (
                  <th className="py-2.5 px-3 text-center">OT</th>
                )}
                <th className="py-2.5 px-3 text-center font-black text-orange-400">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 px-3 font-bold text-white">{game?.teams.home.name}</td>
                <td className="py-3 px-3 text-center">{game?.scores.home.quarter_1 ?? '-'}</td>
                <td className="py-3 px-3 text-center">{game?.scores.home.quarter_2 ?? '-'}</td>
                <td className="py-3 px-3 text-center">{game?.scores.home.quarter_3 ?? '-'}</td>
                <td className="py-3 px-3 text-center">{game?.scores.home.quarter_4 ?? '-'}</td>
                {game?.scores.home.over_time !== null && (
                  <td className="py-3 px-3 text-center">{game?.scores.home.over_time ?? '-'}</td>
                )}
                <td className="py-3 px-3 text-center font-black text-orange-400">
                  {game?.scores.home.total ?? '-'}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">{game?.teams.away.name}</td>
                <td className="py-3 px-3 text-center">{game?.scores.away.quarter_1 ?? '-'}</td>
                <td className="py-3 px-3 text-center">{game?.scores.away.quarter_2 ?? '-'}</td>
                <td className="py-3 px-3 text-center">{game?.scores.away.quarter_3 ?? '-'}</td>
                <td className="py-3 px-3 text-center">{game?.scores.away.quarter_4 ?? '-'}</td>
                {game?.scores.away.over_time !== null && (
                  <td className="py-3 px-3 text-center">{game?.scores.away.over_time ?? '-'}</td>
                )}
                <td className="py-3 px-3 text-center font-black text-orange-400">
                  {game?.scores.away.total ?? '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Stats */}
      {activeTab === 'stats' && (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
            Team Game Statistics
          </h3>
          {teamStats.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">
              Team statistics available for live and completed games.
            </p>
          ) : (
            <div className="space-y-3">
              {teamStats.map((st, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border-b border-white/5 py-2 text-sm"
                >
                  <span className="text-slate-400">{st.type || `Stat #${idx + 1}`}</span>
                  <span className="font-bold text-white">{st.value || '-'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Head-to-Head */}
      {activeTab === 'h2h' && (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
            Past H2H Matches
          </h3>
          {h2h.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No past match history found.</p>
          ) : (
            <div className="space-y-3">
              {h2h.slice(0, 5).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3 border border-white/5"
                >
                  <span className="text-xs text-slate-400">{h.date}</span>
                  <div className="flex items-center space-x-3 text-sm font-bold">
                    <span className="text-slate-200">{h.teams.home.name}</span>
                    <span className="text-orange-400">
                      {h.scores.home.total ?? '-'}:{h.scores.away.total ?? '-'}
                    </span>
                    <span className="text-slate-200">{h.teams.away.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Standings */}
      {activeTab === 'standings' && (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            {game?.league.name} Standings
          </h3>
          {standings.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">
              Standings not available for this league.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-4">Team</th>
                    <th className="py-2.5 px-3 text-center">W</th>
                    <th className="py-2.5 px-3 text-center">L</th>
                    <th className="py-2.5 px-3 text-center">PCT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {standings.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="py-2.5 px-2 font-bold text-slate-400">
                        {row.position || idx + 1}
                      </td>
                      <td className="flex items-center space-x-2.5 py-2.5 px-4 font-bold text-white">
                        {row.team?.logo && (
                          <img
                            src={row.team.logo}
                            alt={row.team.name}
                            className="h-4 w-4 object-contain"
                          />
                        )}
                        <span>{row.team?.name || 'Team'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-400">
                        {row.games?.win?.total ?? 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-400">
                        {row.games?.lose?.total ?? 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium">
                        {row.games?.win?.percentage ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

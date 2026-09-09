'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { basketballApi } from '@/services/basketballApi';
import { BasketballEvent, BasketballLeague, BasketballStanding } from '@goalmills/types';
import { BasketballMatchCard } from '@/components/BasketballMatchCard';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import { BackButton } from '@/components/BackButton';
import { extractKeyFromSlug, basketballRoutes, slugify } from '@/lib/slugUtils';
import {
  FiAward,
  FiCalendar,
  FiTrendingUp,
  FiMapPin,
  FiActivity,
  FiChevronRight,
} from 'react-icons/fi';

export default function BasketballLeagueSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const leagueIdStr = extractKeyFromSlug(slug);
  const leagueId = parseInt(leagueIdStr, 10) || 766;

  const [league, setLeague] = useState<BasketballLeague | null>(null);
  const [matches, setMatches] = useState<BasketballEvent[]>([]);
  const [standings, setStandings] = useState<BasketballStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'standings' | 'matches'>('standings');

  useEffect(() => {
    async function loadLeagueData() {
      setLoading(true);
      try {
        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 14);
        const toDate = new Date(today);
        toDate.setDate(today.getDate() + 14);
        const from = fromDate.toISOString().split('T')[0];
        const to = toDate.toISOString().split('T')[0];

        const [leaguesRes, matchesRes, standingsRes] = await Promise.allSettled([
          basketballApi.getLeagues(),
          basketballApi.getFixtures({ leagueId, from, to }),
          basketballApi.getStandings({ leagueId }),
        ]);

        if (leaguesRes.status === 'fulfilled' && leaguesRes.value?.result) {
          const found = leaguesRes.value.result.find(
            (l) => Number(l.league_key) === leagueId || slugify(l.league_name) === slug
          );
          if (found) setLeague(found);
        }

        if (matchesRes.status === 'fulfilled' && matchesRes.value?.result) {
          setMatches(matchesRes.value.result);
        }

        if (standingsRes.status === 'fulfilled') {
          const list =
            standingsRes.value?.result?.total ||
            (Array.isArray(standingsRes.value?.result) ? standingsRes.value.result : []);
          setStandings(list);
        }
      } catch (err) {
        console.error('Error loading basketball league data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLeagueData();
  }, [leagueId, slug]);

  const leagueName = league?.league_name || (leagueId === 766 ? 'NBA' : `League #${leagueId}`);
  const countryName = league?.country_name || 'Global';

  // JSON-LD for Competition
  const jsonLd = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsOrganization',
      name: leagueName,
      sport: 'Basketball',
      location: {
        '@type': 'Place',
        name: countryName,
      },
    };
  }, [leagueName, countryName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center space-y-3">
        <GoalmillsLoader />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
          Loading League Standings & Schedule...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a1a] pt-[90px] pb-24 text-slate-200">
      {/* JSON-LD Script Tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B1526] via-[#091222] to-[#070a1a] border-b border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <BackButton />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-3xl shadow-xl">
                🏀
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Official Competition
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">• {countryName}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {leagueName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-2xl bg-[#091529] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Teams</span>
                <span className="text-sm font-black text-white">{standings.length || '-'}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#091529] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Fixtures</span>
                <span className="text-sm font-black text-amber-400">{matches.length || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'standings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiTrendingUp />
            <span>Standings Table</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'matches'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiCalendar />
            <span>Fixtures & Results ({matches.length})</span>
          </button>
        </div>

        {/* Tab 1: Standings Table */}
        {activeTab === 'standings' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiAward className="text-amber-400" />
              <span>{leagueName} Official Standings</span>
            </h3>

            {standings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active standings currently posted for this league.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                      <th className="py-3 px-2">#</th>
                      <th className="py-3 px-3">Team</th>
                      <th className="py-3 px-2 text-center">P</th>
                      <th className="py-3 px-2 text-center">W</th>
                      <th className="py-3 px-2 text-center">L</th>
                      <th className="py-3 px-2 text-center">PCT</th>
                      <th className="py-3 px-2 text-center hidden sm:table-cell">F</th>
                      <th className="py-3 px-2 text-center hidden sm:table-cell">A</th>
                      <th className="py-3 px-2 text-center">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {standings.map((team, idx) => (
                      <tr key={team.team_key || idx} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3 px-2 font-mono font-bold text-slate-400 group-hover:text-amber-400">
                          {team.standing_place || idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <Link
                            href={basketballRoutes.teamFromName(team.standing_team, team.team_key)}
                            className="font-bold text-white hover:text-amber-300 transition-colors flex items-center gap-2"
                          >
                            <span>{team.standing_team}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{team.standing_P}</td>
                        <td className="py-3 px-2 text-center font-mono text-emerald-400 font-bold">
                          {team.standing_W}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-rose-400">
                          {team.standing_L}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-amber-400">
                          {team.standing_PCT ||
                            (team.standing_P && Number(team.standing_P) > 0
                              ? (Number(team.standing_W) / Number(team.standing_P)).toFixed(3)
                              : '-')}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                          {team.standing_F}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                          {team.standing_A}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                          {team.league_round || team.standing_place_type || 'Regular'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Fixtures Grid */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-12 text-center">
                <span className="text-4xl mb-3 block">🏀</span>
                <p className="text-xs text-slate-400">
                  No fixtures found for {leagueName} within this time frame.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matches.map((m) => (
                  <BasketballMatchCard key={m.event_key} match={m} hideLeague={true} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cricketApi } from '@/services/cricketApi';
import { CricketEvent, CricketLeague, CricketStanding } from '@goalmills/types';
import { CricketMatchCard } from '@/components/CricketMatchCard';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import { BackButton } from '@/components/BackButton';
import { extractKeyFromSlug, cricketRoutes, slugify } from '@/lib/slugUtils';
import {
  FiAward,
  FiCalendar,
  FiTrendingUp,
  FiMapPin,
  FiActivity,
  FiChevronRight,
} from 'react-icons/fi';

export default function CricketLeagueSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const leagueIdStr = extractKeyFromSlug(slug);
  const leagueId = parseInt(leagueIdStr, 10) || 0;

  const [league, setLeague] = useState<CricketLeague | null>(null);
  const [matches, setMatches] = useState<CricketEvent[]>([]);
  const [standings, setStandings] = useState<CricketStanding[]>([]);
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
          cricketApi.getLeagues(),
          cricketApi.getFixtures(leagueId ? { leagueId, from, to } : { from, to }),
          cricketApi.getStandings(leagueId ? { leagueId } : {}),
        ]);

        if (leaguesRes.status === 'fulfilled' && leaguesRes.value?.result) {
          const found = leaguesRes.value.result.find(
            (l) => Number(l.league_key) === leagueId || slugify(l.league_name) === slug
          );
          if (found) setLeague(found);
        }

        if (matchesRes.status === 'fulfilled' && matchesRes.value?.result) {
          setMatches(Array.isArray(matchesRes.value.result) ? matchesRes.value.result : []);
        }

        if (standingsRes.status === 'fulfilled') {
          const list =
            standingsRes.value?.result?.total ||
            (Array.isArray(standingsRes.value?.result) ? standingsRes.value.result : []);
          setStandings(list);
        }
      } catch (err) {
        console.error('Error loading cricket tournament data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLeagueData();
  }, [leagueId, slug]);

  const leagueName =
    league?.league_name ||
    slug
      .replace(/-\d+$/, '')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') ||
    `Tournament #${leagueId}`;
  const countryName = league?.country_name || 'International';

  // JSON-LD for Competition
  const jsonLd = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsOrganization',
      name: leagueName,
      sport: 'Cricket',
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
          Loading Tournament Points Table & Fixtures...
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

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B1526] via-[#091222] to-[#070a1a] border-b border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <BackButton />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#0F1D38]/80 border border-white/10 p-2.5 flex items-center justify-center shadow-xl">
                {league?.league_logo ? (
                  <img
                    src={league.league_logo}
                    alt={leagueName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-3xl">🏆</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                    Cricket Competition
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">• {countryName}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {leagueName}
                </h1>
                {league?.league_season && (
                  <p className="text-xs text-slate-400 mt-1">Season {league.league_season}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-2xl bg-[#170B10] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Teams</span>
                <span className="text-sm font-black text-white">{standings.length || '-'}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#170B10] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Matches
                </span>
                <span className="text-sm font-black text-red-400">{matches.length || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'standings'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiTrendingUp />
            <span>Points Table ({standings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'matches'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiCalendar />
            <span>Fixtures & Results ({matches.length})</span>
          </button>
        </div>

        {/* Tab 1: Points Table Standings */}
        {activeTab === 'standings' && (
          <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiAward className="text-red-400" />
              <span>Official Tournament Points Table</span>
            </h3>

            {standings.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                Standings will be updated as tournament group stages progress.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                      <th className="py-3 px-3 text-center w-10">Pos</th>
                      <th className="py-3 px-3">Team</th>
                      <th className="py-3 px-2 text-center">P</th>
                      <th className="py-3 px-2 text-center text-red-400">W</th>
                      <th className="py-3 px-2 text-center text-rose-400">L</th>
                      <th className="py-3 px-2 text-center text-slate-400">NR</th>
                      <th className="py-3 px-2 text-center text-slate-300">NRR</th>
                      <th className="py-3 px-3 text-center font-black text-yellow-400">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                    {standings.map((s, idx) => {
                      const pos = parseInt(s.standing_place || `${idx + 1}`, 10);
                      const isTop4 = pos <= 4;
                      const teamSlug = cricketRoutes.teamFromName(s.standing_team, s.team_key);

                      return (
                        <tr key={s.team_key || idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 text-center font-sans font-black">
                            <span
                              className={`w-6 h-6 inline-flex items-center justify-center rounded-lg text-xs ${
                                isTop4 ? 'bg-red-500/20 text-red-300 font-black' : 'text-slate-400'
                              }`}
                            >
                              {pos}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans font-bold text-white">
                            <Link
                              href={teamSlug}
                              className="hover:text-red-300 transition-colors flex items-center gap-1.5"
                            >
                              <span>{s.standing_team}</span>
                              <FiChevronRight className="opacity-0 group-hover:opacity-100 text-xs text-slate-500" />
                            </Link>
                          </td>
                          <td className="py-3 px-2 text-center text-slate-300">
                            {s.standing_MP || '0'}
                          </td>
                          <td className="py-3 px-2 text-center font-bold text-red-400">
                            {s.standing_W || '0'}
                          </td>
                          <td className="py-3 px-2 text-center text-rose-400">
                            {s.standing_L || '0'}
                          </td>
                          <td className="py-3 px-2 text-center text-slate-400">
                            {s.standing_NR || '0'}
                          </td>
                          <td className="py-3 px-2 text-center text-slate-300 font-bold">
                            {s.standing_NRR || '0.000'}
                          </td>
                          <td className="py-3 px-3 text-center font-black text-yellow-400 text-sm">
                            {s.standing_Pts || '0'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Matches */}
        {activeTab === 'matches' && (
          <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiCalendar className="text-sky-400" />
              <span>Tournament Fixtures & Scorecards</span>
            </h3>

            {matches.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No fixtures scheduled for this competition in the active window.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matches.map((m) => (
                  <CricketMatchCard key={m.event_key} match={m} hideLeague />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

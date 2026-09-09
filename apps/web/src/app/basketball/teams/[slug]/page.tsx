'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { basketballApi } from '@/services/basketballApi';
import { BasketballEvent, BasketballTeam, BasketballPlayer } from '@goalmills/types';
import { BasketballMatchCard } from '@/components/BasketballMatchCard';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import { BackButton } from '@/components/BackButton';
import { extractKeyFromSlug, basketballRoutes, slugify } from '@/lib/slugUtils';
import {
  FiUsers,
  FiCalendar,
  FiAward,
  FiTrendingUp,
  FiShield,
  FiMapPin,
  FiActivity,
} from 'react-icons/fi';

type TeamTab = 'overview' | 'fixtures' | 'squad';

export default function BasketballTeamSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const teamIdStr = extractKeyFromSlug(slug);
  const teamId = parseInt(teamIdStr, 10);

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<BasketballTeam | null>(null);
  const [matches, setMatches] = useState<BasketballEvent[]>([]);
  const [players, setPlayers] = useState<BasketballPlayer[]>([]);
  const [activeTab, setActiveTab] = useState<TeamTab>('overview');

  useEffect(() => {
    async function loadTeamData() {
      if (!teamId && !slug) return;
      setLoading(true);
      try {
        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 30);
        const toDate = new Date(today);
        toDate.setDate(today.getDate() + 30);
        const from = fromDate.toISOString().split('T')[0];
        const to = toDate.toISOString().split('T')[0];

        const [teamsRes, fixturesRes, playersRes] = await Promise.allSettled([
          basketballApi.getTeams(teamId ? { teamId } : {}),
          basketballApi.getFixtures(teamId ? { teamId, from, to } : { from, to }),
          basketballApi.getPlayers(teamId ? { teamId } : {}),
        ]);

        if (teamsRes.status === 'fulfilled' && teamsRes.value?.result) {
          const list = Array.isArray(teamsRes.value.result) ? teamsRes.value.result : [];
          const found =
            list.find((t) => Number(t.team_key) === teamId || slugify(t.team_name) === slug) ||
            list[0];
          if (found) setTeam(found);
        }

        if (fixturesRes.status === 'fulfilled' && fixturesRes.value?.result) {
          setMatches(Array.isArray(fixturesRes.value.result) ? fixturesRes.value.result : []);
        }

        if (playersRes.status === 'fulfilled' && playersRes.value?.result) {
          setPlayers(Array.isArray(playersRes.value.result) ? playersRes.value.result : []);
        }
      } catch (err) {
        console.error('Error loading team data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTeamData();
  }, [teamId, slug]);

  const teamName = team?.team_name || (teamId ? `Team #${teamId}` : 'Basketball Club');

  // JSON-LD structured data
  const jsonLd = useMemo(() => {
    if (!team) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsTeam',
      name: teamName,
      sport: 'Basketball',
      logo: team.team_logo,
    };
  }, [team, teamName]);

  const recentMatches = useMemo(() => {
    return matches.filter((m) => m.event_status === 'Finished' || m.event_status === 'FT');
  }, [matches]);

  const upcomingMatches = useMemo(() => {
    return matches.filter((m) => m.event_status !== 'Finished' && m.event_status !== 'FT');
  }, [matches]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center space-y-3">
        <GoalmillsLoader />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
          Loading Team Profile & Roster...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a1a] pt-[90px] pb-24 text-slate-200">
      {/* JSON-LD Script Tag */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B1526] via-[#091222] to-[#070a1a] border-b border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <BackButton />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0F1D38]/80 border border-white/10 p-3 flex items-center justify-center shadow-2xl">
                {team?.team_logo ? (
                  <img
                    src={team.team_logo}
                    alt={teamName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-3xl font-black text-amber-400">{teamName.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Basketball Club
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">• ID #{team?.team_key || teamId}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {teamName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-2xl bg-[#091529] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Roster</span>
                <span className="text-sm font-black text-white">{players.length || '-'}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#091529] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Games</span>
                <span className="text-sm font-black text-amber-400">{matches.length || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiActivity />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'fixtures'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiCalendar />
            <span>Schedule ({matches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('squad')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'squad'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiUsers />
            <span>Squad Roster ({players.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Form */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiTrendingUp className="text-amber-400" />
                <span>Recent Form & Results</span>
              </h3>
              {recentMatches.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No recent completed games on record.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentMatches.slice(0, 4).map((m) => (
                    <BasketballMatchCard key={m.event_key} match={m} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Games */}
            <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiCalendar className="text-sky-400" />
                <span>Upcoming Schedule</span>
              </h3>
              {upcomingMatches.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No upcoming fixtures scheduled at this time.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingMatches.slice(0, 4).map((m) => (
                    <BasketballMatchCard key={m.event_key} match={m} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Full Schedule */}
        {activeTab === 'fixtures' && (
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-12 text-center">
                <span className="text-4xl mb-3 block">🏀</span>
                <p className="text-xs text-slate-400">No fixtures recorded for this team.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matches.map((m) => (
                  <BasketballMatchCard key={m.event_key} match={m} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Squad Roster */}
        {activeTab === 'squad' && (
          <div className="rounded-3xl border border-blue-500/20 bg-[#08142A]/90 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiUsers className="text-amber-400" />
              <span>Official Squad Roster</span>
            </h3>

            {players.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Squad roster information is currently being updated for this team.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {players.map((p) => {
                  const playerSlug = basketballRoutes.playerFromName(p.player_name, p.player_key);
                  return (
                    <Link
                      key={p.player_key}
                      href={playerSlug}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-400/40 hover:bg-white/10 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-amber-300">
                        {p.player_image ? (
                          <img
                            src={p.player_image}
                            alt={p.player_name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          p.player_number ? `#${p.player_number}` : '🏀'
                        )}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors block truncate">
                          {p.player_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.player_type || 'Player'}{p.player_age ? ` • ${p.player_age}y` : ''}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

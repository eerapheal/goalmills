'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cricketApi } from '@/services/cricketApi';
import { CricketEvent, CricketTeam } from '@goalmills/types';
import { CricketMatchCard } from '@/components/CricketMatchCard';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import { BackButton } from '@/components/BackButton';
import { extractKeyFromSlug, cricketRoutes, slugify } from '@/lib/slugUtils';
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

interface CricketTeamPlayerItem {
  player_key: string;
  player_name: string;
  player_type?: string;
  player_image?: string;
  player_number?: string;
}

export default function CricketTeamSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const teamIdStr = extractKeyFromSlug(slug);
  const teamId = parseInt(teamIdStr, 10);

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<CricketTeam | null>(null);
  const [matches, setMatches] = useState<CricketEvent[]>([]);
  const [players, setPlayers] = useState<CricketTeamPlayerItem[]>([]);
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

        const [teamsRes, fixturesRes] = await Promise.allSettled([
          cricketApi.getTeams(teamId ? { teamId } : {}),
          cricketApi.getFixtures(teamId ? { teamId, from, to } : { from, to }),
        ]);

        let foundTeam: any = null;
        if (teamsRes.status === 'fulfilled' && teamsRes.value?.result) {
          const list = Array.isArray(teamsRes.value.result) ? teamsRes.value.result : [];
          foundTeam =
            list.find((t) => Number(t.team_key) === teamId || slugify(t.team_name) === slug) ||
            list[0];
          if (foundTeam) setTeam(foundTeam);
        }

        let matchList: CricketEvent[] = [];
        if (fixturesRes.status === 'fulfilled' && fixturesRes.value?.result) {
          matchList = Array.isArray(fixturesRes.value.result) ? fixturesRes.value.result : [];
          setMatches(matchList);
        }

        // If team was not in Teams list, infer from match fixtures
        if (!foundTeam && matchList.length > 0) {
          const m = matchList.find(
            (item) =>
              Number(item.home_team_key) === teamId ||
              Number(item.away_team_key) === teamId ||
              slugify(item.event_home_team) === slug ||
              slugify(item.event_away_team) === slug
          ) || matchList[0];

          if (m) {
            const isHome = Number(m.home_team_key) === teamId || slugify(m.event_home_team) === slug;
            const inferred: CricketTeam = {
              team_key: String(isHome ? m.home_team_key : m.away_team_key),
              team_name: isHome ? m.event_home_team : m.event_away_team,
              team_logo: (isHome ? m.event_home_team_logo : m.event_away_team_logo) || null,
            };
            setTeam(inferred);
            foundTeam = inferred;
          }
        }

        // Gather players from team.players or fallback from match lineups
        let playerList: CricketTeamPlayerItem[] = [];
        if (foundTeam && Array.isArray((foundTeam as any).players)) {
          playerList = (foundTeam as any).players;
        } else {
          // Extract from lineups across matches
          const playerMap = new Map<string, CricketTeamPlayerItem>();
          matchList.forEach((m) => {
            const isHome = Number(m.home_team_key) === teamId || slugify(m.event_home_team) === slug;
            const lineup = isHome ? m.lineups?.home_team?.starting_lineups : m.lineups?.away_team?.starting_lineups;
            if (Array.isArray(lineup)) {
              lineup.forEach((p, idx) => {
                if (p.player && !playerMap.has(p.player)) {
                  playerMap.set(p.player, {
                    player_key: `${teamId}-${idx + 1}`,
                    player_name: p.player,
                    player_type: 'Squad Member',
                  });
                }
              });
            }
          });
          playerList = Array.from(playerMap.values());
        }
        setPlayers(playerList);
      } catch (err) {
        console.error('Error loading cricket team data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTeamData();
  }, [teamId, slug]);

  const teamName = team?.team_name || (teamId ? `Cricket Club #${teamId}` : 'Cricket Team');

  // JSON-LD structured data
  const jsonLd = useMemo(() => {
    if (!team) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsTeam',
      name: teamName,
      sport: 'Cricket',
      logo: team.team_logo,
    };
  }, [team, teamName]);

  const recentMatches = useMemo(() => {
    return matches.filter(
      (m) =>
        m.event_status === 'Finished' ||
        m.event_status === 'FT' ||
        m.event_status?.toLowerCase().includes('won') ||
        m.event_status?.toLowerCase().includes('complete')
    );
  }, [matches]);

  const upcomingMatches = useMemo(() => {
    return matches.filter(
      (m) =>
        m.event_status !== 'Finished' &&
        m.event_status !== 'FT' &&
        !m.event_status?.toLowerCase().includes('won') &&
        !m.event_status?.toLowerCase().includes('complete')
    );
  }, [matches]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a1a] pt-[90px] flex flex-col items-center justify-center space-y-3">
        <GoalmillsLoader />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
          Loading Team Profile & Squad Intel...
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
                  <span className="text-3xl font-black text-red-400">{teamName.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                    Cricket Club
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">• ID #{team?.team_key || teamId}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {teamName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-2xl bg-[#170B10] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Squad</span>
                <span className="text-sm font-black text-white">{players.length || '-'}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#170B10] border border-white/10 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Fixtures</span>
                <span className="text-sm font-black text-red-400">{matches.length || '-'}</span>
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
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
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
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FiCalendar />
            <span>Fixtures ({matches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('squad')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'squad'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
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
            <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiTrendingUp className="text-red-400" />
                <span>Recent Match Results</span>
              </h3>
              {recentMatches.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No recent completed fixtures on record.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentMatches.slice(0, 4).map((m) => (
                    <CricketMatchCard key={m.event_key} match={m} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Matches */}
            <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FiCalendar className="text-sky-400" />
                <span>Upcoming Scheduled Fixtures</span>
              </h3>
              {upcomingMatches.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No upcoming fixtures scheduled in the near window.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingMatches.slice(0, 4).map((m) => (
                    <CricketMatchCard key={m.event_key} match={m} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Fixtures */}
        {activeTab === 'fixtures' && (
          <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiCalendar className="text-sky-400" />
              <span>Team Fixture Schedule</span>
            </h3>
            {matches.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No fixtures found for this team.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matches.map((m) => (
                  <CricketMatchCard key={m.event_key} match={m} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Squad */}
        {activeTab === 'squad' && (
          <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiUsers className="text-red-400" />
              <span>Official Squad Roster</span>
            </h3>
            {players.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Squad roster information is currently being finalized.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map((p, idx) => {
                  const playerSlug = cricketRoutes.playerFromName(p.player_name, p.player_key);
                  return (
                    <Link
                      key={p.player_key || idx}
                      href={playerSlug}
                      className="group p-3.5 rounded-2xl bg-[#0D0609]/80 border border-white/5 hover:border-red-500/40 hover:bg-[#1E090D] transition-all flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-red-400 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                        {p.player_image ? (
                          <img
                            src={p.player_image}
                            alt={p.player_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{p.player_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-xs truncate group-hover:text-red-300 transition-colors">
                          {p.player_name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{p.player_type || 'Cricket Player'}</span>
                          {p.player_number && (
                            <span className="text-slate-500">#{p.player_number}</span>
                          )}
                        </div>
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

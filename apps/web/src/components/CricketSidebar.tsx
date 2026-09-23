'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cricketApi } from '@/services/cricketApi';
import { cricketRoutes } from '@/lib/slugUtils';
import { CricketLeague, CricketTeam, CricketStanding } from '@goalmills/types';
import {
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
  FiMail,
  FiActivity,
  FiZap,
} from 'react-icons/fi';

export interface MajorTournamentItem {
  name: string;
  key: string | number;
  slug: string;
  type: string;
  flag?: string;
}

export interface FeaturedTeamItem {
  name: string;
  key: string | number;
  role: string;
  logo?: string | null;
}

// Verified AllSportsAPI v2 Cricket Tournament IDs as rock-solid initial state
export const INITIAL_MAJOR_TOURNAMENTS: MajorTournamentItem[] = [
  {
    name: 'Indian Premier League',
    key: 745,
    slug: 'indian-premier-league-745',
    type: 'Franchise T20',
    flag: '🇮🇳',
  },
  {
    name: 'Pakistan Super League',
    key: 729,
    slug: 'pakistan-super-league-729',
    type: 'Franchise T20',
    flag: '🇵🇰',
  },
  {
    name: 'Big Bash League',
    key: 13464,
    slug: 'big-bash-league-13464',
    type: 'Franchise T20',
    flag: '🇦🇺',
  },
  {
    name: 'Caribbean Premier League',
    key: 7735,
    slug: 'caribbean-premier-league-7735',
    type: 'Franchise T20',
    flag: '🌴',
  },
  {
    name: 'The Hundred (Men)',
    key: 9897,
    slug: 'the-hundred-mens-competition-9897',
    type: '100-Ball',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  { name: 'SA20 League', key: 8459, slug: 'sa20-8459', type: 'Franchise T20', flag: '🇿🇦' },
  {
    name: 'Bangladesh Premier League',
    key: 8453,
    slug: 'bangladesh-premier-league-8453',
    type: 'Franchise T20',
    flag: '🇧🇩',
  },
  {
    name: 'CSA T20 Challenge',
    key: 732,
    slug: 'csa-t20-challenge-732',
    type: 'Domestic T20',
    flag: '🇿🇦',
  },
];

// Verified AllSportsAPI v2 Cricket Team IDs as rock-solid initial state
export const INITIAL_FEATURED_TEAMS: FeaturedTeamItem[] = [
  {
    name: 'Chennai Super Kings',
    key: 141,
    role: '5x IPL Champions',
    logo: 'https://apiv2.allsportsapi.com/logo-cricket/141_chennai-super-kings.png',
  },
  {
    name: 'Mumbai Indians',
    key: 144,
    role: '5x IPL Champions',
    logo: 'https://apiv2.allsportsapi.com/logo-cricket/144_mumbai-indians.png',
  },
  {
    name: 'Kolkata Knight Riders',
    key: 142,
    role: 'IPL Champions',
    logo: 'https://apiv2.allsportsapi.com/logo-cricket/142_kolkata-knight-riders.png',
  },
  {
    name: 'Royal Challengers Bangalore',
    key: 146,
    role: 'IPL Contenders',
    logo: 'https://apiv2.allsportsapi.com/logo-cricket/146_royal-challengers-bangalore.png',
  },
  {
    name: 'Gujarat Titans',
    key: 147,
    role: '2022 Champions',
    logo: 'https://apiv2.allsportsapi.com/logo-cricket/147_gujarat-titans.png',
  },
  {
    name: 'Rajasthan Royals',
    key: 150,
    role: 'Inaugural Champions',
    logo: 'https://apiv2.allsportsapi.com/logo-cricket/150_rajasthan-royals.png',
  },
  {
    name: 'India',
    key: 139,
    role: 'ICC Top Ranked',
    logo: 'https://apiv2.allsportsapi.com/logo-cricket/139_india.png',
  },
  {
    name: 'Delhi Capitals',
    key: 143,
    role: 'IPL Franchise',
    logo: 'https://apiv2.allsportsapi.com/logo-cricket/143_delhi-capitals.png',
  },
];

export function CricketSidebar() {
  const [tournaments, setTournaments] = useState<MajorTournamentItem[]>(INITIAL_MAJOR_TOURNAMENTS);
  const [teams, setTeams] = useState<FeaturedTeamItem[]>(INITIAL_FEATURED_TEAMS);
  const [miniStandings, setMiniStandings] = useState<CricketStanding[]>([]);
  const [liveCount, setLiveCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDynamicCricketData() {
      try {
        // Parallel fetch from AllSportsAPI Cricket endpoints
        const [leaguesRes, teamsRes, standingsRes, liveRes] = await Promise.allSettled([
          cricketApi.getLeagues(),
          cricketApi.getTeams({ leagueId: 745 }), // Real IPL Teams endpoint
          cricketApi.getStandings({ leagueId: 745 }), // Real IPL Standings
          cricketApi.getLivescore(),
        ]);

        if (!isMounted) return;

        // 1. Process Dynamic Leagues from AllSportsAPI
        if (leaguesRes.status === 'fulfilled' && Array.isArray(leaguesRes.value?.result)) {
          const allLeagues: CricketLeague[] = leaguesRes.value.result;
          const priorityKeywords = [
            'Indian Premier League',
            'Big Bash League',
            'Pakistan Super League',
            'Caribbean Premier League',
            'The Hundred',
            'SA20',
            'World Cup',
            'Bangladesh Premier League',
            'Super League',
            'T20',
          ];

          const filtered = allLeagues.filter((l) =>
            priorityKeywords.some((k) =>
              (l.league_name || '').toLowerCase().includes(k.toLowerCase())
            )
          );

          if (filtered.length > 0) {
            // Deduplicate and format top major tournaments
            const dynamicTourns: MajorTournamentItem[] = filtered.slice(0, 8).map((l) => ({
              name: l.league_name,
              key: l.league_key,
              slug: cricketRoutes
                .leagueFromName(l.league_name, l.league_key)
                .replace('/cricket/leagues/', ''),
              type: l.league_year ? `Season ${l.league_year}` : 'Premier League',
              flag: '🏏',
            }));
            setTournaments(dynamicTourns);
          }
        }

        // 2. Process Dynamic Teams from AllSportsAPI
        if (teamsRes.status === 'fulfilled' && Array.isArray(teamsRes.value?.result)) {
          const apiTeams = teamsRes.value.result;
          if (apiTeams.length > 0) {
            const dynamicTeams: FeaturedTeamItem[] = apiTeams.slice(0, 8).map((t: any) => ({
              name: t.team_name,
              key: t.team_key,
              role: 'IPL Franchise',
              logo: t.team_logo,
            }));
            setTeams(dynamicTeams);
          }
        }

        // 3. Process Dynamic Mini Standings from AllSportsAPI
        if (standingsRes.status === 'fulfilled') {
          let standingList =
            standingsRes.value?.result?.total ||
            (Array.isArray(standingsRes.value?.result) ? standingsRes.value.result : []);

          if (!Array.isArray(standingList) || standingList.length === 0) {
            // Fallback to active league 732 (CSA T20 Challenge) if 745 is in off-season
            const activeRes = await cricketApi.getStandings({ leagueId: 732 }).catch(() => null);
            standingList =
              activeRes?.result?.total ||
              (Array.isArray(activeRes?.result) ? activeRes.result : []);
          }

          if (Array.isArray(standingList) && standingList.length > 0) {
            setMiniStandings(standingList.slice(0, 5));
          }
        }

        // 4. Process Dynamic Live Match count
        if (liveRes.status === 'fulfilled' && Array.isArray(liveRes.value?.result)) {
          setLiveCount(liveRes.value.result.length);
        }
      } catch (err) {
        console.warn('[CricketSidebar] Dynamic AllSportsAPI fetch warning:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDynamicCricketData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Dynamic Live Pulse Banner (If live matches active) */}
      {liveCount > 0 && (
        <div className="rounded-3xl border border-red-500/40 bg-gradient-to-br from-[#1E090D] via-[#2A0C13] to-[#120508] p-4 shadow-xl shadow-red-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-red-300">
                Live Cricket Stream
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-black">
              {liveCount} In Play
            </span>
          </div>
        </div>
      )}

      {/* Major Competitions Quick Navigator (Dynamic from AllSportsAPI) */}
      <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FiAward className="text-red-400" />
            <span>Premier Competitions</span>
          </h3>
          <span className="text-[10px] text-red-400 uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
            AllSportsAPI
          </span>
        </div>
        <div className="space-y-2">
          {tournaments.map((tourn) => (
            <Link
              key={tourn.key}
              href={cricketRoutes.league(tourn.slug)}
              className="group flex items-center justify-between p-3 rounded-2xl bg-[#0D0609] hover:bg-red-600/20 border border-red-500/15 hover:border-red-400/40 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-red-400 font-black text-xs group-hover:border-red-400 transition-colors">
                  {tourn.flag || '🏏'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-red-300 transition-colors line-clamp-1">
                    {tourn.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">{tourn.type}</p>
                </div>
              </div>
              <FiArrowRight
                size={14}
                className="text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Teams (Dynamic with Real Logos from AllSportsAPI) */}
      <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FiUsers className="text-red-400" />
            <span>Featured Franchises</span>
          </h3>
          <span className="text-[10px] text-red-300 uppercase font-bold font-mono">Rosters</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {teams.map((team) => (
            <Link
              key={team.key}
              href={cricketRoutes.teamFromName(team.name, team.key)}
              className="group flex flex-col items-center text-center p-3 rounded-2xl bg-[#0D0609] hover:bg-red-600/20 border border-red-500/15 hover:border-red-400/40 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 p-1 mb-2 flex items-center justify-center font-black text-red-400 text-sm group-hover:scale-105 transition-transform overflow-hidden">
                {team.logo ? (
                  <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                ) : (
                  <span>{team.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-red-300 truncate max-w-full">
                {team.name}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold truncate max-w-full">
                {team.role}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Live IPL / League Points Table Snapshot (Dynamic Standings) */}
      {miniStandings.length > 0 && (
        <div className="rounded-3xl border border-red-500/20 bg-[#170B10]/90 p-5 space-y-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FiTrendingUp className="text-yellow-400" />
              <span>Standings Leaderboard</span>
            </h3>
            <Link
              href={cricketRoutes.league('indian-premier-league-745')}
              className="text-[10px] text-yellow-400 hover:text-yellow-300 font-bold uppercase tracking-wider"
            >
              Full Table →
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0D0609]/80">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                  <th className="py-2 px-2.5 text-center">#</th>
                  <th className="py-2 px-2">Club</th>
                  <th className="py-2 px-2 text-center">P</th>
                  <th className="py-2 px-2 text-center text-red-400">W</th>
                  <th className="py-2 px-2 text-center text-yellow-400">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {miniStandings.map((s, idx) => (
                  <tr key={s.team_key || idx} className="hover:bg-white/5">
                    <td className="py-2 px-2.5 text-center font-bold text-slate-400 font-sans text-[11px]">
                      {s.standing_place || idx + 1}
                    </td>
                    <td className="py-2 px-2 font-sans font-bold text-white text-[11px] truncate max-w-[120px]">
                      <Link
                        href={cricketRoutes.teamFromName(s.standing_team, s.team_key)}
                        className="hover:text-red-300 transition-colors"
                      >
                        {s.standing_team}
                      </Link>
                    </td>
                    <td className="py-2 px-2 text-center text-slate-300">{s.standing_MP || '0'}</td>
                    <td className="py-2 px-2 text-center text-red-400 font-bold">
                      {s.standing_W || '0'}
                    </td>
                    <td className="py-2 px-2 text-center font-black text-yellow-400">
                      {s.standing_Pts || '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIP Cricket Newsletter Box */}
      <div className="rounded-3xl border border-red-500/30 bg-gradient-to-b from-[#250D13] to-[#120508] p-5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wider">
          <FiMail className="w-4 h-4" />
          <span>Cricket Daily Brief</span>
        </div>
        <h4 className="text-sm font-black text-white">Get Daily Match Previews & Toss Flashes</h4>
        <p className="text-xs text-slate-300">
          Tournament predictions, pitch reports, and squad lineups delivered before toss.
        </p>
        <Link
          href="/newsletter"
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 text-white font-black text-xs uppercase tracking-wider shadow-md hover:from-red-500 hover:to-yellow-400 transition-all"
        >
          <span>Subscribe Now</span>
          <FiArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

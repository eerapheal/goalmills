'use client';

import {
  FootballStanding,
  FootballTeam,
  StandingTable,
  StandingEntry,
} from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { advancedFootballApi } from '../services/advancedFootballApi';
import { useState, useEffect, useMemo } from 'react';
import { footballRoutes } from '@/lib/slugUtils';
import { getStandingsRulesetById } from '@/lib/football/standingsRulesets';

interface UnifiedStandingRow {
  key: string;
  rank: number;
  teamName: string;
  teamLogo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gd: number;
  pts: number;
  form?: ('W' | 'D' | 'L')[];
}

interface FootballStandingsTableProps {
  standings?: FootballStanding[];
  table?: StandingTable;
  teams?: FootballTeam[];
  leagueId?: string | number;
  compact?: boolean;
  showRulesetFooter?: boolean;
}

export function FootballStandingsTable({
  standings = [],
  table,
  teams = [],
  leagueId,
  compact = false,
  showRulesetFooter = true,
}: FootballStandingsTableProps) {
  // Resolve ruleset from table if provided
  const ruleset = useMemo(() => {
    if (table?.rulesetId) {
      return getStandingsRulesetById(table.rulesetId);
    }
    return getStandingsRulesetById('RULESET-STANDARD-3PT');
  }, [table?.rulesetId]);

  // Tournament-specific configurations
  const isUCL = String(leagueId) === '3' || table?.type === 'LEAGUE_PHASE';
  const isUEL = String(leagueId) === '4';
  const isUECL = String(leagueId) === '683';
  const isEuropeanTournament = isUCL || isUEL || isUECL;
  const isGroup = table?.type === 'GROUP';

  const [teamForms, setTeamForms] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchRecentMatches = async () => {
      if (!leagueId) return;
      try {
        const past = new Date();
        past.setDate(past.getDate() - 120);
        const from = past.toISOString().split('T')[0];
        const to = new Date().toISOString().split('T')[0];

        const res = await advancedFootballApi
          .getFixtures({ leagueId: Number(leagueId), from, to })
          .catch(() => null);
        if (res?.result) {
          const forms: Record<string, string[]> = {};

          const finished = res.result
            .filter((m: any) => m.event_status === 'Finished' || m.event_status === 'FT')
            .sort(
              (a: any, b: any) =>
                new Date(`${b.event_date} ${b.event_time}`).getTime() -
                new Date(`${a.event_date} ${a.event_time}`).getTime()
            );

          finished.forEach((match: any) => {
            const h = match.home_team_key;
            const a = match.away_team_key;
            const finalSplit = match.event_final_result?.split(' - ') || [];
            const hScore = parseInt(finalSplit[0] || '0', 10);
            const aScore = parseInt(finalSplit[1] || '0', 10);

            if (!forms[h]) forms[h] = [];
            if (!forms[a]) forms[a] = [];

            if (forms[h].length < 5)
              forms[h].push(hScore > aScore ? 'W' : hScore < aScore ? 'L' : 'D');
            if (forms[a].length < 5)
              forms[a].push(aScore > hScore ? 'W' : aScore < hScore ? 'L' : 'D');
          });

          Object.keys(forms).forEach((k) => forms[k].reverse());
          setTeamForms(forms);
        }
      } catch (err) {
        console.error('Failed to fetch form data', err);
      }
    };

    fetchRecentMatches();
  }, [leagueId]);

  // Normalize input into unified row models
  const rows: UnifiedStandingRow[] = useMemo(() => {
    if (table && table.entries && table.entries.length > 0) {
      return table.entries.map((e, idx) => ({
        key: e.id || `entry-${idx}`,
        rank: e.position,
        teamName: e.teamName,
        teamLogo: e.teamLogo,
        played: e.played,
        won: e.won,
        drawn: e.drawn,
        lost: e.lost,
        gd: e.goalDifference,
        pts: e.points,
        form: e.form,
      }));
    }

    if (standings && standings.length > 0) {
      return standings.map((s, idx) => {
        const teamObj = teams.find((t) => String(t.team_key) === String(s.team_key));
        const logo = teamObj?.team_logo;
        return {
          key: `${s.team_key}-${idx}`,
          rank: parseInt(s.standing_place, 10) || idx + 1,
          teamName: s.standing_team,
          teamLogo: logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.standing_team)}&background=random`,
          played: parseInt(s.standing_P, 10) || 0,
          won: parseInt(s.standing_W, 10) || 0,
          drawn: parseInt(s.standing_D, 10) || 0,
          lost: parseInt(s.standing_L, 10) || 0,
          gd: parseInt(s.standing_GD, 10) || 0,
          pts: parseInt(s.standing_PTS, 10) || 0,
          form: (teamForms[s.team_key] as ('W' | 'D' | 'L')[]) || undefined,
        };
      });
    }

    return [];
  }, [table, standings, teams, teamForms]);

  // Style helpers based on league/rank
  const getRankStyles = (rank: number) => {
    if (isGroup) {
      if (rank <= 2) {
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-black shadow-sm';
      }
      if (rank === 3) {
        return 'bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold';
      }
      return 'text-slate-500';
    }

    if (isEuropeanTournament) {
      if (rank <= 8) {
        return 'bg-blue-500/20 text-blue-300 border border-blue-400/40 font-black shadow-sm';
      }
      if (rank <= 24) {
        return 'bg-white/5 text-slate-300 border border-white/10';
      }
      return 'text-slate-500';
    }

    if (rank === 1)
      return 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-105';
    if (rank <= 4) return 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-bold';
    if (rank >= 18) return 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold';
    return 'text-slate-400 group-hover:text-white';
  };

  const tiebreakerLabels: Record<string, string> = {
    POINTS: 'Points',
    GOAL_DIFFERENCE: 'Goal Difference',
    GOALS_FOR: 'Goals Scored',
    HEAD_TO_HEAD: 'Head-to-Head',
    HEAD_TO_HEAD_GOAL_DIFFERENCE: 'H2H Goal Diff',
    HEAD_TO_HEAD_AWAY_GOALS: 'H2H Away Goals',
    AWAY_GOALS: 'Away Goals',
    WINS: 'Wins',
    DISCIPLINARY_POINTS: 'Fair Play',
    PLAYOFF: 'Playoff Match',
    DRAWING_OF_LOTS: 'Drawing of Lots',
  };

  return (
    <div className="w-full bg-[#0A1424]/90 backdrop-blur-md rounded-2xl overflow-hidden border border-blue-500/20 shadow-2xl">
      {/* Table Header */}
      <div className="flex items-center bg-[#0E1F38] py-3 px-3 sm:px-5 border-b border-white/10 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider">
        <div className="w-7 sm:w-8 shrink-0 text-center">#</div>
        <div className="flex-1 min-w-0 pl-2 sm:pl-3">Club</div>
        <div className="flex items-center shrink-0">
          <div className="w-7 sm:w-8 text-center">P</div>
          <div className="hidden sm:block w-7 sm:w-8 text-center text-blue-400">W</div>
          <div className="hidden sm:block w-7 sm:w-8 text-center text-slate-400">D</div>
          <div className="hidden sm:block w-7 sm:w-8 text-center text-rose-400">L</div>
          <div className="w-8 sm:w-9 text-center">GD</div>
          <div className="w-8 sm:w-10 text-center text-amber-400 font-black">Pts</div>
          {!compact && <div className="hidden xl:block w-28 text-center">Form (Last 5)</div>}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-white/5 font-medium">
        {rows.map((row) => {
          const teamUrl = footballRoutes.teamFromName(row.teamName);

          return (
            <div
              key={row.key}
              className="flex items-center py-2.5 sm:py-3 px-3 sm:px-5 transition-colors duration-200 hover:bg-blue-600/10 group"
            >
              {/* Rank */}
              <div className="w-7 sm:w-8 shrink-0 flex justify-center">
                <span
                  className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-xs transition-all ${getRankStyles(
                    row.rank
                  )}`}
                >
                  {row.rank}
                </span>
              </div>

              {/* Club */}
              <div className="flex-1 min-w-0 pl-2 sm:pl-3 pr-1 sm:pr-2">
                <Link
                  href={teamUrl}
                  className="flex items-center min-w-0 hover:scale-[1.01] transition-transform origin-left"
                >
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 mr-2 shrink-0 p-0.5 bg-slate-900/80 rounded-md border border-white/10 group-hover:border-blue-400/40 transition-colors flex items-center justify-center">
                    <Image
                      src={row.teamLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.teamName)}&background=random`}
                      alt={row.teamName}
                      width={24}
                      height={24}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {row.teamName}
                  </span>
                </Link>
              </div>

              {/* Numeric Stats */}
              <div className="flex items-center shrink-0 text-xs sm:text-sm">
                <div className="w-7 sm:w-8 text-center text-slate-300 font-mono">{row.played}</div>
                <div className="hidden sm:block w-7 sm:w-8 text-center text-blue-400 font-bold font-mono">
                  {row.won}
                </div>
                <div className="hidden sm:block w-7 sm:w-8 text-center text-slate-400 font-mono">
                  {row.drawn}
                </div>
                <div className="hidden sm:block w-7 sm:w-8 text-center text-rose-400 font-bold font-mono">
                  {row.lost}
                </div>
                <div
                  className={`w-8 sm:w-9 text-center font-mono text-[11px] sm:text-xs ${
                    row.gd > 0 ? 'text-blue-400' : row.gd < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </div>
                <div className="w-8 sm:w-10 text-center font-black text-amber-400 text-xs sm:text-sm">
                  {row.pts}
                </div>

                {/* Form - Large screens only */}
                {!compact && (
                  <div className="hidden xl:flex w-28 items-center justify-center gap-1">
                    {row.form && row.form.length > 0 ? (
                      row.form.map((res: string, i: number) => (
                        <span
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded text-[8px] sm:text-[9px] font-black ${
                            res === 'W'
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                              : res === 'D'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                          title={res === 'W' ? 'Win' : res === 'D' ? 'Draw' : 'Loss'}
                        >
                          {res}
                        </span>
                      ))
                    ) : (
                      <div className="flex gap-1 opacity-20">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/10" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ruleset & Qualification Legend Footer */}
      {showRulesetFooter && (
        <div className="bg-[#081220] border-t border-white/5 divide-y divide-white/5 text-[10px] text-slate-400">
          {/* Visual Legend */}
          <div className="px-4 py-2 flex flex-wrap items-center gap-4">
            {isEuropeanTournament ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500/80" />
                  <span className="text-slate-300 font-semibold">1-8: Round of 16 (Direct)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-white/30" />
                  <span className="text-slate-300 font-semibold">9-24: Play-off Round</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500/40" />
                  <span className="text-slate-400">25-36: Eliminated</span>
                </div>
              </>
            ) : isGroup ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500/80" />
                  <span className="text-slate-300 font-semibold">1-2: Knockout Stage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500/80" />
                  <span className="text-slate-300 font-semibold">3: Possible Wildcard</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500/80" />
                  <span className="text-slate-300 font-semibold">1-4: Champions League</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500/80" />
                  <span className="text-slate-300 font-semibold">5: Europa League</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500/80" />
                  <span className="text-slate-300 font-semibold">Relegation Zone</span>
                </div>
              </>
            )}
          </div>

          {/* Tiebreaker Sequence */}
          {ruleset && (
            <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-300">Ruleset:</span>
                <span>{ruleset.name}</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-bold text-slate-300">Tiebreakers:</span>
                <span>
                  {ruleset.tiebreakers.map((t) => tiebreakerLabels[t] || t).join(' → ')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

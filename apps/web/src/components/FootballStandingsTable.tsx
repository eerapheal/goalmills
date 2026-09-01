'use client';

import { FootballStanding, FootballTeam } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { advancedFootballApi } from '../services/advancedFootballApi';
import { useState, useEffect } from 'react';
import { footballRoutes } from '@/lib/slugUtils';

interface FootballStandingsTableProps {
  standings: FootballStanding[];
  teams?: FootballTeam[];
  leagueId?: string | number;
  compact?: boolean;
}

export function FootballStandingsTable({
  standings,
  teams = [],
  leagueId,
  compact = false,
}: FootballStandingsTableProps) {
  // Tournament-specific configurations
  const isUCL = String(leagueId) === '3';
  const isUEL = String(leagueId) === '4';
  const isUECL = String(leagueId) === '683';
  const isEuropeanTournament = isUCL || isUEL || isUECL;

  const getTeamLogo = (teamKey: string | number) => {
    if (!teamKey) return `https://ui-avatars.com/api/?name=Team&background=random`;
    const team = teams.find((t) => String(t.team_key) === String(teamKey));
    const logo = team?.team_logo;
    return logo && logo !== ''
      ? logo
      : `https://ui-avatars.com/api/?name=Team+${teamKey}&background=random`;
  };

  // Style helpers based on league/rank
  const getRankStyles = (rank: number) => {
    if (isEuropeanTournament) {
      if (rank <= 8) {
        return 'bg-blue-500/20 text-blue-300 border border-blue-400/40 font-black shadow-sm';
      }
      if (rank <= 24) {
        return 'bg-white/5 text-slate-300 border border-white/10';
      }
      return 'text-slate-500';
    }

    if (rank === 1) return 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-105';
    if (rank <= 4) return 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-bold';
    if (rank >= 18) return 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold';
    return 'text-slate-400 group-hover:text-white';
  };

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
            const hScore = parseInt(finalSplit[0] || '0');
            const aScore = parseInt(finalSplit[1] || '0');

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

  return (
    <div className="w-full bg-[#0A1424]/90 backdrop-blur-md rounded-2xl overflow-hidden border border-blue-500/20 shadow-2xl">
      {/* Table Header */}
      <div className="flex items-center bg-[#0E1F38] py-3 px-3 sm:px-5 border-b border-white/10 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider">
        {/* Pos */}
        <div className="w-7 sm:w-8 shrink-0 text-center">#</div>

        {/* Club Name (Flex-1 for maximum breathing room) */}
        <div className="flex-1 min-w-0 pl-2 sm:pl-3">Club</div>

        {/* Numeric Stat Columns */}
        <div className="flex items-center shrink-0">
          <div className="w-7 sm:w-8 text-center">P</div>
          <div className="hidden sm:block w-7 sm:w-8 text-center text-emerald-400">W</div>
          <div className="hidden sm:block w-7 sm:w-8 text-center text-slate-400">D</div>
          <div className="hidden sm:block w-7 sm:w-8 text-center text-rose-400">L</div>
          <div className="w-8 sm:w-9 text-center">GD</div>
          <div className="w-8 sm:w-10 text-center text-amber-400 font-black">Pts</div>
          {!compact && (
            <div className="hidden xl:block w-28 text-center">Form (Last 5)</div>
          )}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-white/5 font-medium">
        {standings.map((standing, index) => {
          const rank = parseInt(standing.standing_place);
          const logo = getTeamLogo(standing.team_key);
          const gd = parseInt(standing.standing_GD);
          const teamUrl = footballRoutes.teamFromName(standing.standing_team);

          return (
            <div
              key={`${standing.team_key}-${index}`}
              className="flex items-center py-2.5 sm:py-3 px-3 sm:px-5 transition-colors duration-200 hover:bg-blue-600/10 group"
            >
              {/* Rank */}
              <div className="w-7 sm:w-8 shrink-0 flex justify-center">
                <span
                  className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-xs transition-all ${getRankStyles(
                    rank
                  )}`}
                >
                  {standing.standing_place}
                </span>
              </div>

              {/* Club (Flex-1 ensures team name gets 60-70%+ of mobile screen width) */}
              <div className="flex-1 min-w-0 pl-2 sm:pl-3 pr-1 sm:pr-2">
                <Link
                  href={teamUrl}
                  className="flex items-center min-w-0 hover:scale-[1.01] transition-transform origin-left"
                >
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 mr-2 shrink-0 p-0.5 bg-slate-900/80 rounded-md border border-white/10 group-hover:border-blue-400/40 transition-colors flex items-center justify-center">
                    <Image
                      src={logo || `https://ui-avatars.com/api/?name=T&background=random`}
                      alt={standing.standing_team}
                      width={24}
                      height={24}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {standing.standing_team}
                  </span>
                </Link>
              </div>

              {/* Numeric Stats */}
              <div className="flex items-center shrink-0 text-xs sm:text-sm">
                <div className="w-7 sm:w-8 text-center text-slate-300 font-mono">
                  {standing.standing_P}
                </div>
                <div className="hidden sm:block w-7 sm:w-8 text-center text-emerald-400 font-bold font-mono">
                  {standing.standing_W}
                </div>
                <div className="hidden sm:block w-7 sm:w-8 text-center text-slate-400 font-mono">
                  {standing.standing_D}
                </div>
                <div className="hidden sm:block w-7 sm:w-8 text-center text-rose-400 font-bold font-mono">
                  {standing.standing_L}
                </div>
                <div
                  className={`w-8 sm:w-9 text-center font-mono text-[11px] sm:text-xs ${
                    gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {gd > 0 ? `+${gd}` : gd}
                </div>

                {/* Points */}
                <div className="w-8 sm:w-10 text-center font-black text-amber-400 text-xs sm:text-sm">
                  {standing.standing_PTS}
                </div>

                {/* Form - Large screens only */}
                {!compact && (
                  <div className="hidden xl:flex w-28 items-center justify-center gap-1">
                    {(() => {
                      const displayForm = teamForms[standing.team_key];

                      return displayForm && displayForm.length > 0 ? (
                        displayForm.map((res: string, i: number) => (
                          <span
                            key={i}
                            className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded text-[8px] sm:text-[9px] font-black ${
                              res === 'W'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
                            <div
                              key={i}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/10"
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

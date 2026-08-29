'use client';

import { FootballStanding, FootballTeam } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { advancedFootballApi } from '../services/advancedFootballApi';
import { useState, useEffect } from 'react';

interface FootballStandingsTableProps {
  standings: FootballStanding[];
  teams?: FootballTeam[];
  leagueId?: string | number;
}

export function FootballStandingsTable({
  standings,
  teams = [],
  leagueId,
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
      <div className="grid grid-cols-12 bg-[#0E1F38] py-3.5 px-4 sm:px-6 border-b border-white/10 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider">
        <div className="col-span-1 text-center">Pos</div>
        <div className="col-span-11 grid grid-cols-12 items-center">
          <div className="col-span-4 pl-3">Club</div>
          <div className="col-span-1 text-center">PL</div>
          <div className="col-span-1 text-center">W</div>
          <div className="col-span-1 text-center">D</div>
          <div className="col-span-1 text-center">L</div>
          <div className="col-span-1 text-center">GD</div>
          <div className="col-span-1 text-center text-amber-400 font-black">Pts</div>
          <div className="hidden lg:block col-span-2 text-center">Form (Last 5)</div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-white/5 font-medium">
        {standings.map((standing, index) => {
          const rank = parseInt(standing.standing_place);
          const logo = getTeamLogo(standing.team_key);
          const gd = parseInt(standing.standing_GD);

          return (
            <div
              key={`${standing.team_key}-${index}`}
              className="grid grid-cols-12 items-center py-3 px-4 sm:px-6 transition-colors duration-200 hover:bg-blue-600/10 group"
            >
              {/* Rank */}
              <div className="col-span-1 flex justify-center">
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs transition-all ${getRankStyles(
                    rank
                  )}`}
                >
                  {standing.standing_place}
                </span>
              </div>

              {/* Main Content Info */}
              <div className="col-span-11 grid grid-cols-12 items-center">
                {/* Team */}
                <div className="col-span-4 pl-3 flex items-center min-w-0">
                  <Link
                    href={`/teams/${standing.team_key}`}
                    className="flex items-center min-w-0 hover:scale-[1.02] transition-transform origin-left"
                  >
                    <div className="relative w-7 h-7 mr-2.5 shrink-0 p-0.5 bg-slate-900 rounded-lg border border-white/10 group-hover:border-blue-400/40 transition-colors">
                      <Image
                        src={logo || `https://ui-avatars.com/api/?name=T&background=random`}
                        alt={standing.standing_team}
                        width={28}
                        height={28}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {standing.standing_team}
                    </span>
                  </Link>
                </div>

                {/* Stats */}
                <div className="col-span-1 text-center text-xs sm:text-sm text-slate-300">
                  {standing.standing_P}
                </div>
                <div className="col-span-1 text-center text-xs sm:text-sm text-emerald-400 font-bold">
                  {standing.standing_W}
                </div>
                <div className="col-span-1 text-center text-xs sm:text-sm text-slate-400">
                  {standing.standing_D}
                </div>
                <div className="col-span-1 text-center text-xs sm:text-sm text-rose-400 font-bold">
                  {standing.standing_L}
                </div>
                <div
                  className={`col-span-1 text-center text-xs sm:text-sm font-mono ${
                    gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {gd > 0 ? `+${gd}` : gd}
                </div>

                {/* Points */}
                <div className="col-span-1 text-center text-sm sm:text-base font-black text-amber-400">
                  {standing.standing_PTS}
                </div>

                {/* Form - Desktop only */}
                <div className="hidden lg:flex col-span-2 items-center justify-center gap-1">
                  {(() => {
                    const displayForm = teamForms[standing.team_key];

                    return displayForm && displayForm.length > 0 ? (
                      displayForm.map((res: string, i: number) => (
                        <span
                          key={i}
                          className={`w-5 h-5 flex items-center justify-center rounded-lg text-[9px] font-black ${
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
                            className="w-5 h-5 rounded-lg border border-white/20 bg-white/5"
                          />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="p-4 sm:p-5 bg-[#091529] border-t border-white/10 flex flex-wrap gap-x-6 gap-y-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        {isEuropeanTournament ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-300">Round of 16 (Direct Qualification)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
              <span className="text-slate-300">Knockout Play-offs (9-24)</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
              <span className="text-slate-300">League Leaders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-300">UEFA Champions League (Top 4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">Relegation Zone</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

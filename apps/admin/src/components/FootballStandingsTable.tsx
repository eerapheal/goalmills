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
    // European Tournament Logic (League Phase 1-8, 9-24)
    if (isEuropeanTournament) {
      if (rank <= 8) {
        if (isUCL) return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
        if (isUEL) return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
        if (isUECL) return 'bg-green-500/10 text-green-400 border border-green-500/20';
      }
      if (rank <= 24) {
        return 'bg-white/5 text-white border border-white/10';
      }
      return 'text-text-muted';
    }

    // Domestic League Logic (1-4 UCL, 5-6 UEL, etc.)
    if (rank === 1) return 'bg-secondary text-surface shadow-lg shadow-secondary/20 scale-110';
    if (rank <= 4) return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    if (rank >= 18) return 'bg-accent-red/10 text-accent-red border border-accent-red/20';
    return 'text-text-muted group-hover:text-white';
  };

  const getRowBg = (rank: number) => {
    if (isEuropeanTournament) {
      if (rank <= 8) {
        if (isUCL) return 'bg-blue-500/1';
        if (isUEL) return 'bg-orange-500/1';
        if (isUECL) return 'bg-green-500/1';
      }
      return '';
    }
    if (rank <= 4) return 'bg-blue-500/[0.02]';
    if (rank >= 18) return 'bg-red-500/[0.02]';
    return '';
  };

  const [teamForms, setTeamForms] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchRecentMatches = async () => {
      if (!leagueId) return;
      try {
        // Fetch last 120 days of league fixtures to ensure we get at least 5 matches
        const past = new Date();
        past.setDate(past.getDate() - 120);
        const from = past.toISOString().split('T')[0];
        const to = new Date().toISOString().split('T')[0];

        const res = await advancedFootballApi
          .getFixtures({ leagueId: Number(leagueId), from, to })
          .catch(() => null);
        if (res?.result) {
          const forms: Record<string, string[]> = {};

          // Filter finished matches and sort descending by date
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

          // Reverse them so oldest of the 5 is first, newest is last (standard form display)
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
    <div className="w-full bg-surface/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5">
      {/* Header */}
      <div className="grid grid-cols-12 bg-white/[0.03] py-4 px-6 border-b border-white/5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
        <div className="col-span-1 text-center font-bold">Pos</div>
        <div className="col-span-11 grid grid-cols-12 items-center">
          <div className="col-span-4 pl-4">Club</div>
          <div className="col-span-1 text-center font-bold">PL</div>
          <div className="col-span-1 text-center">W</div>
          <div className="col-span-1 text-center">D</div>
          <div className="col-span-1 text-center">L</div>
          <div className="col-span-1 text-center">GD</div>
          <div className="col-span-1 text-center text-secondary font-black">Pts</div>
          <div className="hidden lg:block col-span-2 text-center">Recent Form</div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.02]">
        {standings.map((standing, index) => {
          const rank = parseInt(standing.standing_place);
          const logo = getTeamLogo(standing.team_key);
          const gd = parseInt(standing.standing_GD);

          return (
            <div
              key={`${standing.team_key}-${index}`}
              className={`
                                grid grid-cols-12 items-center py-4 px-6 transition-all duration-300 hover:bg-white/[0.04] group
                                ${getRowBg(rank)}
                            `}
            >
              {/* Rank */}
              <div className="col-span-1 flex justify-center">
                <span
                  className={`
                                    w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all
                                    ${getRankStyles(rank)}
                                `}
                >
                  {standing.standing_place}
                </span>
              </div>

              {/* Main Content Info */}
              <div className="col-span-11 grid grid-cols-12 items-center">
                {/* Team */}
                <div className="col-span-4 pl-4 flex items-center min-w-0">
                  <Link
                    href={`/teams/${standing.team_key}`}
                    className="flex items-center min-w-0 hover:scale-[1.02] transition-transform origin-left"
                  >
                    <div className="relative w-8 h-8 mr-2 shrink-0 p-1 bg-white/5 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors sm:mr-4">
                      <Image
                        src={logo || `https://ui-avatars.com/api/?name=T&background=random`}
                        alt={standing.standing_team}
                        width={32}
                        height={32}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-bold truncate group-hover:text-white ${rank <= 8 && isEuropeanTournament ? 'text-white' : 'text-text-primary'}`}
                    >
                      {standing.standing_team}
                    </span>
                  </Link>
                </div>

                {/* Stats */}
                <div className="col-span-1 text-center text-[11px] sm:text-sm font-medium text-text-secondary">
                  {standing.standing_P}
                </div>
                <div className="col-span-1 text-center text-[11px] sm:text-sm text-text-muted">
                  {standing.standing_W}
                </div>
                <div className="col-span-1 text-center text-[11px] sm:text-sm text-text-muted">
                  {standing.standing_D}
                </div>
                <div className="col-span-1 text-center text-[11px] sm:text-sm text-text-muted">
                  {standing.standing_L}
                </div>
                <div
                  className={`col-span-1 text-center text-[11px] sm:text-sm font-bold
                                    ${gd > 0 ? 'text-accent-green' : gd < 0 ? 'text-accent-red' : 'text-text-muted'}
                                `}
                >
                  {standing.standing_GD}
                </div>

                {/* Points */}
                <div className="col-span-1 text-center text-sm sm:text-base font-black text-white group-hover:text-secondary transition-colors">
                  {standing.standing_PTS}
                </div>

                {/* Form - Desktop only */}
                <div className="hidden lg:flex col-span-2 items-center justify-center gap-1.5">
                  {(() => {
                    const displayForm = teamForms[standing.team_key];

                    return displayForm && displayForm.length > 0 ? (
                      displayForm.map((res: string, i: number) => (
                        <span
                          key={i}
                          className={`
                                                        w-5 h-5 flex items-center justify-center rounded text-[9px] font-black
                                                        ${
                                                          res === 'W'
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                            : res === 'D'
                                                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        }
                                                    `}
                          title={res === 'W' ? 'Win' : res === 'D' ? 'Draw' : 'Loss'}
                        >
                          {res}
                        </span>
                      ))
                    ) : (
                      <div className="flex gap-1.5 opacity-20">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded border border-white/20 bg-white/5"
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

      {/* Legend */}
      <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-wrap gap-x-8 gap-y-4 text-[10px] text-text-muted font-bold uppercase tracking-[0.1em]">
        {isEuropeanTournament ? (
          <>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isUCL ? 'bg-blue-500' : isUEL ? 'bg-orange-500' : 'bg-green-500'}`}
              />
              <span>Round of 16 (Direct)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <span>Play-offs</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Champions League</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-red" />
              <span>Relegation Zone</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

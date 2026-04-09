'use client';

import { FootballStanding, FootballTeam } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';

interface FootballStandingsTableProps {
    standings: FootballStanding[];
    teams?: FootballTeam[];
    leagueId?: string | number;
}

export function FootballStandingsTable({ standings, teams = [], leagueId }: FootballStandingsTableProps) {

    // Tournament-specific configurations
    const isUCL = String(leagueId) === '3';
    const isUEL = String(leagueId) === '4';
    const isUECL = String(leagueId) === '683';
    const isEuropeanTournament = isUCL || isUEL || isUECL;

    const getTeamLogo = (teamKey: string | number) => {
        if (!teamKey) return `https://ui-avatars.com/api/?name=Team&background=random`;
        const team = teams.find(t => String(t.team_key) === String(teamKey));
        const logo = team?.team_logo;
        return (logo && logo !== "") ? logo : `https://ui-avatars.com/api/?name=Team+${teamKey}&background=random`;
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
                    <div className="col-span-2 text-center">Recent Form</div>
                </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.02]">
                {standings.map((standing, index) => {
                    const rank = parseInt(standing.standing_place);
                    const logo = getTeamLogo(standing.team_key);
                    const gd = parseInt(standing.standing_GD);
                    
                    // Handle Form: Usually standing_LP or form in API
                    // If not present, we can show a placeholder or empty
                    const rawForm = (standing as any).form || (standing as any).standing_LP || "";
                    const formArray = rawForm.split('').filter((c: string) => ['W', 'D', 'L'].includes(c.toUpperCase())).slice(0, 4);

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
                                <span className={`
                                    w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all
                                    ${getRankStyles(rank)}
                                `}>
                                    {standing.standing_place}
                                </span>
                            </div>

                            {/* Main Content Info */}
                            <div className="col-span-11 grid grid-cols-12 items-center">
                                {/* Team */}
                                <div className="col-span-4 pl-4 flex items-center min-w-0">
                                    <Link href={`/teams/${standing.team_key}`} className="flex items-center min-w-0 hover:scale-[1.02] transition-transform origin-left">
                                        <div className="relative w-8 h-8 mr-2 shrink-0 p-1 bg-white/5 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors sm:mr-4">
                                            <Image src={logo || `https://ui-avatars.com/api/?name=T&background=random`} alt={standing.standing_team} width={32} height={32} className="object-contain w-full h-full" />
                                        </div>
                                        <span className={`text-xs sm:text-sm font-bold truncate group-hover:text-white ${rank <= 8 && isEuropeanTournament ? 'text-white' : 'text-text-primary'}`}>
                                            {standing.standing_team}
                                        </span>
                                    </Link>
                                </div>

                                {/* Stats */}
                                <div className="col-span-1 text-center text-[11px] sm:text-sm font-medium text-text-secondary">{standing.standing_P}</div>
                                <div className="col-span-1 text-center text-[11px] sm:text-sm text-text-muted">{standing.standing_W}</div>
                                <div className="col-span-1 text-center text-[11px] sm:text-sm text-text-muted">{standing.standing_D}</div>
                                <div className="col-span-1 text-center text-[11px] sm:text-sm text-text-muted">{standing.standing_L}</div>
                                <div className={`col-span-1 text-center text-[11px] sm:text-sm font-bold
                                    ${gd > 0 ? 'text-accent-green' : gd < 0 ? 'text-accent-red' : 'text-text-muted'}
                                `}>
                                    {standing.standing_GD}
                                </div>

                                {/* Points */}
                                <div className="col-span-1 text-center text-sm sm:text-base font-black text-white group-hover:text-secondary transition-colors">
                                    {standing.standing_PTS}
                                </div>

                                {/* Form */}
                                <div className="col-span-2 flex items-center justify-center gap-1.5">
                                    {formArray.length > 0 ? (
                                        formArray.map((res: string, i: number) => (
                                            <div
                                                key={i}
                                                className={`
                                                    w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]
                                                    ${res === 'W' ? 'bg-accent-green' : res === 'D' ? 'bg-secondary' : 'bg-accent-red'}
                                                `}
                                                title={res === 'W' ? 'Win' : res === 'D' ? 'Draw' : 'Loss'}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex gap-1.5 opacity-20">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-white/20" />
                                            ))}
                                        </div>
                                    )}
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
                            <div className={`w-2 h-2 rounded-full ${isUCL ? 'bg-blue-500' : isUEL ? 'bg-orange-500' : 'bg-green-500'}`} />
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

'use client';

import { FootballStanding, FootballTeam } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';

interface FootballStandingsTableProps {
    standings: FootballStanding[];
    teams?: FootballTeam[];
}

export function FootballStandingsTable({ standings, teams = [] }: FootballStandingsTableProps) {

    // Helper to get team logo from teams list if not present in standing (though mobile mock implies logic needed)
    // Actually mockStandings doesn't have logo URL directly, it has team_key. Mobile app uses `getTeamLogo` helper.
    // We should pass teams or a logo lookup.

    const getTeamLogo = (teamKey: string | number) => {
        if (!teamKey) return `https://ui-avatars.com/api/?name=Team&background=random`;
        const team = teams.find(t => String(t.team_key) === String(teamKey));
        const logo = team?.team_logo;
        return (logo && logo !== "") ? logo : `https://ui-avatars.com/api/?name=Team+${teamKey}&background=random`;
    };

    return (
        <div className="w-full bg-surface/50 backdrop-blur-sm rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 bg-white/[0.03] py-4 px-6 border-b border-white/5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                <div className="col-span-1 text-center">Pos</div>
                <div className="col-span-11 grid grid-cols-11 items-center">
                    <div className="col-span-4 pl-4">Club</div>
                    <div className="col-span-1 text-center font-bold">PL</div>
                    <div className="col-span-1 text-center">W</div>
                    <div className="col-span-1 text-center">D</div>
                    <div className="col-span-1 text-center">L</div>
                    <div className="col-span-1 text-center">GD</div>
                    <div className="col-span-2 text-center text-secondary font-black">Pts</div>
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
                                ${rank <= 4 ? 'bg-blue-500/[0.02]' : ''}
                                ${rank >= 18 ? 'bg-red-500/[0.02]' : ''}
                            `}
                        >
                            {/* Rank */}
                            <div className="col-span-1 flex justify-center">
                                <span className={`
                                    w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all
                                    ${rank === 1 ? 'bg-secondary text-surface shadow-lg shadow-secondary/20 scale-110' :
                                        rank <= 4 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            rank >= 18 ? 'bg-accent-red/10 text-accent-red border border-accent-red/20' :
                                                'text-text-muted group-hover:text-white'}
                                `}>
                                    {standing.standing_place}
                                </span>
                            </div>

                            {/* Main Content Info */}
                            <div className="col-span-11 grid grid-cols-11 items-center">
                                {/* Team */}
                                <div className="col-span-4 pl-4 flex items-center min-w-0">
                                    <Link href={`/teams/${standing.team_key}`} className="flex items-center min-w-0 hover:scale-[1.02] transition-transform origin-left">
                                        <div className="relative w-8 h-8 mr-2 shrink-0 p-1 bg-white/5 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors sm:mr-4">
                                            <Image src={logo || `https://ui-avatars.com/api/?name=T&background=random`} alt={standing.standing_team} width={32} height={32} className="object-contain w-full h-full" />
                                        </div>
                                        <span className={`text-xs sm:text-sm font-bold truncate ${rank <= 4 ? 'text-white' : 'text-text-primary group-hover:text-white'}`}>
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
                                <div className="col-span-2 text-center text-sm sm:text-base font-black text-white group-hover:text-secondary transition-colors">
                                    {standing.standing_PTS}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-wrap gap-6 text-[10px] text-text-muted font-black uppercase tracking-[0.1em]">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span>Champions League</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-red shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span>Relegation Zone</span>
                </div>
            </div>
        </div>
    );
}

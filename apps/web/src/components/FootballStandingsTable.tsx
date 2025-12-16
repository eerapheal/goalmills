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

    const getTeamLogo = (teamKey: string) => {
        const team = teams.find(t => t.team_key === teamKey);
        return team?.team_logo || `https://ui-avatars.com/api/?name=Team+${teamKey}&background=random`;
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="grid grid-cols-12 bg-surfaceHighlight/30 py-3 px-4 border-b border-white/10 text-xs font-bold text-text-muted uppercase tracking-wider">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5 sm:col-span-4 pl-2">Team</div>
                <div className="col-span-1 text-center">P</div>
                <div className="col-span-1 text-center hidden sm:block">W</div>
                <div className="col-span-1 text-center hidden sm:block">D</div>
                <div className="col-span-1 text-center hidden sm:block">L</div>
                <div className="col-span-1 text-center hidden sm:block">GD</div>
                <div className="col-span-2 sm:col-span-1 text-center text-white">Pts</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
                {standings.map((standing, index) => {
                    const rank = parseInt(standing.standing_place);
                    const logo = getTeamLogo(standing.team_key);
                    const gd = parseInt(standing.standing_GD);

                    return (
                        <div
                            key={standing.team_key}
                            className={`
                            grid grid-cols-12 items-center py-3.5 px-4 transition-colors hover:bg-white/5
                            ${rank <= 4 ? 'bg-gradient-to-r from-blue-500/5 to-transparent' : ''}
                            ${rank >= 18 ? 'bg-gradient-to-r from-red-500/5 to-transparent' : ''}
                        `}
                        >
                            {/* Rank */}
                            <div className="col-span-1 flex justify-center">
                                <span className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${rank === 1 ? 'bg-secondary text-surface' :
                                        rank <= 4 ? 'bg-primary/20 text-primary' :
                                            rank >= 18 ? 'bg-accent-red/20 text-accent-red' : 'text-text-secondary'}
                            `}>
                                    {standing.standing_place}
                                </span>
                            </div>

                            {/* Team */}
                            <div className="col-span-5 sm:col-span-4 pl-2 flex items-center min-w-0">
                                <Link href={`/teams/${standing.team_key}`} className="flex items-center min-w-0 hover:opacity-80 transition-opacity">
                                    <div className="relative w-6 h-6 mr-3 shrink-0">
                                        <Image src={logo} alt={standing.standing_team} width={24} height={24} className="object-contain w-full h-full" />
                                    </div>
                                    <span className={`text-sm font-semibold truncate ${rank <= 4 ? 'text-white' : 'text-text-primary'}`}>
                                        {standing.standing_team}
                                    </span>
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="col-span-1 text-center text-sm text-text-secondary">{standing.standing_P}</div>
                            <div className="col-span-1 text-center text-sm text-text-muted hidden sm:block">{standing.standing_W}</div>
                            <div className="col-span-1 text-center text-sm text-text-muted hidden sm:block">{standing.standing_D}</div>
                            <div className="col-span-1 text-center text-sm text-text-muted hidden sm:block">{standing.standing_L}</div>
                            <div className={`col-span-1 text-center text-sm font-medium hidden sm:block
                            ${gd > 0 ? 'text-accent-green' : gd < 0 ? 'text-accent-red' : 'text-text-muted'}
                        `}>
                                {gd > 0 ? '+' : ''}{standing.standing_GD}
                            </div>

                            {/* Points */}
                            <div className="col-span-2 sm:col-span-1 text-center text-sm font-bold text-white">{standing.standing_PTS}</div>
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-white/5 bg-surfaceHighlight/10 flex flex-wrap gap-4 text-[10px] text-text-muted font-medium uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Champions League</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span>Europa League</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent-red" />
                    <span>Relegation</span>
                </div>
            </div>
        </div>
    );
}

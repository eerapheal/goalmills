'use client';

import { Standing } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';

interface StandingsTableProps {
    standings: Standing[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
    return (
        <div className="w-full">
            {/* Header */}
            <div className="grid grid-cols-12 bg-surfaceHighlight/30 py-3 px-4 border-b border-white/10 text-xs font-bold text-text-muted uppercase tracking-wider">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5 sm:col-span-6 pl-2">Team</div>
                <div className="col-span-1 text-center">P</div>
                <div className="col-span-1 text-center hidden sm:block">W</div>
                <div className="col-span-1 text-center hidden sm:block">D</div>
                <div className="col-span-1 text-center hidden sm:block">L</div>
                <div className="col-span-2 sm:col-span-1 text-center">GD</div>
                <div className="col-span-2 sm:col-span-1 text-center text-white">Pts</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
                {standings.map((standing, index) => (
                    <div
                        key={standing.team.id}
                        className={`
                            grid grid-cols-12 items-center py-3.5 px-4 transition-colors hover:bg-white/5
                            ${standing.rank <= 4 ? 'bg-gradient-to-r from-blue-500/5 to-transparent' : ''}
                            ${standing.rank >= 18 ? 'bg-gradient-to-r from-red-500/5 to-transparent' : ''}
                        `}
                    >
                        {/* Rank */}
                        <div className="col-span-1 flex justify-center">
                            <span className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${standing.rank === 1 ? 'bg-secondary text-surface' :
                                    standing.rank <= 4 ? 'bg-primary/20 text-primary' :
                                        standing.rank >= 18 ? 'bg-accent-red/20 text-accent-red' : 'text-text-secondary'}
                            `}>
                                {standing.rank}
                            </span>
                        </div>

                        {/* Team */}
                        <div className="col-span-5 sm:col-span-6 pl-2 flex items-center min-w-0">
                            <Link href={`/teams/${standing.team.id}`} className="flex items-center min-w-0 hover:opacity-80 transition-opacity">
                                <div className="relative w-6 h-6 mr-3 shrink-0">
                                    <Image src={standing.team.logo} alt={standing.team.name} width={24} height={24} className="object-contain w-full h-full" />
                                </div>
                                <span className={`text-sm font-semibold truncate ${standing.rank <= 4 ? 'text-white' : 'text-text-primary'}`}>
                                    {standing.team.name}
                                </span>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="col-span-1 text-center text-sm text-text-secondary">{standing.all.played}</div>
                        <div className="col-span-1 text-center text-sm text-text-muted hidden sm:block">{standing.all.win}</div>
                        <div className="col-span-1 text-center text-sm text-text-muted hidden sm:block">{standing.all.draw}</div>
                        <div className="col-span-1 text-center text-sm text-text-muted hidden sm:block">{standing.all.lose}</div>
                        <div className={`col-span-2 sm:col-span-1 text-center text-sm font-medium
                            ${standing.goalsDiff > 0 ? 'text-accent-green' : standing.goalsDiff < 0 ? 'text-accent-red' : 'text-text-muted'}
                        `}>
                            {standing.goalsDiff > 0 ? '+' : ''}{standing.goalsDiff}
                        </div>
                        <div className="col-span-2 sm:col-span-1 text-center text-sm font-bold text-white">{standing.points}</div>
                    </div>
                ))}
            </div>

            {/* Legend - Cleaned up */}
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

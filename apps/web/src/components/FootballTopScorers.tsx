'use client';

import { FootballTopscorer, FootballTeam } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';

interface FootballTopScorersProps {
    scorers: FootballTopscorer[];
    teams?: FootballTeam[];
}

export function FootballTopScorers({ scorers, teams = [] }: FootballTopScorersProps) {

    const getTeamLogo = (teamKey: string) => {
        const team = teams.find(t => t.team_key === teamKey);
        return team?.team_logo || `https://ui-avatars.com/api/?name=Team+${teamKey}&background=random`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scorers.map((scorer) => {
                const logo = getTeamLogo(scorer.team_key);
                return (
                    <div
                        key={scorer.player_key}
                        className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                    >
                        {/* Rank */}
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <span className="text-surface font-black text-lg">{scorer.player_place}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <Link href={`/players/${scorer.player_key}`} className="block">
                                <h3 className="text-white font-bold truncate hover:text-secondary transition-colors">
                                    {scorer.player_name}
                                </h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                                <Image src={logo} alt={scorer.team_name} width={16} height={16} className="w-4 h-4 object-contain" />
                                <span className="text-xs text-text-secondary truncate">{scorer.team_name}</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1.5 mb-1">
                                <span className="text-lg">⚽</span>
                                <span className="text-xl font-bold text-secondary">{scorer.goals}</span>
                            </div>
                            {scorer.assists && (
                                <div className="text-xs text-text-muted">
                                    {scorer.assists} Assists
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

'use client';

import { FootballTopscorer, FootballTeam } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';

interface FootballTopScorersProps {
  scorers: FootballTopscorer[];
  teams?: FootballTeam[];
}

export function FootballTopScorers({ scorers, teams = [] }: FootballTopScorersProps) {
  const getTeamLogo = (scorer: FootballTopscorer) => {
    if (scorer.team_logo && scorer.team_logo !== '') return scorer.team_logo;
    const teamKey = scorer.team_key;
    const team = teams.find((t) => String(t.team_key) === String(teamKey));
    const logo = team?.team_logo;
    return logo && logo !== ''
      ? logo
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(scorer.team_name)}&background=random`;
  };

  const getPlayerAvatar = (scorer: FootballTopscorer) => {
    if (scorer.player_image && scorer.player_image !== '') return scorer.player_image;

    if (teams.length > 0) {
      const team = teams.find((t) => String(t.team_key) === String(scorer.team_key));
      if (team?.players) {
        let player = team.players.find((p) => String(p.player_key) === String(scorer.player_key));

        if (!player) {
          player = team.players.find(
            (p) => p.player_name.toLowerCase() === scorer.player_name.toLowerCase()
          );
        }

        if (player?.player_image && player.player_image !== '') {
          return player.player_image;
        }
      }
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(scorer.player_name)}&background=random&color=fff`;
  };

  const sortedScorers = [...scorers].sort((a, b) => {
    const goalsA = parseInt(a.goals) || 0;
    const goalsB = parseInt(b.goals) || 0;
    if (goalsB !== goalsA) return goalsB - goalsA;

    const assistsA = parseInt(a.assists || '0') || 0;
    const assistsB = parseInt(b.assists || '0') || 0;
    if (assistsB !== assistsA) return assistsB - assistsA;

    return parseInt(a.player_place) - parseInt(b.player_place);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedScorers.map((scorer, index) => {
        const teamLogo = getTeamLogo(scorer);
        const playerAvatar = getPlayerAvatar(scorer);
        const rank = index + 1;
        const isPodium = rank <= 3;

        return (
          <div
            key={`${scorer.player_key}-${scorer.team_key}-${index}`}
            className={`rounded-2xl border p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${
              isPodium
                ? 'bg-[#0B1E3E]/90 border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-500/10'
                : 'bg-[#0A1424]/90 border-blue-500/15 hover:border-blue-400/40 hover:bg-[#0E1D34]'
            }`}
          >
            {/* Rank & Player Image */}
            <div className="relative shrink-0">
              <div
                className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all p-0.5 bg-slate-950 ${
                  isPodium
                    ? 'border-amber-400/80 shadow-md shadow-amber-500/20'
                    : 'border-blue-500/30 group-hover:border-blue-400'
                }`}
              >
                <Image
                  src={playerAvatar}
                  alt={scorer.player_name}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full rounded-xl"
                />
              </div>
              <div
                className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0A1424] shadow-md ${
                  rank === 1
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs'
                    : rank === 2
                      ? 'bg-slate-300 text-slate-950 font-black text-xs'
                      : rank === 3
                        ? 'bg-amber-700 text-amber-100 font-black text-xs'
                        : 'bg-slate-800 text-slate-300 font-bold text-[10px]'
                }`}
              >
                <span>{scorer.player_place || rank}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/players/${scorer.player_key}`} className="block">
                <h3 className="text-white font-bold text-sm truncate group-hover:text-amber-300 transition-colors">
                  {scorer.player_name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-4 rounded bg-slate-900 border border-white/10 p-0.5 flex items-center justify-center">
                  <Image
                    src={teamLogo}
                    alt={scorer.team_name}
                    width={14}
                    height={14}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs text-slate-400 truncate">{scorer.team_name}</span>
              </div>
            </div>

            {/* Stats Badge */}
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1.5 mb-0.5">
                <span className="text-xs">⚽</span>
                <span className="text-xl font-black text-amber-400 tracking-tight">
                  {scorer.goals}
                </span>
              </div>
              {scorer.assists ? (
                <div className="text-[11px] font-semibold text-blue-300 font-mono">
                  {scorer.assists} Assists
                </div>
              ) : (
                <div className="text-[10px] text-slate-500">Golden Boot</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

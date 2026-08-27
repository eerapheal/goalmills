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

    // Search in teams data if available
    if (teams.length > 0) {
      // Find the team of the scorer first
      const team = teams.find((t) => String(t.team_key) === String(scorer.team_key));
      if (team?.players) {
        let player = team.players.find((p) => String(p.player_key) === String(scorer.player_key));

        // Fallback to name search if ID match fails
        if (!player) {
          player = team.players.find(
            (p) => p.player_name.toLowerCase() === scorer.player_name.toLowerCase()
          );
        }

        if (player?.player_image && player.player_image !== '') {
          return player.player_image;
        }
      } else {
        // If team players aren't there, check all teams as a last resort
        for (const t of teams) {
          if (t.players) {
            let player = t.players.find((p) => String(p.player_key) === String(scorer.player_key));

            if (!player) {
              player = t.players.find(
                (p) => p.player_name.toLowerCase() === scorer.player_name.toLowerCase()
              );
            }

            if (player?.player_image && player.player_image !== '') {
              return player.player_image;
            }
          }
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

        return (
          <div
            key={`${scorer.player_key}-${scorer.team_key}-${index}`}
            className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
          >
            {/* Rank & Player Image */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-secondary/30 group-hover:border-secondary transition-colors bg-white/5">
                <Image
                  src={playerAvatar}
                  alt={scorer.player_name}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 border-[#0a0a0a] shadow-lg">
                <span className="text-surface font-black text-[10px]">{scorer.player_place}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/players/${scorer.player_key}`} className="block">
                <h3 className="text-white font-bold truncate group-hover:text-secondary transition-colors">
                  {scorer.player_name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Image
                  src={teamLogo}
                  alt={scorer.team_name}
                  width={16}
                  height={16}
                  className="object-contain"
                />
                <span className="text-xs text-text-secondary truncate">{scorer.team_name}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1.5 mb-1">
                <span className="text-lg">⚽</span>
                <span className="text-xl font-bold text-secondary">{scorer.goals}</span>
              </div>
              {scorer.assists && (
                <div className="text-xs text-text-muted">{scorer.assists} Assists</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

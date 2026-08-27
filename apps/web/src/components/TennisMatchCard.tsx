'use client';

import { TennisEvent } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TennisMatchCardProps {
  match: TennisEvent;
  onPress?: () => void;
  odds?: any;
}

export function TennisMatchCard({ match, onPress, odds }: TennisMatchCardProps) {
  const router = useRouter();
  const isLive = match.event_live === '1';

  // Format date and time
  const eventDate = new Date(`${match.event_date}T${match.event_time}`);
  const timeString = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Parse scores for easier rendering
  const renderScores = (playerIndex: 0 | 1) => {
    if (!match.scores) return null;

    return (
      <div className="flex items-center gap-1.5">
        {match.scores.map((set, i) => (
          <span key={i} className="text-sm font-bold w-5 text-center text-text-muted">
            {playerIndex === 0 ? set.score_first : set.score_second}
          </span>
        ))}
        {isLive && (
          <span className="text-sm font-bold w-8 text-right text-yellow-500">
            {playerIndex === 0
              ? match.event_game_result?.split(' - ')[0]
              : match.event_game_result?.split(' - ')[1]}
          </span>
        )}
      </div>
    );
  };

  const handleCardClick = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/tennis/matches/${match.event_key}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
                group
                glass-card rounded-lg p-3 mb-2 cursor-pointer relative overflow-hidden transition-all
                ${isLive ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/5 hover:bg-white/5'}
            `}
    >
      {/* Live Indicator Background Effect */}
      {isLive && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-[40px] rounded-full -mr-12 -mt-12 pointer-events-none" />
      )}

      {/* Header: League & Status */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5 relative z-10">
        <div onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/tennis/leagues/${match.league_key}`}
            className="text-[10px] font-bold text-text-secondary uppercase tracking-wider hover:text-white transition-colors"
          >
            {match.league_name} {match.league_round && `• ${match.league_round}`}
          </Link>
        </div>
        {isLive ? (
          <div className="flex items-center gap-1.5 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
            </span>
            <span className="text-[9px] font-bold text-yellow-500 tracking-widest">LIVE</span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            {match.event_status}
          </span>
        )}
      </div>

      {/* Players & Scores */}
      <div className="flex flex-col gap-3 relative z-10">
        {/* Player 1 */}
        <div className="flex items-center justify-between">
          <Link
            href={`/tennis/players/${match.first_player_key}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-3 group/player"
          >
            <div className="relative w-6 h-6 rounded-full bg-white/5 overflow-hidden">
              <Image
                src={
                  match.event_first_player_logo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(match.event_first_player)}&background=random&color=fff`
                }
                alt={match.event_first_player}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-primary group-hover/player:text-yellow-500 transition-colors">
                {match.event_first_player}
              </span>
              {isLive && match.event_serve === 'First Player' && (
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              )}
            </div>
          </Link>
          {renderScores(0)}
        </div>

        {/* Player 2 */}
        <div className="flex items-center justify-between">
          <Link
            href={`/tennis/players/${match.second_player_key}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-3 group/player"
          >
            <div className="relative w-6 h-6 rounded-full bg-white/5 overflow-hidden">
              <Image
                src={
                  match.event_second_player_logo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(match.event_second_player)}&background=random&color=fff`
                }
                alt={match.event_second_player}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-primary group-hover/player:text-yellow-500 transition-colors">
                {match.event_second_player}
              </span>
              {isLive && match.event_serve === 'Second Player' && (
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              )}
            </div>
          </Link>
          {renderScores(1)}
        </div>
      </div>

      {/* Footer / Odds */}
      <div className="mt-3 pt-2 text-center border-t border-white/5">
        {/* Odds Display */}
        {odds && odds['Match Winner'] && (
          <div className="flex justify-center gap-4 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded">
              <span className="text-[10px] text-text-muted font-bold">1</span>
              <span className="text-xs font-bold text-yellow-500">
                {odds['Match Winner']['Home']?.['Bet365'] || '-'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded">
              <span className="text-[10px] text-text-muted font-bold">2</span>
              <span className="text-xs font-bold text-yellow-500">
                {odds['Match Winner']['Away']?.['Bet365'] || '-'}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-[10px] text-text-muted">
          <span>
            {match.league_surface} • {match.country_name}
          </span>
          <span>{match.event_time}</span>
        </div>
      </div>
    </div>
  );
}

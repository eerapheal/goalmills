'use client';

import { Fixture } from '@goalmills/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { footballRoutes, buildMatchSlug } from '@/lib/slugUtils';

interface FixtureCardProps {
  fixture: Fixture;
  onPress?: () => void;
}

export function FixtureCard({ fixture, onPress }: FixtureCardProps) {
  const router = useRouter();
  const { fixture: fixtureData, league, teams, goals, score } = fixture;
  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixtureData.status.short);
  const isFinished = fixtureData.status.short === 'FT';
  const isUpcoming = fixtureData.status.short === 'NS';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const matchSlug = buildMatchSlug({
    event_home_team: teams.home.name,
    event_away_team: teams.away.name,
    event_date: fixtureData.date?.split('T')[0],
    event_key: fixtureData.id,
  });

  const handleCardClick = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(footballRoutes.match(matchSlug));
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
                group
                glass-card rounded-lg p-3 mb-2 cursor-pointer relative overflow-hidden
                ${isLive ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/5'}
            `}
    >
      {/* Live Indicator Background Effect */}
      {isLive && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-[40px] rounded-full -mr-12 -mt-12 pointer-events-none" />
      )}

      {/* League Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5 relative z-10">
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
          <Link
            href={`/leagues/${league.id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src={league.logo}
              alt={league.name}
              width={16}
              height={16}
              className="w-4 h-4 object-contain"
            />
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              {league.name}
            </span>
          </Link>
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
            </span>
            <span className="text-[9px] font-bold text-yellow-500 tracking-widest">LIVE</span>
          </div>
        )}
      </div>

      {/* Match Info */}
      <div className="flex items-center justify-between relative z-10">
        {/* Home Team */}
        <Link
          href={footballRoutes.teamFromName(teams.home.name)}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex flex-row items-center justify-start gap-2 group-hover:opacity-80 transition-opacity"
        >
          <div className="relative w-7 h-7">
            <Image
              src={teams.home.logo}
              alt={teams.home.name}
              width={28}
              height={28}
              className="object-contain drop-shadow-lg w-full h-full"
            />
          </div>
          <p
            className={`text-sm font-bold truncate leading-tight ${teams.home.winner ? 'text-accent-green' : 'text-text-primary'}`}
          >
            {teams.home.name}
          </p>
        </Link>

        {/* Score/Time Center */}
        <Link
          href={footballRoutes.match(matchSlug)}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center justify-center min-w-[70px] px-1"
        >
          {isUpcoming ? (
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-text-primary tracking-tight">
                {formatTime(fixtureData.date)}
              </span>
              <span className="text-[9px] font-medium text-text-muted">
                {formatDate(fixtureData.date)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`text-xl font-bold tracking-tight ${teams.home.winner ? 'text-text-primary' : 'text-text-secondary/80'}`}
                >
                  {goals.home ?? 0}
                </span>
                <span className="text-sm font-light text-text-muted/50">-</span>
                <span
                  className={`text-xl font-bold tracking-tight ${teams.away.winner ? 'text-text-primary' : 'text-text-secondary/80'}`}
                >
                  {goals.away ?? 0}
                </span>
              </div>

              <div
                className={`text-[9px] font-bold tracking-wider uppercase
                                ${isLive ? 'text-accent-red' : 'text-accent-green'}
                            `}
              >
                {isLive ? `${fixtureData.status.elapsed}'` : fixtureData.status.short}
              </div>
            </div>
          )}
        </Link>

        {/* Away Team */}
        <Link
          href={footballRoutes.teamFromName(teams.away.name)}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex flex-row items-center justify-end gap-2 group-hover:opacity-80 transition-opacity"
        >
          <p
            className={`text-sm font-bold text-right truncate leading-tight ${teams.away.winner ? 'text-accent-green' : 'text-text-primary'}`}
          >
            {teams.away.name}
          </p>
          <div className="relative w-7 h-7">
            <Image
              src={teams.away.logo}
              alt={teams.away.name}
              width={28}
              height={28}
              className="object-contain drop-shadow-lg w-full h-full"
            />
          </div>
        </Link>
      </div>
    </div>
  );
}

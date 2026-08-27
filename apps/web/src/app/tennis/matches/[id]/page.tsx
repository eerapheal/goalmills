'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tennisApi } from '@/services/tennisApi';
import { TennisEvent } from '@goalmills/types';
import { TennisMatchCard } from '@/components/TennisMatchCard';
import Image from 'next/image';
import Link from 'next/link';

export default function TennisMatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<TennisEvent | null>(null);
  const [odds, setOdds] = useState<any>(null);
  const [h2hData, setH2HData] = useState<{
    H2H: TennisEvent[];
    firstTeamResults: TennisEvent[];
    secondTeamResults: TennisEvent[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      try {
        const matchId = Number(params.id);

        // Fetch match details
        // Create a date range to search for the match
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 15); // 15 days before
        const to = new Date(today);
        to.setDate(today.getDate() + 15); // 15 days after

        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const fixturesRes = await tennisApi.getFixtures({
          matchId,
          from: formatDate(from),
          to: formatDate(to),
        });
        const foundMatch = fixturesRes.result[0];
        setMatch(foundMatch || null);

        if (foundMatch) {
          // Fetch Odds
          if (foundMatch.event_live === '1') {
            const liveOddsRes = await tennisApi.getLiveOdds({ matchId });
            setOdds(liveOddsRes.result[matchId]);
          } else {
            const oddsRes = await tennisApi.getOdds({ matchId });
            setOdds(oddsRes.result[matchId]);
          }

          // Fetch H2H
          const h2hRes = await tennisApi.getH2H({
            firstPlayerId: Number(foundMatch.first_player_key),
            secondPlayerId: Number(foundMatch.second_player_key),
          });
          setH2HData(h2hRes.result);
        }
      } catch (error) {
        console.error('Error loading match details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex flex-col justify-center items-center text-white">
        <h2 className="text-2xl font-bold mb-4">Match Not Found</h2>
        <button onClick={() => router.back()} className="text-yellow-500 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const renderOdds = () => {
    if (!odds)
      return (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-2">Odds not available yet</h3>
        </div>
      );

    // Pre-match odds structure
    if (odds['Match Winner']) {
      return (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">🎲 Match Odds</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-sm text-text-muted mb-2">{match.event_first_player}</p>
              <p className="text-2xl font-bold text-yellow-500">
                {odds['Match Winner']['Home']?.['Bet365'] || '-'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-sm text-text-muted mb-2">{match.event_second_player}</p>
              <p className="text-2xl font-bold text-yellow-500">
                {odds['Match Winner']['Away']?.['Bet365'] || '-'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Live odds structure
    if (odds.live_odds) {
      const matchWinnerOdds = odds.live_odds.filter((o: any) => o.odd_name === 'Match Winner');
      return (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Live Odds
          </h3>
          {matchWinnerOdds.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {matchWinnerOdds.map((odd: any, index: number) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-sm text-text-muted mb-2">
                    {odd.type === 'Home' ? match.event_first_player : match.event_second_player}
                  </p>
                  <p className="text-2xl font-bold text-yellow-500">{odd.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">Markets suspended</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] pt-[90px] pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-bold text-text-muted uppercase tracking-wider">
            Match Details
          </span>
        </div>

        {/* Match Header Card */}
        <div className="glass-card rounded-2xl p-6 mb-6 border border-white/5">
          <div className="text-center mb-4">
            <Link
              href={`/tennis/leagues/${match.league_key}`}
              className="text-sm font-bold text-text-secondary uppercase tracking-wider hover:text-yellow-500 transition-colors"
            >
              {match.league_name} - {match.league_round}
            </Link>
            <p
              className={`text-xs font-bold mt-2 uppercase tracking-wider ${match.event_live === '1' ? 'text-red-500' : 'text-blue-400'}`}
            >
              {match.event_live === '1' ? 'LIVE' : match.event_status}
            </p>
          </div>

          <div className="flex items-center justify-between gap-8">
            {/* Player 1 */}
            <Link
              href={`/tennis/players/${match.first_player_key}`}
              className="flex-1 flex flex-col items-center group"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-yellow-500/50 transition-colors">
                <Image
                  src={match.event_first_player_logo || ''}
                  alt={match.event_first_player}
                  fill
                  sizes="80px"
                  priority
                  className="object-cover"
                />
              </div>
              <p className="font-bold text-white text-center group-hover:text-yellow-500 transition-colors">
                {match.event_first_player}
              </p>
            </Link>

            {/* Score */}
            <div className="text-center">
              <p className="text-4xl font-black text-white mb-2">{match.event_final_result}</p>
              {match.event_live === '1' && (
                <p className="text-yellow-500 font-bold">{match.event_game_result}</p>
              )}
            </div>

            {/* Player 2 */}
            <Link
              href={`/tennis/players/${match.second_player_key}`}
              className="flex-1 flex flex-col items-center group"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-yellow-500/50 transition-colors">
                <Image
                  src={match.event_second_player_logo || ''}
                  alt={match.event_second_player}
                  fill
                  sizes="80px"
                  priority
                  className="object-cover"
                />
              </div>
              <p className="font-bold text-white text-center group-hover:text-yellow-500 transition-colors">
                {match.event_second_player}
              </p>
            </Link>
          </div>
        </div>

        {/* Odds */}
        {renderOdds()}

        {/* H2H */}
        {h2hData && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 pl-2 border-l-4 border-yellow-500">
              Head to Head
            </h2>
            {(h2hData.H2H?.length ?? 0) > 0 ? (
              h2hData.H2H?.map((h) => <TennisMatchCard key={h.event_key} match={h} />)
            ) : (
              <p className="text-text-muted italic text-center py-4">No previous H2H matches.</p>
            )}
          </div>
        )}

        {/* Recent Form */}
        {h2hData && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 pl-2 border-l-4 border-yellow-500">
              {match.event_first_player} Recent Form
            </h2>
            {h2hData.firstTeamResults?.map((h) => (
              <TennisMatchCard key={h.event_key} match={h} />
            ))}

            <h2 className="text-2xl font-bold text-white mb-4 mt-8 pl-2 border-l-4 border-yellow-500">
              {match.event_second_player} Recent Form
            </h2>
            {h2hData.secondTeamResults?.map((h) => (
              <TennisMatchCard key={h.event_key} match={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

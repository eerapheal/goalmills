'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tennisApi } from '@/services/tennisApi';
import { TennisLeague, TennisEvent, TennisStanding } from '@goalmills/types';
import { TennisMatchCard } from '@/components/TennisMatchCard';
import Link from 'next/link';

export default function TennisLeagueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<TennisLeague | null>(null);
  const [fixtures, setFixtures] = useState<TennisEvent[]>([]);
  const [standings, setStandings] = useState<TennisStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      try {
        const leagueId = Number(params.id);

        // Get League Info
        const leaguesRes = await tennisApi.getLeagues({});
        const foundLeague = leaguesRes.result.find((l) => Number(l.league_key) === leagueId);
        setLeague(foundLeague || null);

        // Get Fixtures
        const matchesRes = await tennisApi.getFixtures({
          from: new Date().toISOString().split('T')[0],
          to: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          leagueId,
        });
        setFixtures(matchesRes.result);

        // Get Standings (If ATP/WTA)
        if (
          foundLeague &&
          (foundLeague.league_name.includes('ATP') || foundLeague.league_name.includes('WTA'))
        ) {
          const type = foundLeague.league_name.includes('WTA') ? 'WTA' : 'ATP';
          const standRes = await tennisApi.getStandings({ league: type });
          setStandings(standRes.result);
        }
      } catch (error) {
        console.error('Error loading league details:', error);
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

  if (!league) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex flex-col justify-center items-center text-white">
        <h2 className="text-2xl font-bold mb-4">League Not Found</h2>
        <button onClick={() => router.back()} className="text-yellow-500 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

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
            Tournament Details
          </span>
        </div>

        {/* League Header Card */}
        <div className="glass-card rounded-2xl p-8 mb-8 text-center border border-white/5">
          <h1 className="text-4xl font-extrabold text-white mb-2">{league.league_name}</h1>
          <p className="text-xl text-yellow-500 mb-1">{league.country_name}</p>
          {league.league_surface && (
            <p className="text-sm text-text-secondary uppercase tracking-wider">
              {league.league_surface}
            </p>
          )}
        </div>

        {/* Standings Section */}
        {standings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 pl-2 border-l-4 border-yellow-500">
              🏆 Standings
            </h2>
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-xs text-text-muted uppercase">
                    <th className="p-4 w-16">#</th>
                    <th className="p-4">Player</th>
                    <th className="p-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((player) => (
                    <tr
                      key={player.player_key}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 font-bold text-yellow-500">{player.place}</td>
                      <td className="p-4">
                        <Link
                          href={`/tennis/players/${player.player_key}`}
                          className="group flex flex-col"
                        >
                          <span className="font-bold text-white group-hover:text-yellow-500 transition-colors">
                            {player.player}
                          </span>
                          <span className="text-xs text-text-secondary">{player.country}</span>
                        </Link>
                      </td>
                      <td className="p-4 text-right font-bold text-white">{player.points} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fixtures Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 pl-2 border-l-4 border-yellow-500">
            📅 Upcoming Matches
          </h2>
          {fixtures.length > 0 ? (
            fixtures.map((match) => <TennisMatchCard key={match.event_key} match={match} />)
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-text-muted italic">No upcoming matches available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BasketballEvent, BasketballLeague, BasketballStanding } from '@goalmills/types';
import { basketballApi } from '../../../../services/basketballApi';
import { BasketballMatchCard } from '../../../../components/BasketballMatchCard';
import Link from 'next/link';

export default function BasketballLeaguePage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<BasketballLeague | null>(null);
  const [matches, setMatches] = useState<BasketballEvent[]>([]);
  const [standings, setStandings] = useState<BasketballStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'standings'>('matches');

  useEffect(() => {
    const loadLeagueData = async () => {
      try {
        const leagueId = parseInt(params.id as string);
        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 30);
        const toDate = new Date(today);
        toDate.setDate(today.getDate() + 30);
        const from = fromDate.toISOString().split('T')[0];
        const to = toDate.toISOString().split('T')[0];

        const [leaguesData, matchesData, standingsData] = await Promise.all([
          basketballApi.getLeagues({}),
          basketballApi.getFixtures({ leagueId, from, to }),
          basketballApi.getStandings({ leagueId }),
        ]);

        const foundLeague = (leaguesData.result || leaguesData).find(
          (l: any) => Number(l.league_key || l.id) === leagueId
        );
        setLeague(foundLeague || null);
        setMatches(matchesData.result || matchesData || []);
        setStandings(standingsData.result?.total || standingsData || []);
      } catch (error) {
        console.error('Error loading league data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeagueData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex items-center justify-center">
        <p className="text-white">League not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] pt-[90px]">
      <div className="max-w-4xl mx-auto p-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* League Header */}
        <div className="glass-card rounded-2xl p-6 mb-4">
          <h1 className="text-3xl font-bold text-white mb-2">{league.league_name}</h1>
          <p className="text-text-secondary">{league.country_name}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('matches')}
            className={`
                            px-4 py-2 rounded-full border transition-all
                            ${
                              activeTab === 'matches'
                                ? 'bg-yellow-500 text-white border-yellow-500'
                                : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'
                            }
                        `}
          >
            Matches
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`
                            px-4 py-2 rounded-full border transition-all
                            ${
                              activeTab === 'standings'
                                ? 'bg-yellow-500 text-white border-yellow-500'
                                : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'
                            }
                        `}
          >
            Standings
          </button>
        </div>

        {/* Content */}
        {activeTab === 'matches' && (
          <div>
            {matches.length > 0 ? (
              matches.map((match) => (
                <BasketballMatchCard
                  key={match.event_key || (match as any).id}
                  match={match as any}
                />
              ))
            ) : (
              <div className="glass-card rounded-2xl p-8 text-center">
                <p className="text-text-muted">No matches found for this league.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            {standings.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-xs text-text-muted uppercase">
                    <th className="p-4 w-16">#</th>
                    <th className="p-4">Team</th>
                    <th className="p-4 text-center">P</th>
                    <th className="p-4 text-center">W</th>
                    <th className="p-4 text-center">L</th>
                    <th className="p-4 text-center">PCT</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team) => (
                    <tr
                      key={team.team_key}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 font-bold text-text-primary">{team.standing_place}</td>
                      <td className="p-4">
                        <Link
                          href={`/basketball/teams/${team.team_key}`}
                          className="font-bold text-white hover:text-yellow-500 transition-colors"
                        >
                          {team.standing_team}
                        </Link>
                      </td>
                      <td className="p-4 text-center text-text-secondary">{team.standing_P}</td>
                      <td className="p-4 text-center font-bold text-green-500">
                        {team.standing_W}
                      </td>
                      <td className="p-4 text-center font-bold text-red-500">{team.standing_L}</td>
                      <td className="p-4 text-center font-bold text-yellow-500">
                        {team.standing_PCT}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-text-muted">No standings available for this league.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

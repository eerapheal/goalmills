'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BasketballEvent, BasketballTeam } from '@goalmills/types';
import { basketballApi } from '../../../../services/basketballApi';
import { BasketballMatchCard } from '../../../../components/BasketballMatchCard';
import Image from 'next/image';
import Link from 'next/link';

export default function BasketballTeamPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<BasketballTeam | null>(null);
  const [matches, setMatches] = useState<BasketballEvent[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'squad'>('matches');

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        const teamId = parseInt(params.id as string);
        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 30);
        const toDate = new Date(today);
        toDate.setDate(today.getDate() + 30);
        const from = fromDate.toISOString().split('T')[0];
        const to = toDate.toISOString().split('T')[0];

        const [teamsData, matchesData, playersData] = await Promise.all([
          basketballApi.getTeams({ id: teamId } as any),
          basketballApi.getFixtures({ teamId, from, to }),
          basketballApi.getPlayers({ team: teamId } as any),
        ]);

        const teamList = teamsData.result || teamsData || [];
        if (teamList.length > 0) {
          setTeam(teamList[0]);
        }
        setMatches(matchesData.result || matchesData || []);
        setPlayers(playersData.result || playersData || []);
      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[90px] flex items-center justify-center">
        <p className="text-white">Team not found</p>
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

        {/* Team Header */}
        <div className="glass-card rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full bg-white/5 overflow-hidden">
              <Image
                src={team.team_logo || 'https://via.placeholder.com/80'}
                alt={team.team_name}
                width={80}
                height={80}
                priority
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{team.team_name}</h1>
            </div>
          </div>
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
            onClick={() => setActiveTab('squad')}
            className={`
                            px-4 py-2 rounded-full border transition-all
                            ${
                              activeTab === 'squad'
                                ? 'bg-yellow-500 text-white border-yellow-500'
                                : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'
                            }
                        `}
          >
            Squad
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
                <p className="text-text-muted">No matches found for this team.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'squad' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.length > 0 ? (
              players.map((player) => (
                <Link
                  key={player.player_key}
                  href={`/basketball/players/${player.player_key}`}
                  className="glass-card rounded-xl p-4 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full bg-white/5 overflow-hidden">
                      <Image
                        src={player.player_image || 'https://via.placeholder.com/48'}
                        alt={player.player_name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white group-hover:text-yellow-500 transition-colors">
                        {player.player_name}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        #{player.player_number} • {player.player_type}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass-card rounded-2xl p-8 text-center col-span-2">
                <p className="text-text-muted">No squad information available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

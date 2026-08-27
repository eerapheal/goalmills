'use client';

import { useState, useEffect } from 'react';
import { TennisEvent, TennisLeague, TennisStanding } from '@goalmills/types';
import { tennisApi } from '../services/tennisApi';
import { TennisMatchCard } from './TennisMatchCard';
import { GoalmillsLoader } from './GoalmillsLoader';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TennisTab = 'live' | 'upcoming' | 'results' | 'leagues' | 'standings';

export function TennisScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TennisTab>('live');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [liveMatches, setLiveMatches] = useState<TennisEvent[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<TennisEvent[]>([]);
  const [recentMatches, setRecentMatches] = useState<TennisEvent[]>([]);
  const [leagues, setLeagues] = useState<TennisLeague[]>([]);
  const [standings, setStandings] = useState<TennisStanding[]>([]);
  const [odds, setOdds] = useState<any>({});
  const [liveOdds, setLiveOdds] = useState<any>({});

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const [live, fixtures, results, leaguesData, standingsData, oddsData, liveOddsData] =
        await Promise.all([
          tennisApi.getLivescore({}),
          tennisApi.getFixtures({
            from: tomorrow,
            to: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          }),
          tennisApi.getFixtures({ from: yesterday, to: yesterday }),
          tennisApi.getLeagues({}),
          tennisApi.getStandings({ league: 'ATP' }),
          tennisApi.getOdds({}),
          tennisApi.getLiveOdds({}),
        ]);

      setLiveMatches(Array.isArray(live.result) ? live.result : []);
      setUpcomingMatches(Array.isArray(fixtures.result) ? fixtures.result : []);
      setRecentMatches(Array.isArray(results.result) ? results.result : []);
      setLeagues(Array.isArray(leaguesData.result) ? leaguesData.result : []);
      const rawStandings = Array.isArray(standingsData.result) ? standingsData.result : [];
      const uniqueStandings = rawStandings.reduce((acc: any[], curr: any) => {
        if (!acc.some((item) => item.player_key === curr.player_key)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      setStandings(uniqueStandings);

      // Odds usually returned as a map, but we'll be defensive
      setOdds(oddsData.result && typeof oddsData.result === 'object' ? oddsData.result : {});

      // Transform live odds from array to map for easier access
      const liveOddsMap: any = {};
      if (Array.isArray(liveOddsData.result)) {
        liveOddsData.result.forEach((item: any) => {
          if (item.event_key) {
            liveOddsMap[String(item.event_key)] = item;
          }
        });
      } else if (liveOddsData.result && typeof liveOddsData.result === 'object') {
        // In case it's already a map
        Object.assign(liveOddsMap, liveOddsData.result);
      }
      setLiveOdds(liveOddsMap);
    } catch (error) {
      console.error('Error loading tennis data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const tabs: { id: TennisTab; label: string; count?: number }[] = [
    { id: 'live', label: 'Live', count: liveMatches.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingMatches.length },
    { id: 'results', label: 'Results', count: recentMatches.length },
    { id: 'leagues', label: 'Leagues' },
    { id: 'standings', label: 'Rankings' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-16">
          <GoalmillsLoader
            size="md"
            label="Tennis Grand Slam & ATP"
            sublabel="Syncing court live scores & tournament brackets..."
          />
        </div>
      );
    }

    switch (activeTab) {
      case 'live':
        return (
          <div className="p-4 space-y-2 animate-fade-in">
            {liveMatches.length > 0 ? (
              <>
                <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Live Matches
                </h2>
                {liveMatches.map((match) => (
                  <TennisMatchCard
                    key={match.event_key}
                    match={match}
                    odds={
                      liveOdds[String(match.event_key)]?.live_odds
                        ? {
                            'Match Winner': {
                              Home: {
                                Bet365: liveOdds[String(match.event_key)].live_odds.find(
                                  (o: any) => o.type === 'Home' && o.odd_name === 'Match Winner'
                                )?.value,
                              },
                              Away: {
                                Bet365: liveOdds[String(match.event_key)].live_odds.find(
                                  (o: any) => o.type === 'Away' && o.odd_name === 'Match Winner'
                                )?.value,
                              },
                            },
                          }
                        : undefined
                    }
                  />
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 glass-card rounded-2xl mx-auto max-w-lg mt-8 text-center">
                <span className="text-6xl mb-6 opacity-80">🎾</span>
                <p className="text-xl font-bold text-text-primary mb-2">
                  No live matches right now
                </p>
                <p className="text-text-muted">Check out Upcoming or Results to stay updated!</p>
              </div>
            )}
          </div>
        );

      case 'upcoming':
        return (
          <div className="p-4 animate-fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-6">📅 Upcoming Matches</h2>
            {upcomingMatches.map((match) => (
              <TennisMatchCard
                key={match.event_key}
                match={match}
                odds={odds[String(match.event_key)]}
              />
            ))}
            {upcomingMatches.length === 0 && (
              <p className="text-text-muted text-center py-8">No upcoming matches found.</p>
            )}
          </div>
        );

      case 'results':
        return (
          <div className="p-4 animate-fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-6">✅ Recent Results</h2>
            {recentMatches.map((match) => (
              <TennisMatchCard key={match.event_key} match={match} />
            ))}
            {recentMatches.length === 0 && (
              <p className="text-text-muted text-center py-8">No recent results found.</p>
            )}
          </div>
        );

      case 'leagues':
        return (
          <div className="p-4 animate-fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-6">🏆 Tournaments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues.map((league) => (
                <Link
                  href={`/tennis/leagues/${league.league_key}`}
                  key={league.league_key}
                  className="glass-card rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer block group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white mb-1 group-hover:text-yellow-500 transition-colors">
                        {league.league_name}
                      </h3>
                      <p className="text-xs text-text-secondary">{league.country_name}</p>
                    </div>
                    {league.league_surface && (
                      <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded uppercase">
                        {league.league_surface}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );

      case 'standings':
        return (
          <div className="p-4 animate-fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-6">🌍 ATP Rankings</h2>
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
                      <td className="p-4 font-bold text-text-primary">{player.place}</td>
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
                      <td className="p-4 text-right font-bold text-yellow-500">{player.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1">
      {/* Tabs */}
      <div className="sticky top-[86px] z-30 bg-[#0a0e27]/95 backdrop-blur-sm border-b border-white/5 pb-2 pt-2 px-4 shadow-lg">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                                flex items-center gap-2 px-4 py-2 rounded-full border 
                                transition-all duration-300 whitespace-nowrap text-sm font-bold
                                ${
                                  activeTab === tab.id
                                    ? 'bg-yellow-500 text-white border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                    : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                                }
                            `}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`
                                    text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                                    ${
                                      activeTab === tab.id
                                        ? 'bg-white/20 text-white'
                                        : 'bg-black/20 text-text-secondary'
                                    }
                                `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto pb-20 mt-4">
        {refreshing && (
          <div className="flex justify-center py-6 animate-fade-in">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {renderContent()}
      </div>

      {/* Floating Action Button for Refresh */}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="fixed bottom-8 right-8 bg-yellow-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)]
                         hover:bg-yellow-600 hover:scale-110 active:scale-90 transition-all duration-300 
                         disabled:opacity-50 disabled:scale-100 z-50 group"
        aria-label="Refresh Data"
      >
        <svg
          className={`w-6 h-6 group-hover:rotate-180 transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
}

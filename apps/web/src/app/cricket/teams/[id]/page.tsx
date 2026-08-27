'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedCricketApi } from '../../../../services/advancedCricketApi';
import { CricketTeam, CricketEvent, CricketPlayer } from '@goalmills/types';
import { CricketMatchCard } from '../../../../components/CricketMatchCard';
import Image from 'next/image';
import Link from 'next/link';

type TabType = 'squad' | 'schedule' | 'results';

export default function CricketTeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<CricketTeam | null>(null);
  const [schedules, setSchedules] = useState<CricketEvent[]>([]);
  const [results, setResults] = useState<CricketEvent[]>([]);
  const [players, setPlayers] = useState<CricketPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('squad');

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      const teamId = String(params.id);
      try {
        setLoading(true);
        // Fetch team metadata across all categories, schedule, results, and squad in parallel
        const [intTeams, leagueTeams, womenTeams, schedRes, resultsRes, playersRes] =
          await Promise.all([
            advancedCricketApi.getTeamsList('international').catch(() => []),
            advancedCricketApi.getTeamsList('league').catch(() => []),
            advancedCricketApi.getTeamsList('women').catch(() => []),
            advancedCricketApi.getTeamSchedules(teamId).catch(() => []),
            advancedCricketApi.getTeamResults(teamId).catch(() => []),
            advancedCricketApi.getTeamPlayers(teamId).catch(() => []),
          ]);

        const teamList = [
          ...(Array.isArray(intTeams) ? intTeams : (intTeams as any).result || []),
          ...(Array.isArray(leagueTeams) ? leagueTeams : (leagueTeams as any).result || []),
          ...(Array.isArray(womenTeams) ? womenTeams : (womenTeams as any).result || []),
        ];

        let foundTeam = teamList.find((t: any) => String(t.team_key) === teamId);

        // Check if any match fixture in schedules or results has the team logo and name
        const allMatches = [...(schedRes || []), ...(resultsRes || [])];
        const matchFixture = allMatches.find(
          (m: any) => String(m.home_team_key) === teamId || String(m.away_team_key) === teamId
        );

        if (!foundTeam) {
          const isHome = matchFixture ? String(matchFixture.home_team_key) === teamId : false;
          const inferredName = matchFixture
            ? isHome
              ? matchFixture.event_home_team
              : matchFixture.event_away_team
            : `Cricket Team #${teamId}`;
          const inferredLogo = matchFixture
            ? isHome
              ? matchFixture.event_home_team_logo
              : matchFixture.event_away_team_logo
            : undefined;

          foundTeam = {
            team_key: teamId,
            team_name: inferredName,
            team_short_name: (inferredName || '').slice(0, 3).toUpperCase(),
            team_logo: inferredLogo,
            country_name:
              matchFixture?.country_name || matchFixture?.league_name || 'Official Team',
          };
        } else if (!foundTeam.team_logo && matchFixture) {
          const isHome = String(matchFixture.home_team_key) === teamId;
          const matchLogo = isHome
            ? matchFixture.event_home_team_logo
            : matchFixture.event_away_team_logo;
          if (matchLogo) {
            foundTeam = { ...foundTeam, team_logo: matchLogo };
          }
        }

        setTeam(foundTeam);
        setSchedules(schedRes || []);
        setResults(resultsRes || []);
        setPlayers(playersRes || []);
      } catch (error) {
        console.error('Error loading squad intelligence:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-text-secondary font-black uppercase tracking-widest text-xs">
          Deploying Team Profile...
        </p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0a0e27] pt-[120px] flex flex-col justify-center items-center text-white text-center px-4">
        <div className="text-6xl mb-6">🛡️</div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Squad Archive Error</h2>
        <p className="text-text-secondary mb-8 max-w-md">
          The requested squad metadata is currently unavailable in the live feed records.
        </p>
        <button
          onClick={() => router.push('/cricket')}
          className="px-8 py-3 bg-secondary text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform"
        >
          Back to Cricket Central
        </button>
      </div>
    );
  }

  const tName = team.team_name || (team as any).name || 'International Squad';

  return (
    <div className="min-h-screen bg-[#0a0e27] pt-[120px] pb-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Navigation */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-secondary hover:border-secondary transition-all hover:scale-110 group shadow-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-1 transition-transform"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">
              Franchise / National Intel
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mt-1">
              {tName}
            </h1>
          </div>
        </div>

        {/* Team Hero Profile */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-10 mb-8 border border-white/10 relative overflow-hidden bg-gradient-to-br from-white/10 via-[#0a0e27] to-[#0d143d]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl overflow-hidden bg-white/5 border-2 border-white/10 flex-shrink-0 shadow-2xl p-4 flex items-center justify-center">
              {team.team_logo ? (
                <Image
                  src={team.team_logo}
                  alt={tName}
                  width={128}
                  height={128}
                  style={{ width: 'auto', height: 'auto' }}
                  className="object-contain max-h-full max-w-full"
                />
              ) : (
                <span className="text-5xl font-black text-secondary">{tName.charAt(0)}</span>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-black uppercase tracking-wider">
                  {(team as any).country_name || 'Official Team'}
                </span>
                {(team as any).team_short_name && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider">
                    {(team as any).team_short_name}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight mb-2">
                {tName}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 min-w-[100px] text-center">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-0.5">
                    Roster Count
                  </span>
                  <span className="text-base font-black text-white">{players.length} Athletes</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 min-w-[100px] text-center">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-0.5">
                    Upcoming
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    {schedules.length} Matches
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 min-w-[100px] text-center">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-0.5">
                    Completed
                  </span>
                  <span className="text-base font-black text-blue-400">
                    {results.length} Matches
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex gap-4 mb-8 bg-white/5 p-2 rounded-2xl border border-white/5">
          {[
            { id: 'squad', label: 'Squad Roster', icon: '🏏', count: players.length },
            { id: 'schedule', label: 'Match Schedule', icon: '🗓️', count: schedules.length },
            { id: 'results', label: 'Past Results', icon: '✅', count: results.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                                ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[9px] font-black tabular-nums">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Views */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Squad Tab */}
          {activeTab === 'squad' && (
            <div>
              {players.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.map((player) => (
                    <Link
                      key={player.player_key}
                      href={`/cricket/players/${player.player_key}`}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-secondary/40 hover:bg-secondary/5 transition-all"
                    >
                      <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl text-secondary overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                        {player.player_image ? (
                          <Image
                            src={player.player_image}
                            alt={player.player_name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          player.player_name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-white text-sm uppercase tracking-tight truncate group-hover:text-secondary transition-colors">
                          {player.player_name}
                        </h4>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                          {player.player_type || player.player_role || 'Athlete'}
                        </p>
                        {player.batting_style && (
                          <span className="text-[9px] text-text-muted/60 block mt-0.5 truncate">
                            {player.batting_style}
                          </span>
                        )}
                      </div>
                      <span className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity text-sm font-black">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-[2.5rem] p-16 text-center border-2 border-dashed border-white/5">
                  <span className="text-4xl mb-4 block">🏏</span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                    Roster Synchronizing
                  </h3>
                  <p className="text-text-muted text-xs max-w-sm mx-auto">
                    Official squad list for this tournament season is currently updating.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {schedules.length > 0 ? (
                schedules.map((match) => <CricketMatchCard key={match.event_key} match={match} />)
              ) : (
                <div className="glass-card rounded-[2.5rem] p-16 text-center border-2 border-dashed border-white/5">
                  <span className="text-4xl mb-4 block">🗓️</span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                    No Scheduled Matches
                  </h3>
                  <p className="text-text-muted text-xs max-w-sm mx-auto">
                    There are no upcoming tournament fixtures scheduled for this squad.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              {results.length > 0 ? (
                results.map((match) => <CricketMatchCard key={match.event_key} match={match} />)
              ) : (
                <div className="glass-card rounded-[2.5rem] p-16 text-center border-2 border-dashed border-white/5">
                  <span className="text-4xl mb-4 block">✅</span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                    No Match Archive
                  </h3>
                  <p className="text-text-muted text-xs max-w-sm mx-auto">
                    No recently completed fixtures recorded for this team in the archive.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

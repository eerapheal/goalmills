'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { advancedFootballApi } from '../../../services/advancedFootballApi';
import {
  FootballLeague,
  FootballEvent,
  FootballStanding,
  FootballTopscorer,
  FootballTeam,
} from '@goalmills/types';
import { FootballMatchCard } from '../../../components/FootballMatchCard';
import { FootballStandingsTable } from '../../../components/FootballStandingsTable';
import { FootballTopScorers } from '../../../components/FootballTopScorers';
import { BackButton } from '../../../components/BackButton';

type Tab = 'fixtures' | 'results' | 'standings' | 'topscorers';

export default function LeagueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = Number(params.id);

  const [activeTab, setActiveTab] = useState<Tab>('fixtures');
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState<FootballLeague | null>(null);
  const [events, setEvents] = useState<FootballEvent[]>([]);
  const [standings, setStandings] = useState<{ name: string; teams: FootballStanding[] }[]>([]);
  const [topscorers, setTopscorers] = useState<FootballTopscorer[]>([]);
  const [teams, setTeams] = useState<FootballTeam[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!leagueId) return;

      try {
        console.log('🔄 Loading league data for ID:', leagueId);

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-11

        // Determine season start year (July to June)
        let seasonStartYear = currentYear;
        if (currentMonth < 6) {
          // Jan - Jun
          seasonStartYear = currentYear - 1;
        }

        const fromDate = `${seasonStartYear}-07-01`;
        const toDate = `${seasonStartYear + 1}-06-30`;

        console.log(
          `🔄 Loading league data for ${leagueId} (Season: ${seasonStartYear}/${seasonStartYear + 1})...`
        );

        const [leaguesRes, fixturesRes, standingsRes, topscorersRes, teamsRes] = await Promise.all([
          advancedFootballApi.getLeagues(undefined, leagueId).catch((err) => {
            console.error('❌ Leagues API error:', err);
            return { success: 1, result: [] };
          }),
          advancedFootballApi
            .getFixtures({
              from: fromDate,
              to: toDate,
              leagueId: leagueId,
            })
            .catch((err) => {
              console.error('❌ Fixtures API error:', err);
              return { success: 1, result: [] };
            }),
          advancedFootballApi.getStandings(leagueId).catch((err) => {
            console.error('❌ Standings API error:', err);
            return { success: 1, result: { total: [], home: [], away: [] } };
          }),
          advancedFootballApi.getTopscorers(leagueId).catch((err) => {
            console.error('❌ Topscorers API error:', err);
            return { success: 1, result: [] };
          }),
          advancedFootballApi.getTeams({ leagueId: leagueId }).catch((err) => {
            console.error('❌ Teams API error:', err);
            return { success: 1, result: [] };
          }),
        ]);

        const leagues = leaguesRes?.result || [];
        const foundLeague = leagues.find((l) => l.league_key === String(leagueId));

        // If league not found in leagues list, try to get it from fixtures
        const fixtures = fixturesRes?.result || [];
        if (!foundLeague && fixtures.length > 0) {
          const firstFixture = fixturesRes.result[0];
          setLeague({
            league_key: String(leagueId),
            league_name: firstFixture.league_name,
            league_logo: firstFixture.league_logo || '',
            country_key: firstFixture.event_country_key || '',
            country_name: firstFixture.country_name,
            country_logo: firstFixture.country_logo || '',
          } as FootballLeague);
          console.log('✅ League info extracted from fixtures:', firstFixture.league_name);
        } else {
          setLeague(foundLeague || null);
          if (foundLeague) {
            console.log('✅ Found league:', foundLeague.league_name);
          } else {
            console.error('❌ League not found with ID:', leagueId);
          }
        }

        setEvents(fixtures);

        // Process Standings with Mobile App Grouping Logic
        let rawStandings: FootballStanding[] = [];
        const result = standingsRes.result;

        if (result) {
          if (Array.isArray(result)) {
            rawStandings = result;
          } else if (result.total && Array.isArray(result.total)) {
            rawStandings = result.total;
          }
        }
        const groupedStandings: { [key: string]: FootballStanding[] } = {};

        rawStandings.forEach((s) => {
          let groupName = s.stage_name || 'League Table';

          // Normalize variations
          if (groupName === 'League Stage' || groupName === 'League Phase') {
            groupName = 'League Table';
          }

          const specificGroup = (s as any).group || (s as any).league_group;
          const round = s.league_round;

          // Priority 1: Specific Group found in hidden fields
          if (specificGroup) {
            groupName = specificGroup;
          }
          // Priority 2: Use Round Logic
          else if (round && round.length < 25) {
            if (groupName === 'Group Stage' || groupName === 'League Table') {
              groupName = round;
            } else if (round !== groupName && !groupName.includes(round)) {
              // Concatenate for cases like "League A" + "Group 1"
              groupName = `${groupName} - ${round}`;
            }
          }

          groupName = groupName.trim();

          if (!groupedStandings[groupName]) {
            groupedStandings[groupName] = [];
          }

          // Deduplicate: Check if team already in this group by ID or Name
          const teamExists = groupedStandings[groupName].some(
            (existing) =>
              existing.team_key === s.team_key ||
              existing.standing_team.toLowerCase() === s.standing_team.toLowerCase()
          );

          // Position uniqueness: Check if rank already taken
          const rankExists = groupedStandings[groupName].some(
            (existing) => existing.standing_place === s.standing_place
          );

          if (!teamExists && !rankExists) {
            groupedStandings[groupName].push(s);
          }
        });

        // Remove generic "Group Stage" if specific groups exist
        if (Object.keys(groupedStandings).length > 1 && groupedStandings['Group Stage']) {
          delete groupedStandings['Group Stage'];
        }

        // Convert to array and sort groups
        const standingsData = Object.entries(groupedStandings).map(([name, teams]) => ({
          name,
          teams: teams.sort((a, b) => parseInt(a.standing_place) - parseInt(b.standing_place)),
        }));

        // Sort groups alphabetically (e.g. Group A, Group B, ...)
        standingsData.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        setStandings(standingsData);
        setTopscorers(topscorersRes?.result || []);

        // Enhance teams with data from fixtures to ensure we have logos for everyone
        const teamMap = new Map<string, FootballTeam>();
        if (teamsRes?.result) {
          teamsRes.result.forEach((t: FootballTeam) => teamMap.set(String(t.team_key), t));
        }

        fixtures.forEach((f: FootballEvent) => {
          if (f.home_team_key && f.home_team_logo) {
            const key = String(f.home_team_key);
            const existing = teamMap.get(key);
            if (!existing) {
              teamMap.set(key, {
                team_key: key,
                team_name: f.event_home_team,
                team_logo: f.home_team_logo,
              } as FootballTeam);
            } else if (!existing.team_logo || existing.team_logo === '') {
              existing.team_logo = f.home_team_logo;
            }
          }
          if (f.away_team_key && f.away_team_logo) {
            const key = String(f.away_team_key);
            const existing = teamMap.get(key);
            if (!existing) {
              teamMap.set(key, {
                team_key: key,
                team_name: f.event_away_team,
                team_logo: f.away_team_logo,
              } as FootballTeam);
            } else if (!existing.team_logo || existing.team_logo === '') {
              existing.team_logo = f.away_team_logo;
            }
          }
        });

        const finalTeams = Array.from(teamMap.values());
        setTeams(finalTeams);

        console.log('✅ League data loaded:', {
          fixtures: fixturesRes.result?.length || 0,
          standings: standingsRes.result?.total?.length || 0,
          topscorers: topscorersRes.result?.length || 0,
          teams: finalTeams.length,
        });
      } catch (error) {
        console.error('❌ Error loading league data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [leagueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-[90px] p-4">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-surfaceHighlight/50 rounded-full" />
            <div className="space-y-4">
              <div className="h-8 w-64 bg-surfaceHighlight/50 rounded-lg" />
              <div className="h-4 w-32 bg-surfaceHighlight/30 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-surfaceHighlight/30 rounded-xl" />
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-96 bg-surfaceHighlight/30 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-white mb-4">League Not Found</h1>
        <BackButton className="mt-4" />
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const finishedStatuses = ['Finished', 'FT', 'AET', 'AP', 'PEN', 'Match Finished'];
  const liveStatuses = ['Live', 'In Play', '1H', '2H', 'HT', 'ET', 'P'];

  const upcomingEvents = events
    .filter((e) => {
      const isFinished = finishedStatuses.includes(e.event_status);
      const isLive = liveStatuses.includes(e.event_status);
      // Strictly upcoming: Not finished AND (either it's today+ or it's currently live/not started)
      return !isFinished && e.event_date >= todayStr;
    })
    .sort((a, b) => {
      // Prioritize LIVE
      const isLiveA = a.event_live === '1' || liveStatuses.includes(a.event_status);
      const isLiveB = b.event_live === '1' || liveStatuses.includes(b.event_status);
      if (isLiveA && !isLiveB) return -1;
      if (!isLiveA && isLiveB) return 1;

      // Then sort by date and time
      const dateA = new Date(`${a.event_date} ${a.event_time}`).getTime();
      const dateB = new Date(`${b.event_date} ${b.event_time}`).getTime();

      // If same date/time, keep order
      if (dateA === dateB) return 0;
      return dateA - dateB;
    });

  const finishedEvents = events
    .filter((e) => {
      const isFinished = finishedStatuses.includes(e.event_status);
      return isFinished || (e.event_date < todayStr && !liveStatuses.includes(e.event_status));
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.event_date} ${a.event_time}`).getTime();
      const dateB = new Date(`${b.event_date} ${b.event_time}`).getTime();
      return dateB - dateA; // Results sorted descending (newest first)
    });

  // Helper to format date header
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();

    // Reset hours to compare dates only
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = d.getTime() - t.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Group events by date for upcoming
  const groupedUpcoming = upcomingEvents.reduce(
    (groups, event) => {
      const date = event.event_date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
      return groups;
    },
    {} as Record<string, FootballEvent[]>
  );

  // Group events by date for results
  const groupedResults = finishedEvents.reduce(
    (groups, event) => {
      const date = event.event_date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
      return groups;
    },
    {} as Record<string, FootballEvent[]>
  );

  return (
    <div className="min-h-screen bg-background pt-[90px] pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-white/5 pt-8 pb-6 px-4 relative">
        <BackButton className="absolute top-4 left-4 z-20" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-24 h-24 p-4 bg-white/5 rounded-2xl border border-white/10">
            <img
              src={league.league_logo || undefined}
              alt={league.league_name}
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-white mb-2">{league.league_name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 text-text-muted font-medium">
              <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-sm">
                <img
                  src={league.country_logo || undefined}
                  alt={league.country_name}
                  className="w-4 h-3 object-cover rounded-sm"
                />
                {league.country_name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[90px] z-30 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {(['fixtures', 'results', 'standings', 'topscorers'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                                    py-4 px-2 border-b-2 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap
                                    ${
                                      activeTab === tab
                                        ? 'border-secondary text-secondary'
                                        : 'border-transparent text-text-muted hover:text-white'
                                    }
                                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'fixtures' && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">Upcoming Matches</h3>
            {Object.keys(groupedUpcoming)
              .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
              .map((date) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-4 px-2">
                    <span className="text-sm font-black text-secondary uppercase tracking-[0.2em] whitespace-nowrap">
                      {formatDateHeader(date)}
                    </span>
                    <div className="h-px w-full bg-gradient-to-r from-secondary/30 to-transparent" />
                  </div>
                  {groupedUpcoming[date].map((event, index) => (
                    <FootballMatchCard key={`fixture-${event.event_key}-${index}`} event={event} />
                  ))}
                </div>
              ))}
            {upcomingEvents.length === 0 && (
              <p className="text-text-muted text-center py-8">No upcoming matches.</p>
            )}
          </div>
        )}
        {activeTab === 'results' && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">Recent Results</h3>
            {Object.keys(groupedResults)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map((date) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-4 px-2">
                    <span className="text-sm font-black text-secondary uppercase tracking-[0.2em] whitespace-nowrap">
                      {formatDateHeader(date)}
                    </span>
                    <div className="h-px w-full bg-gradient-to-r from-secondary/30 to-transparent" />
                  </div>
                  {groupedResults[date].map((event, index) => (
                    <FootballMatchCard key={`result-${event.event_key}-${index}`} event={event} />
                  ))}
                </div>
              ))}
            {finishedEvents.length === 0 && (
              <p className="text-text-muted text-center py-8">No recent results.</p>
            )}
          </div>
        )}
        {activeTab === 'standings' && (
          <div className="space-y-8 animate-fade-in">
            {standings.length > 0 ? (
              standings.map((group, index) => (
                <div key={`group-${index}`} className="space-y-4">
                  {(standings.length > 1 || group.name !== 'League Table') && (
                    <h3 className="text-xl font-bold text-white pl-2">{group.name}</h3>
                  )}
                  <FootballStandingsTable
                    standings={group.teams}
                    teams={teams}
                    leagueId={leagueId}
                  />
                </div>
              ))
            ) : (
              <p className="text-text-muted text-center py-8">No standings available.</p>
            )}
          </div>
        )}

        {activeTab === 'topscorers' && (
          <div className="animate-fade-in">
            <FootballTopScorers scorers={topscorers} teams={teams} />
          </div>
        )}
      </div>
    </div>
  );
}

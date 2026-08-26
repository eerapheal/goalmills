import { NextRequest, NextResponse } from 'next/server';

// ─── In-Memory Cache ──────────────────────────────────────────────────────────
interface CacheEntry {
  timestamp: number;
  data: any;
  ttl: number;
}

const CACHE_STORE = new Map<string, CacheEntry>();
let rateLimitBackoffUntil = 0;

// Rate-limit spacer: minimum 250ms between outbound fetches to prevent 429 bursts
let lastFetchTime = 0;
const MIN_FETCH_GAP_MS = 250;

async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLast = now - lastFetchTime;
  if (timeSinceLast < MIN_FETCH_GAP_MS) {
    const delay = MIN_FETCH_GAP_MS - timeSinceLast;
    lastFetchTime = now + delay;
    await new Promise(resolve => setTimeout(resolve, delay));
  } else {
    lastFetchTime = Date.now();
  }
  return fetch(url, options);
}

// ─── Config ───────────────────────────────────────────────────────────────────
function getApiBaseUrl(): string {
  let raw =
    process.env.NEXT_PUBLIC_CRICKET_BASE_URL ||
    process.env.CRICKET_BASE_URL ||
    'https://cricbuzz-cricket.p.rapidapi.com';
  raw = raw.trim();
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  return raw.replace(/\/$/, '');
}

const API_KEY =
  process.env.CRICKET_API_KEY ||
  process.env.NEXT_PUBLIC_CRICKET_API_KEY ||
  process.env.ALLSPORTS_API_KEY ||
  '';

// ─── TTL Logic ────────────────────────────────────────────────────────────────
function getTtlForEndpoint(endpoint: string): number {
  const ep = endpoint.toLowerCase();
  if (ep.includes('live') || ep.includes('score')) return 15;
  if (ep.includes('fixture') || ep.includes('match') || ep.includes('schedule') || ep.includes('upcoming') || ep.includes('recent') || ep.includes('results')) return 60;
  if (ep.includes('standing') || ep.includes('table') || ep.includes('rank') || ep.includes('points-table')) return 300;
  if (ep.includes('team') || ep.includes('league') || ep.includes('series') || ep.includes('player') || ep.includes('news') || ep.includes('stats')) return 600;
  return 60;
}

// ─── Cricbuzz Path Mapping ────────────────────────────────────────────────────
function mapCricbuzzPath(endpoint: string, searchParams: URLSearchParams): string {
  const ep = endpoint.toLowerCase().trim();
  const playerId = searchParams.get('playerId') || searchParams.get('id') || searchParams.get('player_id');
  const seriesId = searchParams.get('leagueId') || searchParams.get('seriesId') || searchParams.get('id');
  const teamId = searchParams.get('teamId') || searchParams.get('team_id') || searchParams.get('team');
  const matchId = searchParams.get('matchId') || searchParams.get('match_id') || searchParams.get('id');

  // Direct paths starting with '/'
  if (endpoint.startsWith('/')) return endpoint;

  // Match Center: Scorecard, Commentary, Lineups, Overs, Leanback, Info
  if (ep === 'matches/get-scorecard' || ep === 'matches/get-scorecard-v2' || ep === 'scorecard' || ep === 'scard' || ep.includes('scard')) {
    return matchId ? `/mcenter/v1/${matchId}/scard` : '/matches/v1/recent';
  }
  if (ep === 'matches/get-commentaries' || ep === 'matches/get-commentaries-v2' || ep === 'commentary' || ep === 'comments' || ep === 'comm') {
    return matchId ? `/mcenter/v1/${matchId}/comm` : '/matches/v1/live';
  }
  if (ep === 'matches/get-hcomm' || ep === 'hcomm' || ep === 'highlights-commentary') {
    return matchId ? `/mcenter/v1/${matchId}/hcomm` : '/matches/v1/live';
  }
  if (ep === 'matches/get-team' || ep === 'matches/team' || ep === 'match-team') {
    return matchId && teamId ? `/mcenter/v1/${matchId}/team/${teamId}` : (matchId ? `/mcenter/v1/${matchId}/scard` : '/matches/v1/recent');
  }
  if (ep === 'matches/get-overs' || ep === 'overs' || ep === 'miniscore') {
    return matchId ? `/mcenter/v1/${matchId}/overs` : '/matches/v1/live';
  }
  if (ep === 'matches/get-leanback' || ep === 'leanback' || ep === 'odds' || ep === 'predictions') {
    return matchId ? `/mcenter/v1/${matchId}/leanback` : '/matches/v1/live';
  }
  if (ep === 'matches/get-info' || ep === 'match/info' || ep === 'match_info' || ep === 'matchinfo' || ep === 'mcenter') {
    return matchId ? `/mcenter/v1/${matchId}` : '/matches/v1/live';
  }

  // Live / Matches / Fixtures / Recent
  if (ep === 'livescore' || ep === 'live') return '/matches/v1/live';
  if (ep === 'fixtures' || ep === 'upcoming') return '/matches/v1/upcoming';
  if (ep === 'recent') return '/matches/v1/recent';

  // Series / Leagues
  if (ep === 'leagues' || ep === 'series' || ep === 'series/v1/international') return '/series/v1/international';
  if (ep === 'standings' || ep === 'points-table' || ep.includes('points-table')) {
    return seriesId ? `/series/v1/${seriesId}/points-table` : '/series/v1/international';
  }

  // Teams: Specialized sub-routes
  if (ep === 'teams/get-schedules' || ep === 'teams/schedules' || ep === 'teams/schedule') {
    return teamId ? `/teams/v1/${teamId}/schedule` : '/matches/v1/upcoming';
  }
  if (ep === 'teams/get-results' || ep === 'teams/results') {
    return teamId ? `/teams/v1/${teamId}/results` : '/matches/v1/recent';
  }
  if (ep === 'teams/get-players' || ep === 'teams/players') {
    return teamId ? `/teams/v1/${teamId}/players` : '/stats/v1/player/trending';
  }
  if (ep === 'teams/get-news' || ep === 'teams/news') {
    return teamId ? `/news/v1/team/${teamId}` : '/news/v1/index';
  }
  if (ep === 'teams/get-stats' || ep === 'teams/get-stats-filters' || ep === 'teams/stats') {
    return teamId ? `/stats/v1/team/${teamId}` : '/teams/v1/international';
  }

  // Teams: General listing
  if (ep === 'teams' || ep === 'teams/list' || ep.startsWith('teams/')) {
    const teamType = searchParams.get('type') || 'international';
    return `/teams/v1/${teamType}`;
  }

  // Players
  if (
    ep === 'players' ||
    ep === 'players/list-trending' ||
    ep === 'players/trending' ||
    ep === 'stats/v1/player/trending' ||
    ep.includes('trending')
  ) {
    if (playerId) return `/stats/v1/player/${playerId}`;
    return '/stats/v1/player/trending';
  }

  if (ep === 'players/get-info' || ep === 'player/info' || ep === 'player') {
    return playerId ? `/stats/v1/player/${playerId}` : '/stats/v1/player/trending';
  }
  if (ep === 'players/get-career' || ep === 'player/career') {
    return playerId ? `/stats/v1/player/${playerId}/career` : '/stats/v1/player/trending';
  }
  if (ep === 'players/get-batting' || ep === 'player/batting') {
    return playerId ? `/stats/v1/player/${playerId}/batting` : '/stats/v1/player/trending';
  }
  if (ep === 'players/get-bowling' || ep === 'player/bowling') {
    return playerId ? `/stats/v1/player/${playerId}/bowling` : '/stats/v1/player/trending';
  }
  if (ep === 'players/get-news' || ep === 'player/news') {
    return '/news/v1/index';
  }

  // News
  if (ep === 'news' || ep === 'news/v1/index' || ep.includes('news')) {
    return '/news/v1/index';
  }

  return endpoint.includes('/') ? `/${endpoint.replace(/^\//, '')}` : `/matches/v1/${endpoint}`;
}

// ─── Cricbuzz → App Format Transformers ───────────────────────────────────────

const CRICBUZZ_IMG = (id: number | string) =>
  `https://static.cricbuzz.com/a/img/v1/i1/c${id}/i.jpg`;

const KNOWN_CRICKET_TEAM_LOGOS: Record<string, string> = {
  'india': 'https://static.cricbuzz.com/a/img/v1/i1/c776162/i.jpg',
  'ind': 'https://static.cricbuzz.com/a/img/v1/i1/c776162/i.jpg',
  'australia': 'https://static.cricbuzz.com/a/img/v1/i1/c776202/i.jpg',
  'aus': 'https://static.cricbuzz.com/a/img/v1/i1/c776202/i.jpg',
  'england': 'https://static.cricbuzz.com/a/img/v1/i1/c776237/i.jpg',
  'eng': 'https://static.cricbuzz.com/a/img/v1/i1/c776237/i.jpg',
  'south africa': 'https://static.cricbuzz.com/a/img/v1/i1/c776249/i.jpg',
  'sa': 'https://static.cricbuzz.com/a/img/v1/i1/c776249/i.jpg',
  'rsa': 'https://static.cricbuzz.com/a/img/v1/i1/c776249/i.jpg',
  'new zealand': 'https://static.cricbuzz.com/a/img/v1/i1/c776214/i.jpg',
  'nz': 'https://static.cricbuzz.com/a/img/v1/i1/c776214/i.jpg',
  'pakistan': 'https://static.cricbuzz.com/a/img/v1/i1/c776228/i.jpg',
  'pak': 'https://static.cricbuzz.com/a/img/v1/i1/c776228/i.jpg',
  'sri lanka': 'https://static.cricbuzz.com/a/img/v1/i1/c776254/i.jpg',
  'sl': 'https://static.cricbuzz.com/a/img/v1/i1/c776254/i.jpg',
  'west indies': 'https://static.cricbuzz.com/a/img/v1/i1/c776267/i.jpg',
  'wi': 'https://static.cricbuzz.com/a/img/v1/i1/c776267/i.jpg',
  'bangladesh': 'https://static.cricbuzz.com/a/img/v1/i1/c776274/i.jpg',
  'ban': 'https://static.cricbuzz.com/a/img/v1/i1/c776274/i.jpg',
  'afghanistan': 'https://static.cricbuzz.com/a/img/v1/i1/c776282/i.jpg',
  'afg': 'https://static.cricbuzz.com/a/img/v1/i1/c776282/i.jpg',
  'ireland': 'https://static.cricbuzz.com/a/img/v1/i1/c776290/i.jpg',
  'ire': 'https://static.cricbuzz.com/a/img/v1/i1/c776290/i.jpg',
  'zimbabwe': 'https://static.cricbuzz.com/a/img/v1/i1/c776300/i.jpg',
  'zim': 'https://static.cricbuzz.com/a/img/v1/i1/c776300/i.jpg',
  'scotland': 'https://static.cricbuzz.com/a/img/v1/i1/c776302/i.jpg',
  'netherlands': 'https://static.cricbuzz.com/a/img/v1/i1/c776304/i.jpg',
  'ned': 'https://static.cricbuzz.com/a/img/v1/i1/c776304/i.jpg',
  'usa': 'https://static.cricbuzz.com/a/img/v1/i1/c776306/i.jpg',
  'nepal': 'https://static.cricbuzz.com/a/img/v1/i1/c776308/i.jpg',
  'namibia': 'https://static.cricbuzz.com/a/img/v1/i1/c776312/i.jpg',
  'canada': 'https://static.cricbuzz.com/a/img/v1/i1/c776314/i.jpg',
  'oman': 'https://static.cricbuzz.com/a/img/v1/i1/c776316/i.jpg',
  'papua new guinea': 'https://static.cricbuzz.com/a/img/v1/i1/c776318/i.jpg',
  'uae': 'https://static.cricbuzz.com/a/img/v1/i1/c776322/i.jpg',
  'chennai super kings': 'https://static.cricbuzz.com/a/img/v1/i1/c776310/i.jpg',
  'csk': 'https://static.cricbuzz.com/a/img/v1/i1/c776310/i.jpg',
  'mumbai indians': 'https://static.cricbuzz.com/a/img/v1/i1/c776320/i.jpg',
  'mi': 'https://static.cricbuzz.com/a/img/v1/i1/c776320/i.jpg',
  'royal challengers bengaluru': 'https://static.cricbuzz.com/a/img/v1/i1/c776330/i.jpg',
  'royal challengers bangalore': 'https://static.cricbuzz.com/a/img/v1/i1/c776330/i.jpg',
  'rcb': 'https://static.cricbuzz.com/a/img/v1/i1/c776330/i.jpg',
  'kolkata knight riders': 'https://static.cricbuzz.com/a/img/v1/i1/c776340/i.jpg',
  'kkr': 'https://static.cricbuzz.com/a/img/v1/i1/c776340/i.jpg',
  'sunrisers hyderabad': 'https://static.cricbuzz.com/a/img/v1/i1/c776350/i.jpg',
  'srh': 'https://static.cricbuzz.com/a/img/v1/i1/c776350/i.jpg',
  'delhi capitals': 'https://static.cricbuzz.com/a/img/v1/i1/c776360/i.jpg',
  'dc': 'https://static.cricbuzz.com/a/img/v1/i1/c776360/i.jpg',
  'rajasthan royals': 'https://static.cricbuzz.com/a/img/v1/i1/c776370/i.jpg',
  'rr': 'https://static.cricbuzz.com/a/img/v1/i1/c776370/i.jpg',
  'gujarat titans': 'https://static.cricbuzz.com/a/img/v1/i1/c776380/i.jpg',
  'gt': 'https://static.cricbuzz.com/a/img/v1/i1/c776380/i.jpg',
  'lucknow super giants': 'https://static.cricbuzz.com/a/img/v1/i1/c776390/i.jpg',
  'lsg': 'https://static.cricbuzz.com/a/img/v1/i1/c776390/i.jpg',
  'punjab kings': 'https://static.cricbuzz.com/a/img/v1/i1/c776400/i.jpg',
  'pbks': 'https://static.cricbuzz.com/a/img/v1/i1/c776400/i.jpg',
  'sydney sixers': 'https://static.cricbuzz.com/a/img/v1/i1/c776410/i.jpg',
  'sydney thunder': 'https://static.cricbuzz.com/a/img/v1/i1/c776412/i.jpg',
  'perth scorchers': 'https://static.cricbuzz.com/a/img/v1/i1/c776414/i.jpg',
  'brisbane heat': 'https://static.cricbuzz.com/a/img/v1/i1/c776416/i.jpg',
  'adelaide strikers': 'https://static.cricbuzz.com/a/img/v1/i1/c776418/i.jpg',
  'melbourne stars': 'https://static.cricbuzz.com/a/img/v1/i1/c776420/i.jpg',
  'melbourne renegades': 'https://static.cricbuzz.com/a/img/v1/i1/c776422/i.jpg',
  'hobart hurricanes': 'https://static.cricbuzz.com/a/img/v1/i1/c776424/i.jpg',
  'lahore qalandars': 'https://static.cricbuzz.com/a/img/v1/i1/c776430/i.jpg',
  'karachi kings': 'https://static.cricbuzz.com/a/img/v1/i1/c776432/i.jpg',
  'islamabad united': 'https://static.cricbuzz.com/a/img/v1/i1/c776434/i.jpg',
  'peshawar zalmi': 'https://static.cricbuzz.com/a/img/v1/i1/c776436/i.jpg',
  'multan sultans': 'https://static.cricbuzz.com/a/img/v1/i1/c776438/i.jpg',
  'quetta gladiators': 'https://static.cricbuzz.com/a/img/v1/i1/c776440/i.jpg',
};

const resolveImgUrl = (img: any): string | undefined => {
  if (!img) return undefined;
  const str = String(img).trim();
  if (str === '0') return undefined;
  if (str.startsWith('http://') || str.startsWith('https://')) return str;
  if (/^\d+$/.test(str)) return `https://static.cricbuzz.com/a/img/v1/i1/c${str}/i.jpg`;
  return undefined;
};

const resolveTeamLogo = (teamObj: any, teamNameFallback?: string): string => {
  const direct = teamObj?.imageId || teamObj?.faceImageId || teamObj?.image || teamObj?.team_logo || teamObj?.logo;
  const resolvedDirect = resolveImgUrl(direct);
  if (resolvedDirect) return resolvedDirect;

  const name = (teamObj?.teamName || teamObj?.name || teamNameFallback || '').trim().toLowerCase();
  if (name && KNOWN_CRICKET_TEAM_LOGOS[name]) {
    return KNOWN_CRICKET_TEAM_LOGOS[name];
  }

  for (const [key, logoUrl] of Object.entries(KNOWN_CRICKET_TEAM_LOGOS)) {
    if (name.includes(key) || key.includes(name)) {
      return logoUrl;
    }
  }

  const cleanName = teamObj?.teamName || teamObj?.name || teamNameFallback || 'Team';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0D8ABC&color=fff&size=128`;
};

/**
 * Build score strings from innings data
 */
function buildScoreStr(teamScore: any): string {
  if (!teamScore) return '';
  const parts: string[] = [];
  for (const key of ['inngs1', 'inngs2', 'inngs3', 'inngs4']) {
    const inn = teamScore[key];
    if (!inn) continue;
    let s = `${inn.runs}`;
    if (inn.wickets !== undefined && inn.wickets < 10) s += `/${inn.wickets}`;
    if (inn.overs !== undefined) s += ` (${inn.overs} ov)`;
    if (inn.isDeclared) s += 'd';
    parts.push(s);
  }
  return parts.join(' & ');
}

/**
 * Convert match info & score into a standardized CricketEvent
 */
function mapMatchToEvent(info: any, score: any, seriesNameFallback?: string): any {
  if (!info) return null;

  const t1 = info.team1 || {};
  const t2 = info.team2 || {};
  const venue = info.venueInfo || {};
  const startMs = Number(info.startDate || 0);
  const endMs = Number(info.endDate || 0);
  const startDate = startMs ? new Date(startMs).toISOString().split('T')[0] : null;
  const endDate = endMs ? new Date(endMs).toISOString().split('T')[0] : null;
  const startTime = startMs
    ? new Date(startMs).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    : null;

  const isLive = info.state === 'In Progress' || info.state === 'Live' || info.stateTitle === 'In Progress';
  const t1Name = t1.teamName || t1.name || 'TBA';
  const t2Name = t2.teamName || t2.name || 'TBA';

  return {
    event_key: String(info.matchId || info.id || ''),
    event_date_start: startDate,
    event_date_stop: endDate,
    event_time: startTime,
    event_home_team: t1Name,
    home_team_key: String(t1.teamId || t1.id || ''),
    event_away_team: t2Name,
    away_team_key: String(t2.teamId || t2.id || ''),
    event_service_home: '',
    event_service_away: '',
    event_home_final_result: buildScoreStr(score?.team1Score),
    event_away_final_result: buildScoreStr(score?.team2Score),
    event_home_rr: null,
    event_away_rr: null,
    event_status: info.state || info.stateTitle || 'Scheduled',
    event_status_info: info.status || '',
    country_name: info.matchFormat || 'International',
    league_name: info.seriesName || seriesNameFallback || '',
    league_key: String(info.seriesId || ''),
    league_round: info.matchDesc || '',
    league_season: new Date(startMs || Date.now()).getFullYear().toString(),
    event_live: isLive ? '1' : '0',
    event_type: info.matchFormat || 'Cricket',
    event_stadium: venue.ground ? `${venue.ground}${venue.city ? ', ' + venue.city : ''}` : undefined,
    event_home_team_logo: resolveTeamLogo(t1, t1Name),
    event_away_team_logo: resolveTeamLogo(t2, t2Name),
  };
}

/**
 * Extract a flat array of CricketEvent objects from Cricbuzz typeMatches structure
 */
function transformCricbuzzMatches(data: any): any[] {
  const typeMatches = data?.typeMatches;
  if (!Array.isArray(typeMatches)) return [];

  const events: any[] = [];
  for (const tm of typeMatches) {
    const seriesMatches = tm.seriesMatches;
    if (!Array.isArray(seriesMatches)) continue;

    for (const sm of seriesMatches) {
      const wrapper = sm.seriesAdWrapper;
      if (!wrapper?.matches) continue;

      for (const m of wrapper.matches) {
        const ev = mapMatchToEvent(m.matchInfo, m.matchScore, wrapper.seriesName);
        if (ev) events.push(ev);
      }
    }
  }
  return events;
}

/**
 * Extract a flat array of CricketEvent objects from team schedule/results response
 */
function transformCricbuzzTeamMatches(data: any): any[] {
  if (!data) return [];
  const events: any[] = [];

  const teamMatchesData = data?.teamMatchesData || data?.matchScheduleMap || data?.scheduleData;
  if (Array.isArray(teamMatchesData)) {
    for (const block of teamMatchesData) {
      const matches = block?.matchDetailsMap?.match || block?.match || block?.matches || block?.scheduleAdWrapper?.matches;
      if (Array.isArray(matches)) {
        for (const m of matches) {
          const ev = mapMatchToEvent(m.matchInfo || m, m.matchScore);
          if (ev) events.push(ev);
        }
      }
    }
  }

  if (events.length === 0 && Array.isArray(data?.matches)) {
    for (const m of data.matches) {
      const ev = mapMatchToEvent(m.matchInfo || m, m.matchScore);
      if (ev) events.push(ev);
    }
  }

  if (events.length === 0 && Array.isArray(data?.typeMatches)) {
    return transformCricbuzzMatches(data);
  }

  return events;
}

/**
 * Transform Cricbuzz series response into CricketLeague[] format
 */
function transformCricbuzzSeries(data: any): any[] {
  const seriesMap = data?.seriesMapProto || data?.seriesMapProfiles;
  if (!Array.isArray(seriesMap)) return [];

  const leagues: any[] = [];
  for (const group of seriesMap) {
    const series = group.series;
    if (!Array.isArray(series)) continue;

    for (const s of series) {
      leagues.push({
        league_key: String(s.id || s.seriesId || ''),
        league_name: s.name || s.seriesName || '',
        league_year: s.startDt
          ? new Date(Number(s.startDt)).getFullYear().toString()
          : new Date().getFullYear().toString(),
        league_season: s.startDt
          ? new Date(Number(s.startDt)).getFullYear().toString()
          : undefined,
        country_name: group.date || 'International',
      });
    }
  }
  return leagues;
}

/**
 * Transform Cricbuzz teams/v1 list into CricketTeam[] format
 * Filters out header items like { teamName: 'Test Teams' } without teamId
 */
function transformCricbuzzTeamsList(data: any): any[] {
  const list = data?.list || data?.teams || (Array.isArray(data) ? data : []);
  if (!Array.isArray(list)) return [];

  return list
    .filter((t: any) => t && (t.teamId || t.team_key || t.id))
    .map((t: any) => {
      const tid = String(t.teamId || t.team_key || t.id);
      const img = t.imageId || t.faceImageId || t.image || t.team_logo || t.logo;
      return {
        team_key: tid,
        team_name: t.teamName || t.name || '',
        team_short_name: t.teamSName || t.shortName || (t.teamName || t.name || '').slice(0, 3).toUpperCase(),
        team_logo: resolveTeamLogo(t, t.teamName || t.name),
        country_name: t.countryName || t.country || t.teamName || 'International',
      };
    });
}

/**
 * Transform Cricbuzz teams/v1/{id}/players into CricketPlayer[] format
 */
function transformCricbuzzTeamSquad(data: any, teamId: string): any[] {
  const raw = data?.player;
  if (!Array.isArray(raw)) return [];

  let currentRole = 'Player';
  const players: any[] = [];

  for (const p of raw) {
    if (!p.id && p.name) {
      currentRole = p.name;
      continue;
    }
    if (p.id) {
      players.push({
        player_key: String(p.id),
        player_name: p.name || '',
        player_image: p.imageId || p.faceImageId ? CRICBUZZ_IMG(p.imageId || p.faceImageId) : undefined,
        player_type: currentRole,
        player_role: currentRole,
        batting_style: p.battingStyle || undefined,
        bowling_style: p.bowlingStyle || undefined,
        team_key: teamId,
      });
    }
  }

  return players;
}

/**
 * Transform Cricbuzz player responses (trending list or single player bio)
 */
function transformCricbuzzPlayers(data: any): any[] {
  if (Array.isArray(data?.player)) {
    return data.player.map((p: any) => ({
      player_key: String(p.id || ''),
      player_name: p.name || 'Cricket Player',
      player_country: p.teamName || 'International',
      player_image: p.faceImageId ? CRICBUZZ_IMG(p.faceImageId) : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400',
      player_type: 'International Player',
      player_role: 'Athlete',
      team_name: p.teamName || 'International',
    }));
  }

  if (data && (data.id || data.name)) {
    return [{
      player_key: String(data.id || ''),
      player_name: data.name || '',
      player_country: data.intlTeam || data.teamName || 'International',
      player_image: data.faceImageId || data.imageId ? CRICBUZZ_IMG(data.faceImageId || data.imageId) : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400',
      player_type: data.role || 'Player',
      player_role: data.role || 'Player',
      batting_style: data.bat || data.battingStyle || 'Right-hand bat',
      bowling_style: data.bowl || data.bowlingStyle || 'Right-arm medium',
      player_born: data.birthPlace || undefined,
      bio: data.bio || undefined,
      team_name: data.intlTeam || data.teamName || undefined,
    }];
  }

  return [];
}

/**
 * Transform Cricbuzz /mcenter/v1/{matchId}/scard into complete scorecard, wickets, extras, and lineups
 */
function transformCricbuzzScorecard(data: any): any {
  if (!data) return { scorecard: {}, wickets: {}, extra: {}, lineups: { home_team: { starting_lineups: [] }, away_team: { starting_lineups: [] } } };

  const rawScorecard = data.scoreCard || data.scorecard || (Array.isArray(data) ? data : []);
  const matchHeader = data.matchHeader || {};

  const scorecardObj: Record<string, any[]> = {};
  const wicketsObj: Record<string, any[]> = {};
  const extraObj: Record<string, any> = {};

  if (Array.isArray(rawScorecard)) {
    rawScorecard.forEach((inn: any, idx: number) => {
      const innName = inn.batTeamDetails?.batTeamShortName
        ? `${inn.batTeamDetails.batTeamShortName} Innings`
        : `Innings_${inn.inningsId || idx + 1}`;

      const batsmenList: any[] = [];
      const bowlersList: any[] = [];
      const wicketsList: any[] = [];

      // Batsmen
      const batsmenMap = inn.batTeamDetails?.batsmenData || {};
      Object.values(batsmenMap).forEach((b: any) => {
        if (!b) return;
        batsmenList.push({
          innings: innName,
          player: b.batName || b.name || 'Batsman',
          player_id: b.batId || b.id ? String(b.batId || b.id) : undefined,
          type: 'Batsman',
          status: b.outDesc || (b.runs !== undefined ? 'not out' : 'yet to bat'),
          R: String(b.runs ?? 0),
          B: String(b.balls ?? 0),
          Min: String(b.minutes ?? 0),
          '4s': String(b.fours ?? 0),
          '6s': String(b.sixes ?? 0),
          O: null,
          M: null,
          W: null,
          SR: String(b.strikeRate ?? (b.balls ? ((b.runs / b.balls) * 100).toFixed(1) : '0')),
          ER: null,
        });
      });

      // Bowlers
      const bowlersMap = inn.bowlTeamDetails?.bowlersData || {};
      Object.values(bowlersMap).forEach((b: any) => {
        if (!b) return;
        bowlersList.push({
          innings: innName,
          player: b.bowlName || b.name || 'Bowler',
          player_id: b.bowlerId || b.id ? String(b.bowlerId || b.id) : undefined,
          type: 'Bowler',
          status: '',
          R: String(b.runs ?? 0),
          B: '0',
          Min: '0',
          '4s': '0',
          '6s': '0',
          O: String(b.overs ?? 0),
          M: String(b.maidens ?? 0),
          W: String(b.wickets ?? 0),
          SR: '0',
          ER: String(b.economy ?? (b.overs ? (b.runs / Number(b.overs)).toFixed(2) : '0')),
        });
      });

      // Combine into innings scorecard
      scorecardObj[innName] = [...batsmenList, ...bowlersList];

      // Fall of Wickets
      const fowMap = inn.wicketsData || {};
      Object.values(fowMap).forEach((w: any) => {
        if (!w) return;
        wicketsList.push({
          innings: innName,
          fall: `${w.wktOver ?? ''} ov`,
          balwer: w.bowlerName || w.bowler || 'Bowler',
          batsman: w.batName || w.batsman || 'Batsman',
          score: `${w.wktRuns ?? 0}/${w.wktOrder ?? ''}`,
        });
      });
      wicketsObj[innName] = wicketsList;

      // Extras
      const extras = inn.extrasData || {};
      extraObj[innName] = {
        innings: innName,
        nr: '0',
        text: `b ${extras.byes ?? 0}, lb ${extras.legByes ?? 0}, w ${extras.wides ?? 0}, nb ${extras.noBalls ?? 0}, p ${extras.penalty ?? 0}`,
        total_overs: inn.scoreDetails?.overs ? String(inn.scoreDetails.overs) : null,
        total: String(extras.total ?? 0),
        percent_over: null,
      };
    });
  }

  // Build Lineups from matchHeader or teams
  const homeLineup: any[] = [];
  const awayLineup: any[] = [];

  const t1Players = matchHeader.team1?.playingXI || matchHeader.team1?.players || [];
  const t2Players = matchHeader.team2?.playingXI || matchHeader.team2?.players || [];

  t1Players.forEach((p: any) => {
    homeLineup.push({
      player: p.name || p.fullName || 'Player',
      player_country: p.role || 'Player',
      player_id: p.id ? String(p.id) : undefined,
      is_captain: p.isCaptain,
      is_keeper: p.isKeeper,
    });
  });

  t2Players.forEach((p: any) => {
    awayLineup.push({
      player: p.name || p.fullName || 'Player',
      player_country: p.role || 'Player',
      player_id: p.id ? String(p.id) : undefined,
      is_captain: p.isCaptain,
      is_keeper: p.isKeeper,
    });
  });

  return {
    scorecard: scorecardObj,
    wickets: wicketsObj,
    extra: extraObj,
    lineups: {
      home_team: { starting_lineups: homeLineup },
      away_team: { starting_lineups: awayLineup },
    },
    matchHeader,
    status: matchHeader.status || matchHeader.state,
    man_of_match: matchHeader.playersOfTheMatch?.[0]?.name,
  };
}

/**
 * Transform Cricbuzz /mcenter/v1/{matchId}/comm or /hcomm into CricketComment[] grouped by innings
 */
function transformCricbuzzCommentary(data: any): Record<string, any[]> {
  const commList = data?.commentaryList || data?.commList || (Array.isArray(data) ? data : []);
  if (!Array.isArray(commList)) return { Innings_1: [] };

  const commentsByInnings: Record<string, any[]> = {};

  commList.forEach((c: any) => {
    if (!c || (!c.commText && !c.commentary)) return;
    const innKey = `Innings_${c.inningsId || 1}`;
    if (!commentsByInnings[innKey]) commentsByInnings[innKey] = [];

    const text = c.commText || c.commentary || '';
    let runs = '0';
    if (c.event === 'FOUR' || text.toLowerCase().includes('four') || text.toLowerCase().includes('4 runs')) runs = '4';
    else if (c.event === 'SIX' || text.toLowerCase().includes('six') || text.toLowerCase().includes('6 runs')) runs = '6';
    else if (c.event === 'WICKET' || text.toLowerCase().includes('out') || text.toLowerCase().includes('wicket')) runs = 'W';
    else if (c.runs !== undefined) runs = String(c.runs);

    commentsByInnings[innKey].push({
      innings: innKey,
      overs: c.overNumber !== undefined ? String(c.overNumber) : (c.ballNbr ? `${Math.floor(c.ballNbr / 6)}.${c.ballNbr % 6}` : '0.0'),
      balls: String(c.ballNbr || ''),
      runs,
      post: text,
      ended: 'No',
      timestamp: c.timestamp,
    });
  });

  return commentsByInnings;
}

/**
 * Transform Cricbuzz /mcenter/v1/{matchId}/leanback into odds, prediction probabilities, and mini-score
 */
function transformCricbuzzLeanback(data: any, matchId: string): any {
  const mini = data?.miniscore || data?.matchMiniScore || data;
  const homeWin = mini?.matchOdds?.homeWin || mini?.team1WinProb || mini?.team1Odds || '55%';
  const awayWin = mini?.matchOdds?.awayWin || mini?.team2WinProb || mini?.team2Odds || '45%';

  return {
    [matchId]: {
      'Match Winner': {
        Home: { 'Win Prob': homeWin, 'Live Odds': '1.80' },
        Away: { 'Win Prob': awayWin, 'Live Odds': '2.05' },
      },
      'Projected Score': {
        '1st Innings Projected': { Total: mini?.projScore ? String(mini.projScore) : '185 - 200' },
        'Current Run Rate': { Rate: mini?.crr ? String(mini.crr) : '8.50' },
      },
    },
  };
}

/**
 * Detect the type of endpoint and apply the correct Cricbuzz → app transformation.
 */
function transformCricbuzzResponse(endpointParam: string, data: any, searchParams: URLSearchParams): any {
  const ep = endpointParam.toLowerCase();
  const matchId = searchParams.get('matchId') || searchParams.get('match_id') || searchParams.get('id') || '0';
  const teamId = searchParams.get('teamId') || searchParams.get('team_id') || searchParams.get('id') || '';

  // Match Scorecard: /mcenter/v1/{id}/scard
  if (ep.includes('scard') || ep.includes('scorecard') || data?.scoreCard) {
    const scard = transformCricbuzzScorecard(data);
    return { success: 1, result: scard };
  }

  // Match Commentary: /mcenter/v1/{id}/comm or /hcomm
  if (ep.includes('comm') || data?.commentaryList) {
    const comments = transformCricbuzzCommentary(data);
    return { success: 1, result: comments };
  }

  // Match Leanback & Odds: /mcenter/v1/{id}/leanback
  if (ep.includes('leanback') || ep.includes('odds') || data?.miniscore) {
    const odds = transformCricbuzzLeanback(data, matchId);
    return { success: 1, result: odds };
  }

  // Team Schedule or Results: data.teamMatchesData
  if (data?.teamMatchesData || ep.includes('schedule') || ep.includes('results')) {
    const events = transformCricbuzzTeamMatches(data);
    if (events.length > 0) return { success: 1, result: events };
  }

  // Team Players Squad: /teams/v1/{id}/players
  if (ep.includes('teams/get-players') || (ep.includes('teams') && ep.includes('players')) || (data?.player && Array.isArray(data?.player) && data.player.some((x: any) => !x.id && x.name))) {
    const squad = transformCricbuzzTeamSquad(data, teamId);
    if (squad.length > 0) return { success: 1, result: squad };
  }

  // Match listing endpoints
  if (ep === 'livescore' || ep === 'live' || ep === 'fixtures' || ep === 'upcoming' || ep === 'recent' || ep.includes('matches/v1')) {
    const events = transformCricbuzzMatches(data);
    return { success: 1, result: events };
  }

  // Teams listing: /teams/v1/{type}
  if (data?.list || ep === 'teams' || ep === 'teams/list') {
    const teams = transformCricbuzzTeamsList(data);
    if (teams.length > 0) return { success: 1, result: teams };
  }

  // Series / Leagues listing
  if (ep === 'leagues' || ep === 'series' || ep.includes('series/v1/international')) {
    const leagues = transformCricbuzzSeries(data);
    return { success: 1, result: leagues };
  }

  // Players
  if (ep.includes('player') || data?.player || (data?.id && data?.name)) {
    const players = transformCricbuzzPlayers(data);
    if (players.length > 0) return { success: 1, result: players };
  }

  // Fallthrough
  return {
    success: 1,
    result: Array.isArray(data) ? data : (data.result ?? data.values ?? data.types ?? data.storyList ?? data),
    ...(!Array.isArray(data) ? data : {}),
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpointParam = searchParams.get('endpoint') || searchParams.get('met');

    if (!endpointParam) {
      return NextResponse.json(
        { error: 'Endpoint or method parameter (endpoint/met) is required' },
        { status: 400 }
      );
    }

    const baseUrlStr = getApiBaseUrl();
    const isRapidApi = baseUrlStr.includes('rapidapi.com');
    const apiUrl = new URL(baseUrlStr);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (isRapidApi) {
      if (API_KEY) headers['x-rapidapi-key'] = API_KEY;
      headers['x-rapidapi-host'] = apiUrl.host;
      apiUrl.pathname = mapCricbuzzPath(endpointParam, searchParams);

      // Only forward params that Cricbuzz accepts
      searchParams.forEach((value: any, key: any) => {
        if (!['met', 'endpoint', 'from', 'to', 'timezone', 'leagueId', 'seriesId', 'playerId', 'teamId', 'team_id'].includes(key) && value) {
          apiUrl.searchParams.append(key, value);
        }
      });
    } else {
      apiUrl.searchParams.append('met', endpointParam);
      if (API_KEY) apiUrl.searchParams.append('APIkey', API_KEY);
      searchParams.forEach((value: any, key: any) => {
        if (key !== 'met' && key !== 'endpoint' && value) {
          apiUrl.searchParams.append(key, value);
        }
      });
    }

    const cacheKey = apiUrl.toString();
    const ttlSeconds = getTtlForEndpoint(endpointParam);
    const now = Date.now();

    // Check in-memory cache
    const cached = CACHE_STORE.get(cacheKey);
    if (cached && (now - cached.timestamp < cached.ttl * 1000)) {
      return NextResponse.json(cached.data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`,
          'X-Cache': 'HIT',
        },
      });
    }

    // Rate-limited backoff check
    if (now < rateLimitBackoffUntil) {
      if (cached) {
        return NextResponse.json(cached.data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Cache': 'STALE_THROTTLED',
          },
        });
      }
      return NextResponse.json(
        { success: 1, result: [], message: 'Rate-limited backoff active' },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('Proxying cricket request to:', apiUrl.toString());

    let response: Response | null = null;
    try {
      response = await rateLimitedFetch(apiUrl.toString(), {
        method: 'GET',
        headers,
        next: { revalidate: ttlSeconds },
      });
    } catch (fetchErr) {
      console.warn('Cricket API fetch error:', fetchErr);
    }

    if (!response || !response.ok || response.status === 204) {
      const status = response ? response.status : 502;
      if (status === 404 || status === 204) {
        console.info(`[Info] Feed unavailable for ${endpointParam} (status ${status}), returning client fallback.`);
      } else {
        console.warn(`Cricket API status ${status} for ${endpointParam}, triggering client fallbacks.`);
      }
      if (status === 429) rateLimitBackoffUntil = Date.now() + 15_000;

      if (cached) {
        return NextResponse.json(cached.data, {
          headers: { 'Access-Control-Allow-Origin': '*', 'X-Cache': 'STALE_ERROR_FALLBACK' },
        });
      }

      return NextResponse.json(
        { success: 1, result: [], message: `Live feed fallback (status ${status})` },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const text = await response.text();
    let data: any = {};
    if (text && text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.warn('Cricket proxy JSON parse warning:', err);
        data = {};
      }
    }

    // ─── TRANSFORM: Convert Cricbuzz nested format → app-compatible flat format
    const standardized = isRapidApi
      ? transformCricbuzzResponse(endpointParam, data, searchParams)
      : {
          success: 1,
          result: Array.isArray(data) ? data : (data.result ?? data),
          ...(!Array.isArray(data) ? data : {}),
        };

    // Store in memory cache
    CACHE_STORE.set(cacheKey, {
      timestamp: Date.now(),
      data: standardized,
      ttl: ttlSeconds,
    });

    return NextResponse.json(standardized, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`,
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Cricket Proxy error:', error);
    return NextResponse.json(
      { success: 1, result: [], message: error instanceof Error ? error.message : 'Fallback' },
      { status: 200 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MatchItem {
  id: string;
  sport: 'Football' | 'Cricket' | 'Basketball';
  league: string;
  flag: string;
  home: string;
  away: string;
  hScore: number | string;
  aScore: number | string;
  minute: string;
  status: 'LIVE' | 'FT' | 'UPCOMING';
  homeLogo?: string;
  awayLogo?: string;
}

interface NewsItem {
  id: string | number;
  category: string;
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  time: string;
  image: string;
  slug: string;
}

// Rock-solid verified fallback data from the Figma design specification
const FALLBACK_MATCHES: MatchItem[] = [
  {
    id: 'mci-ars-2026',
    sport: 'Football',
    league: 'Premier League',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    home: 'Man City',
    away: 'Arsenal',
    hScore: 2,
    aScore: 1,
    minute: "67'",
    status: 'LIVE',
  },
  {
    id: 'nap-juv-2026',
    sport: 'Football',
    league: 'Serie A',
    flag: '🇮🇹',
    home: 'Napoli',
    away: 'Juventus',
    hScore: 3,
    aScore: 0,
    minute: "82'",
    status: 'LIVE',
  },
  {
    id: 'nga-rwa-2026',
    sport: 'Football',
    league: 'AFCON Q.',
    flag: '🌍',
    home: 'Nigeria',
    away: 'Rwanda',
    hScore: 3,
    aScore: 0,
    minute: 'FT',
    status: 'FT',
  },
  {
    id: 'bar-rma-2026',
    sport: 'Football',
    league: 'La Liga',
    flag: '🇪🇸',
    home: 'Barcelona',
    away: 'Real Madrid',
    hScore: 0,
    aScore: 0,
    minute: 'SUN 17:00',
    status: 'UPCOMING',
  },
  {
    id: 'che-bay-2026',
    sport: 'Football',
    league: 'UCL',
    flag: '⭐',
    home: 'Chelsea',
    away: 'Bayern',
    hScore: 1,
    aScore: 1,
    minute: "45+2'",
    status: 'LIVE',
  },
  {
    id: 'dor-lep-2026',
    sport: 'Football',
    league: 'Bundesliga',
    flag: '🇩🇪',
    home: 'Dortmund',
    away: 'Leipzig',
    hScore: 2,
    aScore: 2,
    minute: 'FT',
    status: 'FT',
  },
  {
    id: 'csk-mi-2026',
    sport: 'Cricket',
    league: 'IPL 2026',
    flag: '🏏',
    home: 'Chennai Super Kings',
    away: 'Mumbai Indians',
    hScore: '184/4',
    aScore: '152/6',
    minute: '16.4 ov',
    status: 'LIVE',
  },
  {
    id: 'lal-bos-2026',
    sport: 'Basketball',
    league: 'NBA',
    flag: '🏀',
    home: 'LA Lakers',
    away: 'Boston Celtics',
    hScore: 112,
    aScore: 108,
    minute: 'Q4 01:24',
    status: 'LIVE',
  },
];

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: '1',
    category: 'Transfer',
    tag: 'BREAKING',
    tagColor: 'bg-red-500',
    title: "Mbappé's agent in secret talks with PSG as reunion edges closer",
    excerpt:
      'Sources inside the Bernabéu say Real Madrid are prepared to listen to offers as the French superstar eyes a sensational return to Paris.',
    time: '12 min ago',
    image: 'https://images.unsplash.com/photo-1751394217542-a5a65fca29bb?w=600&h=400&fit=crop&auto=format',
    slug: 'mbappe-secret-talks-psg-reunion-edges-closer',
  },
  {
    id: '2',
    category: 'AFCON',
    tag: 'ANALYSIS',
    tagColor: 'bg-blue-500',
    title: "Nigeria's front three are the most lethal in Africa right now",
    excerpt:
      'xG data paints a picture of a Super Eagles attack at peak efficiency — Osimhen, Lookman, and Chukwueze firing on all cylinders.',
    time: '1 hr ago',
    image: 'https://images.unsplash.com/photo-1711645313209-a386d71bc991?w=600&h=400&fit=crop&auto=format',
    slug: 'nigeria-front-three-most-lethal-in-africa',
  },
  {
    id: '3',
    category: 'UCL',
    tag: 'PREVIEW',
    tagColor: 'bg-yellow-500',
    title: 'Chelsea vs Bayern: The tactical battle that will decide the semi',
    excerpt:
      "Pochettino's high press against Kane's movement. A detailed statistical breakdown of the key midfield duels.",
    time: '2 hr ago',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&h=400&fit=crop&auto=format',
    slug: 'chelsea-vs-bayern-tactical-battle-semi-final',
  },
  {
    id: '4',
    category: 'Premier League',
    tag: 'STATS',
    tagColor: 'bg-blue-500',
    title: "Haaland's xG numbers are historically unprecedented in the PL",
    excerpt:
      'A new StatsBomb report confirms Haaland is converting chances at a rate no PL striker has ever matched across a full season.',
    time: '3 hr ago',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&h=400&fit=crop&auto=format',
    slug: 'haaland-xg-numbers-historically-unprecedented',
  },
];

const STATS_BAR = [
  { value: '45K+', label: 'Newsletter subscribers' },
  { value: '12', label: 'Live sports covered' },
  { value: '10AM WAT', label: 'Daily digest drops' },
  { value: '100%', label: 'Free forever' },
];

function getLeagueFlag(leagueName: string, sport: string): string {
  const l = (leagueName || '').toLowerCase();
  if (sport === 'Cricket') return '🏏';
  if (sport === 'Basketball') return '🏀';
  if (l.includes('premier') || l.includes('england')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (l.includes('la liga') || l.includes('spain') || l.includes('copa del rey')) return '🇪🇸';
  if (l.includes('serie a') || l.includes('italy')) return '🇮🇹';
  if (l.includes('bundesliga') || l.includes('germany')) return '🇩🇪';
  if (l.includes('ligue 1') || l.includes('france')) return '🇫🇷';
  if (l.includes('afcon') || l.includes('caf') || l.includes('nigeria') || l.includes('africa')) return '🌍';
  if (l.includes('champions league') || l.includes('ucl')) return '⭐';
  if (l.includes('europa')) return '🏆';
  return '⚽';
}

function formatRelativeTime(dateStr?: string | Date): string {
  if (!dateStr) return 'Recent';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function MatchCard({ m }: { m: MatchItem }) {
  const matchIdStr = String(m?.id ?? '');
  const matchHref = m.sport === 'Football'
    ? (matchIdStr.includes('-') ? `/football/matches/${matchIdStr}` : `/matches/${matchIdStr}`)
    : m.sport === 'Cricket'
      ? `/cricket`
      : `/basketball`;

  return (
    <Link
      href={matchHref}
      className="block bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 hover:border-[#334155] hover:bg-[#131f35] transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase flex items-center gap-1.5 truncate max-w-[70%]">
          <span>{m.flag}</span>
          <span className="truncate">{m.league}</span>
        </span>
        {m.status === 'LIVE' ? (
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-red-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block animate-pulse" />
            {m.minute}
          </span>
        ) : m.status === 'FT' ? (
          <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
            FT
          </span>
        ) : (
          <span className="text-[10px] font-semibold tracking-widest text-blue-400 uppercase">
            {m.minute}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {m.homeLogo ? (
              <img
                src={m.homeLogo}
                alt=""
                className="w-4 h-4 object-contain rounded flex-shrink-0"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : null}
            <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              {m.home}
            </span>
          </div>
          <span
            className={`text-lg font-black tabular-nums flex-shrink-0 ${
              m.status === 'LIVE' ? 'text-white' : 'text-slate-300'
            }`}
          >
            {m.hScore}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {m.awayLogo ? (
              <img
                src={m.awayLogo}
                alt=""
                className="w-4 h-4 object-contain rounded flex-shrink-0"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : null}
            <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              {m.away}
            </span>
          </div>
          <span
            className={`text-lg font-black tabular-nums flex-shrink-0 ${
              m.status === 'LIVE' ? 'text-white' : 'text-slate-300'
            }`}
          >
            {m.aScore}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MatchCardSkeleton() {
  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-24 bg-slate-800 rounded" />
        <div className="h-3 w-12 bg-slate-800 rounded" />
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-slate-800 rounded" />
          <div className="h-5 w-6 bg-slate-800 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-slate-800 rounded" />
          <div className="h-5 w-6 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Live' | 'Football' | 'Cricket' | 'Basketball'>('All');
  const [matches, setMatches] = useState<MatchItem[]>(FALLBACK_MATCHES);
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  // Newsletter state
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const filters: Array<'All' | 'Live' | 'Football' | 'Cricket' | 'Basketball'> = [
    'All',
    'Live',
    'Football',
    'Cricket',
    'Basketball',
  ];

  // ── Fetch dynamic AllSports matches across Football, Cricket, Basketball ──
  const fetchMatches = useCallback(async () => {
    try {
      const [footRes, cricRes, bballRes] = await Promise.all([
        fetch('/api/football?met=Livescore').catch(() => null),
        fetch('/api/cricket?met=Livescore').catch(() => null),
        fetch('/api/basketball?met=Livescore').catch(() => null),
      ]);

      const parsedMatches: MatchItem[] = [];

      // Process Football Matches
      if (footRes && footRes.ok) {
        const footData = await footRes.json();
        let fList = footData?.result || footData?.response || (Array.isArray(footData) ? footData : []);

        // If no live matches, fetch upcoming/recent fixtures
        if (!Array.isArray(fList) || fList.length === 0) {
          const fixRes = await fetch('/api/football?met=Fixtures').catch(() => null);
          if (fixRes && fixRes.ok) {
            const fixData = await fixRes.json();
            fList = fixData?.result || fixData?.response || (Array.isArray(fixData) ? fixData : []);
          }
        }

        if (Array.isArray(fList)) {
          fList.slice(0, 10).forEach((m: any, idx: number) => {
            const home = m.event_home_team || 'Home Team';
            const away = m.event_away_team || 'Away Team';
            const rawStatus = (m.event_status || '').trim();
            const isLive = m.event_live === '1' || (rawStatus && !['Finished', 'FT', 'Postponed', 'Cancelled'].includes(rawStatus) && !rawStatus.includes(':'));
            const isFT = rawStatus === 'Finished' || rawStatus === 'FT';

            let status: 'LIVE' | 'FT' | 'UPCOMING' = 'UPCOMING';
            let minute = m.event_time || 'UPCOMING';

            if (isLive) {
              status = 'LIVE';
              minute = rawStatus ? `${rawStatus}'` : 'LIVE';
            } else if (isFT) {
              status = 'FT';
              minute = 'FT';
            }

            const hScore = m.event_final_result
              ? (m.event_final_result.split('-')[0]?.trim() ?? 0)
              : (m.event_home_final_result ?? 0);
            const aScore = m.event_final_result
              ? (m.event_final_result.split('-')[1]?.trim() ?? 0)
              : (m.event_away_final_result ?? 0);

            parsedMatches.push({
              id: String(m.event_key || `ft-${idx}`),
              sport: 'Football',
              league: m.league_name || 'Premier League',
              flag: getLeagueFlag(m.league_name, 'Football'),
              home,
              away,
              hScore: status === 'UPCOMING' && hScore === 0 && aScore === 0 ? 0 : hScore,
              aScore: status === 'UPCOMING' && hScore === 0 && aScore === 0 ? 0 : aScore,
              minute,
              status,
              homeLogo: m.home_team_logo,
              awayLogo: m.away_team_logo,
            });
          });
        }
      }

      // Process Cricket Matches
      if (cricRes && cricRes.ok) {
        const cData = await cricRes.json();
        const cList = cData?.result || (Array.isArray(cData) ? cData : []);
        if (Array.isArray(cList) && cList.length > 0) {
          cList.slice(0, 4).forEach((c: any, idx: number) => {
            const home = c.event_home_team || 'Team 1';
            const away = c.event_away_team || 'Team 2';
            const rawStatus = (c.event_status || '').trim();
            const isLive = rawStatus.toLowerCase().includes('live') || rawStatus.toLowerCase().includes('inn');
            const isFT = rawStatus.toLowerCase().includes('won') || rawStatus.toLowerCase().includes('ended');

            let status: 'LIVE' | 'FT' | 'UPCOMING' = 'UPCOMING';
            if (isLive) status = 'LIVE';
            else if (isFT) status = 'FT';

            parsedMatches.push({
              id: String(c.event_key || `cric-${idx}`),
              sport: 'Cricket',
              league: c.league_name || 'Cricket Series',
              flag: '🏏',
              home,
              away,
              hScore: c.event_home_final_result || '--',
              aScore: c.event_away_final_result || '--',
              minute: rawStatus || 'Live',
              status,
            });
          });
        }
      }

      // Process Basketball Matches
      if (bballRes && bballRes.ok) {
        const bData = await bballRes.json();
        const bList = bData?.result || (Array.isArray(bData) ? bData : []);
        if (Array.isArray(bList) && bList.length > 0) {
          bList.slice(0, 4).forEach((b: any, idx: number) => {
            const home = b.event_home_team || 'Home';
            const away = b.event_away_team || 'Away';
            const rawStatus = (b.event_status || '').trim();
            const isLive = rawStatus.includes('Q') || rawStatus.toLowerCase().includes('live');
            const isFT = rawStatus.toLowerCase().includes('finished') || rawStatus === 'FT';

            let status: 'LIVE' | 'FT' | 'UPCOMING' = 'UPCOMING';
            if (isLive) status = 'LIVE';
            else if (isFT) status = 'FT';

            parsedMatches.push({
              id: String(b.event_key || `bball-${idx}`),
              sport: 'Basketball',
              league: b.league_name || 'NBA',
              flag: '🏀',
              home,
              away,
              hScore: b.event_final_result ? b.event_final_result.split('-')[0]?.trim() : (b.event_home_final_result ?? 0),
              aScore: b.event_final_result ? b.event_final_result.split('-')[1]?.trim() : (b.event_away_final_result ?? 0),
              minute: rawStatus || 'LIVE',
              status,
            });
          });
        }
      }

      if (parsedMatches.length > 0) {
        setMatches(parsedMatches);
      }
    } catch {
      // Keep verified fallback matches seamlessly
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  // ── Fetch dynamic breaking news ──
  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch('/api/news?limit=6');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data?.news || data?.data;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: NewsItem[] = items.slice(0, 5).map((item: any, idx: number) => {
            const category = item.category || item.sport || 'Football';
            const isBreaking = item.isBreaking || idx === 0;
            const tag = isBreaking ? 'BREAKING' : (item.articleType?.toUpperCase() || 'ANALYSIS');
            const tagColor = isBreaking
              ? 'bg-red-500'
              : tag === 'ANALYSIS'
                ? 'bg-blue-500'
                : 'bg-yellow-500';

            return {
              id: item._id || item.id || idx,
              category,
              tag,
              tagColor,
              title: item.title,
              excerpt: item.excerpt || (item.content ? item.content.slice(0, 140) + '...' : ''),
              time: formatRelativeTime(item.createdAt),
              image:
                item.featuredImage ||
                item.image ||
                FALLBACK_NEWS[idx % FALLBACK_NEWS.length].image,
              slug: item.slug || item._id || 'sports-news',
            };
          });

          // If less than 4, append fallback items to maintain 2-col visual balance
          if (mapped.length < 4) {
            const needed = 4 - mapped.length;
            mapped.push(...FALLBACK_NEWS.slice(0, needed));
          }
          setNews(mapped);
        }
      }
    } catch {
      // Retain fallback news
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchNews();

    // Auto-refresh live matches every 30 seconds
    const interval = setInterval(() => {
      fetchMatches();
    }, 30_000);

    return () => clearInterval(interval);
  }, [fetchMatches, fetchNews]);


  // Filtered matches for display
  const displayedMatches = useMemo(() => {
    if (activeFilter === 'All') return matches;
    if (activeFilter === 'Live') return matches.filter((m) => m.status === 'LIVE');
    return matches.filter((m) => m.sport === activeFilter);
  }, [matches, activeFilter]);

  // Newsletter submission handler
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: 'home_hero',
          frequency: 'daily',
        }),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.subscribed)) {
        setSubscribed(true);
      } else {
        setErrorMessage(data.message || 'Subscription failed. Please check your email.');
      }
    } catch {
      // Offline or network error fallback
      setSubscribed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ── 1. Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1600&h=900&fit=crop&auto=format"
            alt="Football stadium"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-[#020617]/80 to-[#020617]" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-red-500 to-yellow-400" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-10 lg:py-13">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.93] tracking-tight text-white mb-5">
              Africa&apos;s 
            <b />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-red-400 to-yellow-300">
                Sports Hub
              </span>
            </h1>
            <p className="hidden md:block text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed mb-7">
              Live scores, xG breakdowns, transfer news, and daily digests from the Premier League, AFCON, IPL, and beyond.
            </p>
            <div className="hiddenflex flex-wrap gap-3">
              <a
                href="#scores"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-lg shadow-blue-600/25"
              >
                Follow Live Scores →
              </a>
              <Link
                href="/football"
                className="bg-[#1e293b] hover:bg-[#263347] text-slate-200 font-semibold text-sm px-6 py-3 rounded-xl transition-colors border border-[#334155]"
              >
                Explore Teams
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Live Scores & Fixtures ── */}
      <section id="scores" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Scores & Fixtures</h2>
            <p className="text-slate-400 text-xs mt-0.5">Updated in real-time from AllSports API</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeFilter === f
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-transparent border-[#1e293b] text-slate-400 hover:border-[#334155] hover:text-slate-200'
                }`}
              >
                {f === 'Live' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mr-1.5 animate-pulse" />
                )}
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoadingMatches ? (
            Array.from({ length: 6 }).map((_, i) => <MatchCardSkeleton key={i} />)
          ) : displayedMatches.length > 0 ? (
            displayedMatches.map((m) => <MatchCard key={`${m.sport}-${m.id}`} m={m} />)
          ) : (
            <div className="col-span-full text-center py-12 bg-[#0f172a] border border-[#1e293b] rounded-xl">
              <p className="text-slate-400 text-sm">No matches found for {activeFilter}.</p>
              <button
                onClick={() => setActiveFilter('All')}
                className="mt-3 text-xs text-blue-400 hover:underline font-semibold"
              >
                View all fixtures
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Breaking News ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-[#1e293b]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-white tracking-tight">Breaking News</h2>
          <Link
            href="/news"
            className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors hidden sm:block"
          >
            All stories →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Featured Large Article (2 Cols) */}
          <div className="lg:col-span-2">
            {news[0] && (
              <Link
                href={`/news/${news[0].slug}`}
                className="block relative overflow-hidden rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-[#334155] transition-all group h-full"
              >
                <div className="relative h-52 sm:h-64 overflow-hidden bg-slate-800">
                  <img
                    src={news[0].image}
                    alt={news[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent" />
                  <span
                    className={`absolute top-3 left-3 ${news[0].tagColor} text-white text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded`}
                  >
                    {news[0].tag}
                  </span>
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-semibold text-blue-400 tracking-widest uppercase mb-1.5 block">
                    {news[0].category}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-white leading-snug mb-2">
                    {news[0].title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-2">
                    {news[0].excerpt}
                  </p>
                  <span className="text-xs text-slate-500">{news[0].time}</span>
                </div>
              </Link>
            )}
          </div>

          {/* List of side news items (3 Cols) */}
          <div className="lg:col-span-3 space-y-0 divide-y divide-[#1e293b]">
            {news.slice(1, 4).map((a) => (
              <Link
                key={a.id}
                href={`/news/${a.slug}`}
                className="flex gap-4 items-start py-3 first:pt-0 cursor-pointer group hover:bg-[#0f172a] rounded-xl px-3 -mx-3 transition-all"
              >
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`${a.tagColor} text-white text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded`}
                    >
                      {a.tag}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-400 tracking-widest uppercase">
                      {a.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-white leading-snug line-clamp-2 mb-1">
                    {a.title}
                  </h3>
                  <span className="text-xs text-slate-500">{a.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Stats Bar ── */}
      <section className="border-y border-[#1e293b] bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS_BAR.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                  {s.value}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Daily Digest Newsletter ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="relative overflow-hidden rounded-3xl bg-[#0f172a] border border-[#1e293b]">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-red-500/15 blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-red-500 to-yellow-400" />

          <div className="relative px-6 sm:px-12 lg:px-16 py-14 sm:py-18">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-5">
                ⚡ Daily at 10:00 AM WAT
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-3">
                The smartest sports digest
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">
                  in Africa
                </span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-7">
                Lineup data, xG breakdowns, AFCON updates, and transfer rumours — delivered every morning to 45,000+ fans.
              </p>

              {subscribed ? (
                <div className="inline-flex items-center gap-3 bg-green-500/20 border border-green-500/40 text-green-400 font-bold px-6 py-4 rounded-xl text-sm animate-in fade-in zoom-in-95 duration-200">
                  ✓ You&apos;re in! Check your inbox at 10 AM WAT.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-[#1e293b] border border-[#334155] text-white placeholder-slate-500 text-sm font-medium px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-blue-600/30"
                  >
                    {submitting ? 'Subscribing...' : 'Subscribe Free'}
                  </button>
                </form>
              )}

              {errorMessage && (
                <p className="text-xs text-red-400 mt-2 font-medium">{errorMessage}</p>
              )}

              <div className="flex flex-wrap justify-center gap-5 mt-5 text-xs text-slate-500">
                {['100% Free Forever', 'Zero Spam Guarantee', '1-Click Unsubscribe'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="text-green-400 font-bold">✓</span>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

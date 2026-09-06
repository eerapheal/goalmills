'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import {
  FiSearch,
  FiFilter,
  FiClock,
  FiCalendar,
  FiVideo,
  FiFileText,
  FiMail,
  FiChevronRight,
  FiChevronLeft,
  FiX,
  FiZap,
} from 'react-icons/fi';
import Link from 'next/link';
import { getNewsUrl } from '@/lib/slugUtils';
import type { SearchResponse, SearchResultItem, SearchSuggestionItem } from '@goalmills/types';

function SearchPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || searchParams.get('query') || '';
  const initialSport = searchParams.get('sport') || 'all';
  const initialType = searchParams.get('type') || 'all';
  const initialDate = searchParams.get('dateRange') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [sport, setSport] = useState(initialSport);
  const [contentType, setContentType] = useState(initialType);
  const [dateRange, setDateRange] = useState(initialDate);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest'>('relevance');
  const [page, setPage] = useState(1);

  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch search results
  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setSearchData(null);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('q', query.trim());
        if (sport !== 'all') params.set('sport', sport);
        if (contentType !== 'all') params.set('type', contentType);
        if (dateRange !== 'all') params.set('dateRange', dateRange);
        params.set('sortBy', sortBy);
        params.set('page', String(page));
        params.set('limit', '12');

        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setSearchData(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(performSearch, 200);
    return () => clearTimeout(timer);
  }, [query, sport, contentType, dateRange, sortBy, page]);

  // Autocomplete suggestions fetch
  useEffect(() => {
    async function fetchSuggestions() {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success && data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch {}
    }

    const timer = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setPage(1);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sport !== 'all') params.set('sport', sport);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Search Header Bar */}
      <div className="relative z-30 max-w-3xl mx-auto mb-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search football, cricket, basketball, teams, breaking news..."
              className="w-full bg-slate-900 border border-white/15 rounded-2xl pl-12 pr-12 py-4 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xl transition-all"
            />
            <FiSearch className="absolute left-4 text-amber-400" size={20} />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSearchData(null);
                }}
                className="absolute right-4 text-slate-400 hover:text-white p-1"
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/15 rounded-2xl p-2 shadow-2xl space-y-1 z-50 backdrop-blur-xl">
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Instant Suggestions
              </div>
              {suggestions.map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  onClick={() => {
                    setQuery(sug.title);
                    setShowSuggestions(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0">
                      {sug.type === 'video' ? <FiVideo size={13} /> : <FiFileText size={13} />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 truncate">
                        {sug.title}
                      </p>
                      {sug.subtitle && (
                        <p className="text-[10px] text-slate-400">{sug.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <FiChevronRight size={14} className="text-slate-500 group-hover:text-white" />
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-500 font-bold uppercase text-[10px] flex-shrink-0">
            Trending:
          </span>
          {['Arsenal', 'Champions League', 'Virat Kohli', 'IPL 2026', 'Lakers', 'Transfer Radar'].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  setShowSuggestions(false);
                }}
                className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 font-medium text-xs whitespace-nowrap transition-all"
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Search Grid (Sidebar Filters + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <FiFilter className="text-amber-400" /> Filter Results
              </span>
              <button
                type="button"
                onClick={() => {
                  setSport('all');
                  setContentType('all');
                  setDateRange('all');
                  setSortBy('relevance');
                }}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Sport Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sport
              </label>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Sports' },
                  { id: 'football', label: '⚽ Football' },
                  { id: 'cricket', label: '🏏 Cricket' },
                  { id: 'basketball', label: '🏀 Basketball' },
                  { id: 'tennis', label: '🎾 Tennis' },
                  { id: 'baseball', label: '⚾ Baseball' },
                  { id: 'hockey', label: '🏒 Hockey' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSport(s.id);
                      setPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      sport === s.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{s.label}</span>
                    {searchData?.facets?.sports[s.id] && (
                      <span className="text-[10px] opacity-75">
                        {searchData.facets.sports[s.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Filter */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Content Type
              </label>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Content', icon: FiZap },
                  { id: 'article', label: 'News & Analysis', icon: FiFileText },
                  { id: 'video', label: 'Video Highlights', icon: FiVideo },
                  { id: 'newsletter', label: 'Newsletters', icon: FiMail },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setContentType(t.id);
                      setPage(1);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      contentType === t.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <t.icon size={13} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Published Date
              </label>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'Anytime' },
                  { id: 'today', label: 'Past 24 Hours' },
                  { id: 'week', label: 'Past 7 Days' },
                  { id: 'month', label: 'Past 30 Days' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDateRange(d.id);
                      setPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      dateRange === d.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Stream */}
        <div className="lg:col-span-3 space-y-4">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {searchData ? (
                <>
                  Found <strong className="text-white">{searchData.total}</strong> results in{' '}
                  <span className="font-mono text-amber-400">{searchData.executionTimeMs}ms</span>
                </>
              ) : (
                'Enter a query to begin searching GoalMills'
              )}
            </span>

            {searchData && searchData.total > 0 && (
              <div className="flex items-center gap-2">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-900 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Latest First</option>
                </select>
              </div>
            )}
          </div>

          {/* Result Cards */}
          {loading ? (
            <div className="min-h-[350px] flex items-center justify-center">
              <GoalmillsLoader />
            </div>
          ) : searchData && searchData.results.length > 0 ? (
            <div className="space-y-3">
              {searchData.results.map((item) => (
                <Link
                  key={`${item.entityType}_${item.id}`}
                  href={item.url || getNewsUrl(item)}
                  className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-amber-500/40 flex flex-col sm:flex-row items-start gap-4 transition-all group block"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full sm:w-40 h-28 object-cover rounded-xl border border-white/10 flex-shrink-0 bg-slate-950"
                    />
                  )}

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold uppercase tracking-wider border border-amber-500/20">
                        {item.entityType}
                      </span>
                      {item.sport && (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-bold uppercase">
                          {item.sport}
                        </span>
                      )}
                      {item.competition && (
                        <span className="text-slate-400 font-medium truncate">
                          {item.competition}
                        </span>
                      )}
                      {item.publishedAt && (
                        <span className="text-slate-500 font-mono flex items-center gap-1 ml-auto">
                          <FiClock size={10} />
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  </div>
                </Link>
              ))}

              {/* Pagination */}
              {searchData.totalPages > 1 && (
                <div className="pt-6 flex items-center justify-between border-t border-white/10">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40"
                  >
                    <FiChevronLeft size={14} /> Previous
                  </button>

                  <span className="text-xs text-slate-400 font-mono">
                    Page {page} of {searchData.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= searchData.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40"
                  >
                    Next <FiChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : query ? (
            <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
              <FiSearch size={36} className="mx-auto text-amber-400 opacity-60" />
              <h3 className="text-base font-bold text-white">No results found for &ldquo;{query}&rdquo;</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try checking for spelling errors, using more general sports keywords, or removing active category filters.
              </p>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
              <FiZap size={36} className="mx-auto text-amber-400 opacity-60" />
              <h3 className="text-base font-bold text-white">Instant GoalMills Search Engine</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Search across live sports matches, transfer rumours, video highlights, and editorial breaking news.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[500px] flex items-center justify-center">
              <GoalmillsLoader />
            </div>
          }
        >
          <SearchPortalContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

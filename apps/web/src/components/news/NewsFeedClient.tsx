'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { BlogPost, Category } from '@goalmills/types';
import {
  NEWS_FILTER_TABS,
  POPULAR_TEAMS,
  getUserFavoriteTeams,
  setUserFavoriteTeams,
  getRecentlyViewedArticles,
} from '@/lib/newsUtils';
import {
  FiSearch,
  FiX,
  FiClock,
  FiEye,
  FiPlus,
  FiCheck,
  FiSliders,
  FiRefreshCw,
  FiStar,
  FiArrowRight,
  FiZap,
} from 'react-icons/fi';
import { GoalmillsLoader } from '../GoalmillsLoader';
import { FaFire } from 'react-icons/fa6';
import { LiveNewsFlashTicker } from './LiveNewsFlashTicker';
import { getNewsUrl } from '@/lib/slugUtils';

interface NewsFeedClientProps {
  initialNews: BlogPost[];
  initialCategories: Category[];
}

export default function NewsFeedClient({ initialNews, initialCategories }: NewsFeedClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [news, setNews] = useState<BlogPost[]>(initialNews);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('filter') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [selectedTeam, setSelectedTeam] = useState<string>(searchParams.get('team') || '');
  const [favoriteTeams, setFavoriteTeamsState] = useState<string[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFavoriteTeamsState(getUserFavoriteTeams());
  }, []);

  // Fetch news from API when filters change
  const fetchFilteredNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (activeTab === 'recent') {
        const recent = getRecentlyViewedArticles();
        const ids = recent.map((r) => r._id).join(',');
        if (ids) params.set('ids', ids);
      } else if (activeTab === 'favorites') {
        if (selectedTeam) {
          params.set('team', selectedTeam);
        } else if (favoriteTeams.length > 0) {
          params.set('team', favoriteTeams[0]);
        }
      } else if (activeTab !== 'all') {
        params.set('filter', activeTab);
      }

      if (selectedCategory !== 'All' && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/news?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching filtered news:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, searchQuery, selectedTeam, favoriteTeams]);

  useEffect(() => {
    if (
      activeTab !== 'all' ||
      selectedCategory !== 'All' ||
      searchQuery !== '' ||
      selectedTeam !== ''
    ) {
      fetchFilteredNews();
    }
  }, [activeTab, selectedCategory, searchQuery, selectedTeam, fetchFilteredNews]);

  const handleToggleFavoriteTeam = (team: string) => {
    let updated: string[];
    if (favoriteTeams.includes(team)) {
      updated = favoriteTeams.filter((t) => t !== team);
    } else {
      updated = [...favoriteTeams, team];
    }
    setFavoriteTeamsState(updated);
    setUserFavoriteTeams(updated);
  };

  // Hero Featured / Spotlight Article
  const featuredArticle = useMemo(() => {
    return news.find((n) => n.isFeatured || n.isBreaking) || news[0];
  }, [news]);

  const remainingNews = useMemo(() => {
    if (!featuredArticle) return news;
    return news.filter((n) => n._id !== featuredArticle._id);
  }, [news, featuredArticle]);

  return (
    <div className="space-y-8">
      {/* ─── LIVE NEWS FLASH TICKER ─── */}
      <LiveNewsFlashTicker badgeText="GLOBAL WIRE" />

      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-500/20 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Sports</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
              Pulse
            </span>
            <span>& News</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Breaking updates, tactical deep dives, transfers and team stories across world sports
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search all sports news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B172B] border border-blue-500/30 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Controls Bar */}
      <div className="space-y-4">
        {/* Main Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {NEWS_FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'favorites' && favoriteTeams.length > 0 && !selectedTeam) {
                    setSelectedTeam(favoriteTeams[0]);
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400 shadow-lg shadow-blue-600/30 scale-[1.02]'
                    : 'bg-[#0B172B]/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Favorite Teams Selector Bar (Visible when on 'favorites' tab) */}
        {activeTab === 'favorites' && (
          <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-[#09162C]/90 border border-blue-500/25 animate-in fade-in shadow-xl">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <FiStar /> My Teams:
            </span>
            {favoriteTeams.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTeam(t)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedTeam === t
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                    : 'bg-[#0E1F38] text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-xs font-bold text-blue-300 border border-blue-500/30 transition-colors"
            >
              <FiPlus size={12} />
              <span>Customize Teams</span>
            </button>
          </div>
        )}

        {/* Dynamic Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#0B172B]/70 text-slate-300 hover:text-white border border-blue-500/15'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSel = selectedCategory === cat.name || selectedCategory === cat.slug;
            return (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(isSel ? 'All' : cat.slug || cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black border border-blue-400'
                    : 'bg-[#0B172B]/70 text-slate-300 hover:text-white border border-blue-500/15'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customize Favorite Teams Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-blue-500/30 bg-[#0B172B] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <FiStar className="text-amber-400" />
                <span>Select Your Favorite Teams</span>
              </h3>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Pick the clubs and franchises you follow to get a personalized news stream:
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {POPULAR_TEAMS.map((t) => {
                const isSelected = favoriteTeams.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => handleToggleFavoriteTeam(t)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-blue-500/15 bg-[#070E1A] text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{t}</span>
                    {isSelected && <FiCheck size={14} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  setIsTeamModalOpen(false);
                  fetchFilteredNews();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-[#0A1424]/60 border border-blue-500/20">
          <GoalmillsLoader
            size="md"
            label="News Pulse"
            sublabel="Fetching latest sports stories & transfer news..."
          />
        </div>
      ) : news.length === 0 ? (
        <div className="rounded-3xl border border-blue-500/20 bg-[#0A1424]/80 py-16 text-center text-slate-400 space-y-3 backdrop-blur-md shadow-xl">
          <p className="text-lg font-black text-white">No News Stories Found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try choosing another filter tab or resetting your search terms.
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Spotlight Hero Article (on default views) */}
          {featuredArticle && activeTab === 'all' && selectedCategory === 'All' && !searchQuery && (
            <Link
              href={getNewsUrl(featuredArticle)}
              className="group relative block rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#08142A] via-[#0B1E3E] to-[#060D18] overflow-hidden shadow-2xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-blue-900/30"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="relative aspect-[16/9] lg:aspect-auto lg:col-span-7 h-64 sm:h-80 lg:h-[420px] overflow-hidden">
                  <Image
                    src={
                      featuredArticle.image ||
                      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200'
                    }
                    alt={featuredArticle.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08142A] via-transparent to-transparent lg:hidden" />
                </div>

                <div className="p-6 sm:p-8 lg:p-10 lg:col-span-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {featuredArticle.isBreaking ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse">
                          <FaFire /> Breaking
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm">
                          {featuredArticle.category || 'Featured'}
                        </span>
                      )}
                      <span className="text-xs text-slate-300 font-medium">
                        ⏱️ {featuredArticle.readTime || 3} min read
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 sm:line-clamp-4 leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-white">
                      By {featuredArticle.author || 'GoalMills Desk'}
                    </span>
                    <span>
                      {featuredArticle.createdAt
                        ? new Date(featuredArticle.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'all' && selectedCategory === 'All' && !searchQuery
              ? remainingNews
              : news
            ).map((item) => (
              <Link
                key={item._id.toString()}
                href={getNewsUrl(item)}
                className="group flex flex-col justify-between rounded-2xl border border-blue-500/15 bg-[#0B172B]/80 hover:bg-[#0E203C] overflow-hidden transition-all duration-300 hover:border-amber-400/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    <Image
                      src={item.image || `https://picsum.photos/seed/${item._id}/800/600`}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {item.isBreaking && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                          Breaking
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                        {item.category || 'News'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : ''}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <FiClock size={11} className="text-amber-400" /> {item.readTime || 3} min
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[140px] font-semibold text-slate-200">
                    {item.author || 'GoalMills Staff'}
                  </span>
                  {typeof item.views === 'number' && (
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <FiEye size={12} className="text-blue-400" /> {item.views.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

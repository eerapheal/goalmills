'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '../Toast';
import type { UserRole } from '@goalmills/types';
import { hasPermission, canEditArticle } from '@/lib/rbac';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiX,
  FiChevronRight,
} from 'react-icons/fi';

interface NewsArticle {
  _id: string;
  title: string;
  author: string;
  authorId?: string;
  createdAt: string;
  category: string;
  status?: 'draft' | 'pending_approval' | 'published' | 'rejected' | 'archived';
}

const STATUS_TABS = [
  { value: 'all', label: 'All Articles' },
  { value: 'published', label: 'Published' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'draft', label: 'Drafts' },
  { value: 'rejected', label: 'Needs Revision' },
];

export default function NewsList() {
  const toast = useToast();
  const { data: session } = useSession();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const userRole = (session?.user?.role as UserRole) || undefined;
  const canApprove = hasPermission(userRole, 'articles:approve');
  const canDeleteAny = hasPermission(userRole, 'articles:delete');

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/news?admin=true');
      if (res.ok) {
        const data = await res.json();
        setNews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Distinct categories from existing articles
  const categories = useMemo(() => {
    const set = new Set<string>();
    news.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set).sort();
  }, [news]);

  // Counts by status
  const counts = useMemo(() => {
    return {
      all: news.length,
      published: news.filter((n) => (n.status || 'published') === 'published').length,
      pending_approval: news.filter((n) => n.status === 'pending_approval').length,
      draft: news.filter((n) => n.status === 'draft').length,
      rejected: news.filter((n) => n.status === 'rejected').length,
    };
  }, [news]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return news.filter((item) => {
      // Status filter
      if (statusFilter !== 'all') {
        const itemStatus = item.status || 'published';
        if (itemStatus !== statusFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Search term
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(term);
        const matchesAuthor = item.author?.toLowerCase().includes(term);
        const matchesCat = item.category?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesAuthor && !matchesCat) return false;
      }

      return true;
    });
  }, [news, statusFilter, categoryFilter, search]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      if (res.ok) {
        setNews(news.map((n) => (n._id === id ? { ...n, status: 'published' } : n)));
        toast.success('Article approved and published live!');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error approving article');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNews(news.filter((n) => n._id !== id));
        toast.success('Article deleted successfully');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error deleting article');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>📰</span>
            <span>Sports News Editorial Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-sport coverage, status management, and editorial pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchNews()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/publishing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold border border-purple-500/20 text-xs transition-colors"
          >
            <span>Publishing Queue</span>
            <FiChevronRight size={13} />
          </Link>
          <Link
            href="/admin/news/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all"
          >
            <FiPlus size={14} />
            <span>New Article</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title, author or category..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all" className="bg-slate-900 text-white">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-white">
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count = counts[tab.value as keyof typeof counts] ?? 0;
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Articles List / Loader */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <GoalmillsLoader label="Loading News Articles" sublabel="Fetching editorial database records..." />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-12 text-center text-slate-500 space-y-3">
          <FiFileText size={36} className="mx-auto text-slate-600" />
          <p className="text-sm font-bold text-slate-400">
            {search || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No news articles match your filter criteria.'
              : 'No news articles found in the database.'}
          </p>
          {search || statusFilter !== 'all' || categoryFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30 transition-all"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              href="/admin/news/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              <FiPlus /> Compose First Article
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredArticles.map((item) => {
            const canEdit = canEditArticle(session?.user, item.authorId);
            const isAuthor = item.authorId === (session?.user as any)?.id;
            const canDelete = canDeleteAny || (isAuthor && item.status !== 'published');
            const isPending = item.status === 'pending_approval';

            return (
              <div
                key={item._id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-white font-bold break-words text-sm sm:text-base">
                      {item.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        item.status === 'pending_approval'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.status === 'draft'
                            ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            : item.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.status === 'pending_approval'
                        ? '⏳ Pending Approval'
                        : item.status === 'draft'
                          ? '📝 Draft'
                          : item.status === 'rejected'
                            ? '⚠️ Needs Revision'
                            : '✅ Published'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-semibold">
                    <span className="text-slate-300">By {item.author}</span>
                    {item.category && (
                      <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {item.category}
                      </span>
                    )}
                    <span>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPending && canApprove && (
                    <button
                      onClick={() => handleApprove(item._id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                    >
                      Approve
                    </button>
                  )}
                  <Link
                    href={canEdit ? `/admin/news/${item._id}/edit` : `#`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      canEdit
                        ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20'
                        : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={!canDelete}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      canDelete
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                        : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

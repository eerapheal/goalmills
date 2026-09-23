'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  FiSend,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiAlertCircle,
  FiSearch,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiEye,
  FiEdit,
  FiTrash2,
  FiZap,
  FiStar,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUpRight,
  FiUser,
  FiTag,
  FiMessageSquare,
  FiCornerDownLeft,
  FiShield,
} from 'react-icons/fi';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import { useToast } from '@/components/Toast';
import { hasPermission } from '@/lib/rbac';
import { UserRole } from '@goalmills/types';

interface ArticleItem {
  _id: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  authorId?: string;
  authorRole?: string;
  category: string;
  categorySlug?: string;
  sport?: string;
  sportSlug?: string;
  status: 'draft' | 'pending_approval' | 'published' | 'rejected' | 'archived';
  views?: number;
  readTime?: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PipelineMetrics {
  total: number;
  published: number;
  pending: number;
  draft: number;
  rejected: number;
  breaking: number;
  featured: number;
}

export default function PublishingDashboardPage() {
  const { data: session } = useSession();
  const toast = useToast();

  const userRole = (session?.user?.role as UserRole) || undefined;
  const canApprove = hasPermission(userRole, 'articles:approve');
  const canDeleteAny = hasPermission(userRole, 'articles:delete');

  // Pipeline Data State
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    total: 0,
    published: 0,
    pending: 0,
    draft: 0,
    rejected: 0,
    breaking: 0,
    featured: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters & Pagination State
  const [activeTab, setActiveTab] = useState<
    'pending_approval' | 'draft' | 'published' | 'rejected' | 'all'
  >('pending_approval');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Batch Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals State
  const [previewArticle, setPreviewArticle] = useState<ArticleItem | null>(null);
  const [rejectModalArticle, setRejectModalArticle] = useState<ArticleItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isBatchRejectOpen, setIsBatchRejectOpen] = useState(false);
  const [batchRejectReason, setBatchRejectReason] = useState('');

  // Fetch Pipeline Data from Database
  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: activeTab,
        sport: selectedSport,
        sort: selectedSort,
        page: page.toString(),
        limit: pageSize.toString(),
      });
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/news/pipeline?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.items || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      } else {
        toast.error(data.message || 'Failed to load publishing queue');
      }
    } catch (err: any) {
      console.error('Error fetching pipeline:', err);
      toast.error('Network error loading publishing pipeline');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedSport, selectedSort, page, pageSize, searchQuery, toast]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  // Reset pagination on tab/filter change
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds([]);
  };

  // Selection toggles
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // WORKFLOW ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  // Approve & Publish Single Article
  const handleApprove = async (id: string) => {
    setActionLoading(`approve-${id}`);
    try {
      const res = await fetch('/api/news/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Article approved and published live!');
        if (previewArticle?._id === id) {
          setPreviewArticle(null);
        }
        await fetchPipeline();
      } else {
        toast.error(data.message || 'Approval failed');
      }
    } catch (err) {
      toast.error('Network error approving article');
    } finally {
      setActionLoading(null);
    }
  };

  // Request Revision / Reject Single Article
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalArticle) return;
    const id = rejectModalArticle._id;
    setActionLoading(`reject-${id}`);

    try {
      const res = await fetch('/api/news/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          id,
          reason: rejectReason.trim() || 'Editorial revision requested.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Article sent back for revision!');
        setRejectModalArticle(null);
        setRejectReason('');
        if (previewArticle?._id === id) {
          setPreviewArticle(null);
        }
        await fetchPipeline();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Network error rejecting article');
    } finally {
      setActionLoading(null);
    }
  };

  // Submit Draft to Review Queue (Author action)
  const handleSubmitForReview = async (id: string) => {
    setActionLoading(`submit-${id}`);
    try {
      const res = await fetch('/api/news/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_for_review', id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Article submitted for editorial review!');
        await fetchPipeline();
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch (err) {
      toast.error('Network error submitting article');
    } finally {
      setActionLoading(null);
    }
  };

  // Unpublish / Move to Draft
  const handleUnpublish = async (id: string) => {
    if (!confirm('Unpublish this article? It will be taken down from public view.')) return;
    setActionLoading(`unpublish-${id}`);
    try {
      const res = await fetch('/api/news/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish', id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Article unpublished and moved to drafts.');
        await fetchPipeline();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Network error unpublishing');
    } finally {
      setActionLoading(null);
    }
  };

  // Quick Toggle Flags
  const handleToggleFlag = async (id: string, flag: 'breaking' | 'featured') => {
    try {
      const res = await fetch('/api/news/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: flag === 'breaking' ? 'toggle_breaking' : 'toggle_featured',
          id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setItems((prev) =>
          prev.map((item) =>
            item._id === id
              ? {
                  ...item,
                  [flag === 'breaking' ? 'isBreaking' : 'isFeatured']:
                    data[flag === 'breaking' ? 'isBreaking' : 'isFeatured'],
                }
              : item
          )
        );
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Error toggling flag');
    }
  };

  // Delete Article
  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this article from the database? This cannot be undone.'))
      return;
    setActionLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success('Article deleted successfully');
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        await fetchPipeline();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (err) {
      toast.error('Network error deleting article');
    } finally {
      setActionLoading(null);
    }
  };

  // Batch Approve
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Approve and publish ${selectedIds.length} selected articles immediately?`))
      return;
    setActionLoading('batch');
    try {
      const res = await fetch('/api/news/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_approve', ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Articles approved!');
        setSelectedIds([]);
        await fetchPipeline();
      } else {
        toast.error(data.message || 'Batch approval failed');
      }
    } catch (err) {
      toast.error('Error processing batch approval');
    } finally {
      setActionLoading(null);
    }
  };

  // Batch Reject
  const handleBatchRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    setActionLoading('batch');
    try {
      const res = await fetch('/api/news/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch_reject',
          ids: selectedIds,
          reason: batchRejectReason.trim() || 'Revision requested in batch editorial review.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Articles marked for revision');
        setIsBatchRejectOpen(false);
        setBatchRejectReason('');
        setSelectedIds([]);
        await fetchPipeline();
      } else {
        toast.error(data.message || 'Batch revision failed');
      }
    } catch (err) {
      toast.error('Error processing batch revision');
    } finally {
      setActionLoading(null);
    }
  };

  // Batch Delete
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.length} articles from the database?`)) return;
    setActionLoading('batch');
    try {
      const res = await fetch('/api/news/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_delete', ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Articles deleted');
        setSelectedIds([]);
        await fetchPipeline();
      } else {
        toast.error(data.message || 'Batch delete failed');
      }
    } catch (err) {
      toast.error('Error processing batch delete');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <FiSend className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Publishing & Editorial Pipeline
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Live DB
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Review submitted stories, enforce editorial quality, and approve breaking news for
                production.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchPipeline()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-slate-300 hover:text-white hover:border-white/20 transition disabled:opacity-50"
            title="Refresh Pipeline from DB"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/news/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 font-bold text-white shadow-lg shadow-purple-500/20 text-xs sm:text-sm transition-all"
          >
            <FiFileText className="w-4 h-4" />
            <span>Draft New Story</span>
          </Link>
        </div>
      </div>

      {/* ─── LIVE METRICS CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Pending Review */}
        <div
          onClick={() => handleTabChange('pending_approval')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'pending_approval'
              ? 'bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-[#141C2B] border-white/10 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <FiClock className="w-4 h-4" />
            </span>
            {metrics.pending > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-black text-white mt-2">{metrics.pending}</div>
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mt-0.5">
            Pending Review
          </div>
        </div>

        {/* Drafts */}
        <div
          onClick={() => handleTabChange('draft')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'draft'
              ? 'bg-slate-500/15 border-slate-500/40 shadow-lg shadow-slate-500/10'
              : 'bg-[#141C2B] border-white/10 hover:border-slate-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-slate-500/20 text-slate-300">
              <FiFileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-2">{metrics.draft}</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Writers Drafts
          </div>
        </div>

        {/* Published Live */}
        <div
          onClick={() => handleTabChange('published')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'published'
              ? 'bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-[#141C2B] border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <FiCheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-2">{metrics.published}</div>
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
            Published Live
          </div>
        </div>

        {/* Revision Requested */}
        <div
          onClick={() => handleTabChange('rejected')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-rose-500/15 border-rose-500/40 shadow-lg shadow-rose-500/10'
              : 'bg-[#141C2B] border-white/10 hover:border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <FiAlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-2">{metrics.rejected}</div>
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mt-0.5">
            Needs Revision
          </div>
        </div>

        {/* Breaking News */}
        <div className="p-4 rounded-2xl bg-[#141C2B] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <FiZap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-2">{metrics.breaking}</div>
          <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider mt-0.5">
            Breaking Alerts
          </div>
        </div>

        {/* Total Database Articles */}
        <div
          onClick={() => handleTabChange('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-500/15 border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'bg-[#141C2B] border-white/10 hover:border-blue-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <FiShield className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-2">{metrics.total}</div>
          <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mt-0.5">
            Total Articles
          </div>
        </div>
      </div>

      {/* ─── PIPELINE TABS & SEARCH CONTROLS ─────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[#141C2B] border border-white/10 space-y-4">
        {/* Stage Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
          <button
            onClick={() => handleTabChange('pending_approval')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'pending_approval'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <FiClock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'pending_approval'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {metrics.pending}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('draft')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'draft'
                ? 'bg-slate-200 text-slate-950 shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <FiFileText className="w-3.5 h-3.5" />
            <span>Drafts</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'draft'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {metrics.draft}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('published')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'published'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            <span>Published Live</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'published'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {metrics.published}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('rejected')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'rejected'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <FiAlertCircle className="w-3.5 h-3.5" />
            <span>Needs Revision</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {metrics.rejected}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <span>All Articles</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {metrics.total}
            </span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search title, author, tag..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Sport Selector */}
          <div>
            <select
              value={selectedSport}
              onChange={(e) => {
                setSelectedSport(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="all">All Sports</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="cricket">Cricket</option>
              <option value="tennis">Tennis</option>
              <option value="athletics">Athletics</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="latest">Sort: Latest Created</option>
              <option value="updated">Sort: Recently Updated</option>
              <option value="popular">Sort: Most Viewed</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>

          {/* Page Size */}
          <div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="10">10 per page</option>
              <option value="15">15 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* ─── BATCH OPERATIONS BAR ─────────────────────────────────────────── */}
        {selectedIds.length > 0 && canApprove && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>{selectedIds.length} article(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchApprove}
                disabled={Boolean(actionLoading)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                <FiCheck className="w-3.5 h-3.5" />
                <span>Approve Selected</span>
              </button>
              <button
                onClick={() => setIsBatchRejectOpen(true)}
                disabled={Boolean(actionLoading)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                <FiMessageSquare className="w-3.5 h-3.5" />
                <span>Request Revision</span>
              </button>
              {canDeleteAny && (
                <button
                  onClick={handleBatchDelete}
                  disabled={Boolean(actionLoading)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white border border-red-500/30 text-xs font-bold transition disabled:opacity-50"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-bold transition"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── QUEUE LIST CONTENT ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <GoalmillsLoader size="lg" label="Querying Editorial Pipeline" />
          <p className="text-xs text-slate-400">Synchronizing database workflow status...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl border border-white/10 bg-[#141C2B] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Queue is clear!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'pending_approval'
              ? 'There are currently no submissions awaiting review or approval.'
              : `No articles found matching stage "${activeTab}" and current search filters.`}
          </p>
          <div className="pt-2">
            <Link
              href="/admin/news/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
            >
              <FiFileText /> Create an Article
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Controls */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-bold">
            <div className="flex items-center gap-3">
              {canApprove && (
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedIds.length === items.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-white/20 focus:ring-0 cursor-pointer"
                  />
                  <span>Select All</span>
                </label>
              )}
              <span>
                Showing {items.length} of {totalCount} articles
              </span>
            </div>
            <div>
              Stage:{' '}
              <span className="text-white uppercase font-black">{activeTab.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Article List Cards */}
          <div className="space-y-2.5">
            {items.map((article) => {
              const isSelected = selectedIds.includes(article._id);
              const isPending = article.status === 'pending_approval';
              const isDraft = article.status === 'draft';
              const isPublished = article.status === 'published';
              const isRejected = article.status === 'rejected';

              return (
                <div
                  key={article._id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500/40 shadow-md shadow-purple-500/10'
                      : isPending
                        ? 'bg-[#151d2e] border-amber-500/20 hover:border-amber-500/40'
                        : isRejected
                          ? 'bg-[#1a1622] border-rose-500/20 hover:border-rose-500/40'
                          : 'bg-[#141C2B] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Details */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {canApprove && (
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(article._id)}
                            className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-white/20 focus:ring-0 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-800 border border-white/10 flex-shrink-0 overflow-hidden relative">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                            📰 No Cover
                          </div>
                        )}
                        {article.isBreaking && (
                          <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black uppercase px-1 rounded">
                            Breaking
                          </span>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className="text-white font-bold text-sm sm:text-base line-clamp-1 break-all hover:text-purple-400 transition cursor-pointer"
                            onClick={() => setPreviewArticle(article)}
                          >
                            {article.title}
                          </h3>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : isDraft
                                  ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                  : isPublished
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isPending
                              ? '⏳ Pending Review'
                              : isDraft
                                ? '📝 Writer Draft'
                                : isPublished
                                  ? '✅ Published'
                                  : '⚠️ Revision Requested'}
                          </span>

                          {article.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px] font-bold flex items-center gap-1">
                              <FiStar className="w-2.5 h-2.5 text-amber-400" /> Featured
                            </span>
                          )}
                        </div>

                        {/* Excerpt */}
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {article.excerpt || 'No excerpt provided.'}
                        </p>

                        {/* Meta Tags & Author */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300 flex items-center gap-1">
                            <FiUser className="w-3 h-3 text-purple-400" />
                            {article.author || 'Staff'}
                          </span>
                          <span>•</span>
                          <span className="text-blue-400 font-semibold">
                            {article.category || 'General'}
                          </span>
                          {article.sport && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold capitalize">
                                {article.sport}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            {new Date(article.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {article.views !== undefined && article.views > 0 && (
                            <>
                              <span>•</span>
                              <span>{article.views.toLocaleString()} views</span>
                            </>
                          )}
                        </div>

                        {/* Rejection / Revision Note Alert */}
                        {isRejected && article.rejectionReason && (
                          <div className="mt-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-1.5">
                            <FiAlertCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-bold">Editorial Feedback: </span>
                              <span>{article.rejectionReason}</span>
                              {article.reviewedBy && (
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  — Reviewed by {article.reviewedBy}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5 justify-end">
                      {/* Preview Button */}
                      <button
                        onClick={() => setPreviewArticle(article)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-1.5"
                        title="Preview Article formatted view"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      {/* Quick Edit */}
                      <Link
                        href={`/admin/news/${article._id}/edit`}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <FiEdit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      {/* APPROVAL WORKFLOW ACTIONS FOR EDITOR / SUPER ADMIN */}
                      {canApprove && (isPending || isDraft || isRejected) && (
                        <button
                          onClick={() => handleApprove(article._id)}
                          disabled={actionLoading === `approve-${article._id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>
                            {actionLoading === `approve-${article._id}`
                              ? 'Publishing...'
                              : 'Approve & Publish'}
                          </span>
                        </button>
                      )}

                      {canApprove && isPending && (
                        <button
                          onClick={() => setRejectModalArticle(article)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <FiMessageSquare className="w-3.5 h-3.5" />
                          <span>Request Revision</span>
                        </button>
                      )}

                      {/* Author action to submit draft */}
                      {!canApprove && (isDraft || isRejected) && (
                        <button
                          onClick={() => handleSubmitForReview(article._id)}
                          disabled={actionLoading === `submit-${article._id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <FiSend className="w-3.5 h-3.5" />
                          <span>
                            {actionLoading === `submit-${article._id}`
                              ? 'Submitting...'
                              : 'Submit for Review'}
                          </span>
                        </button>
                      )}

                      {/* Published: Unpublish Action */}
                      {canApprove && isPublished && (
                        <button
                          onClick={() => handleUnpublish(article._id)}
                          disabled={actionLoading === `unpublish-${article._id}`}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                          title="Take down to draft"
                        >
                          <FiCornerDownLeft className="w-3.5 h-3.5" />
                          <span>Unpublish</span>
                        </button>
                      )}

                      {/* Delete */}
                      {(canDeleteAny ||
                        (isDraft && article.authorId === (session?.user as any)?.id)) && (
                        <button
                          onClick={() => handleDelete(article._id)}
                          disabled={actionLoading === `delete-${article._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete article"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── PAGINATION ────────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
              <div>
                Page <span className="font-bold text-white">{page}</span> of{' '}
                <span className="font-bold text-white">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  <FiChevronLeft /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ARTICLE PREVIEW MODAL ─────────────────────────────────────────── */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f172a] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <FiEye className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm">Editorial Article Preview</h3>
                  <p className="text-[11px] text-slate-400">
                    Review content and SEO metrics before approving publication
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewArticle(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Cover Image */}
              {previewArticle.image && (
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10 relative">
                  <img
                    src={previewArticle.image}
                    alt={previewArticle.title}
                    className="w-full h-full object-cover"
                  />
                  {previewArticle.isBreaking && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs uppercase px-2.5 py-1 rounded-md shadow-lg">
                      ⚡ BREAKING NEWS
                    </span>
                  )}
                </div>
              )}

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                    {previewArticle.category || 'General'}
                  </span>
                  {previewArticle.sport && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 capitalize">
                      {previewArticle.sport}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    By <strong className="text-white">{previewArticle.author}</strong> •{' '}
                    {new Date(previewArticle.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {previewArticle.title}
                </h1>
                <p className="text-sm text-slate-300 italic border-l-2 border-purple-500 pl-3 py-0.5">
                  {previewArticle.excerpt}
                </p>
              </div>

              {/* Article HTML Content */}
              <div className="border-t border-white/10 pt-4">
                <div
                  className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: previewArticle.content }}
                />
              </div>

              {/* Tags */}
              {previewArticle.tags && previewArticle.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-400 flex items-center gap-1 mr-2">
                    <FiTag /> Tags:
                  </span>
                  {previewArticle.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[11px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/news/${previewArticle._id}/edit`}
                  className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-bold text-xs transition"
                >
                  Open in Full Editor
                </Link>
              </div>

              <div className="flex items-center gap-2">
                {canApprove && previewArticle.status !== 'published' && (
                  <>
                    <button
                      onClick={() => {
                        setRejectModalArticle(previewArticle);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs transition"
                    >
                      Request Revision
                    </button>
                    <button
                      onClick={() => handleApprove(previewArticle._id)}
                      disabled={actionLoading === `approve-${previewArticle._id}`}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/30 transition flex items-center gap-1.5"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>Approve & Publish Live</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPreviewArticle(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── REQUEST REVISION MODAL (SINGLE) ─────────────────────────────────── */}
      {rejectModalArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f172a] border border-white/15 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FiMessageSquare className="text-rose-400" />
                <span>Request Revision</span>
              </h3>
              <button
                onClick={() => setRejectModalArticle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provide feedback for{' '}
              <strong className="text-white">{rejectModalArticle.author}</strong> on why this story
              requires revisions before approval.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Editorial Revision Notes *
                </label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  placeholder="e.g. Please verify transfer fee numbers and fix typo in manager quote..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalArticle(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(actionLoading)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition disabled:opacity-50"
                >
                  Send Revision Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REQUEST REVISION MODAL (BATCH) ─────────────────────────────────── */}
      {isBatchRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f172a] border border-white/15 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FiMessageSquare className="text-rose-400" />
                <span>Batch Request Revision</span>
              </h3>
              <button
                onClick={() => setIsBatchRejectOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Apply revision request to all{' '}
              <strong className="text-white">{selectedIds.length}</strong> selected articles.
            </p>

            <form onSubmit={handleBatchRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Batch Editorial Feedback *
                </label>
                <textarea
                  rows={4}
                  value={batchRejectReason}
                  onChange={(e) => setBatchRejectReason(e.target.value)}
                  required
                  placeholder="e.g. Please format player names and verify citations..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchRejectOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(actionLoading)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition disabled:opacity-50"
                >
                  Send Revisions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

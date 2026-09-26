'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiExternalLink,
  FiImage,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiRotateCw,
} from 'react-icons/fi';
import {
  FaTwitter,
  FaTelegramPlane,
  FaWhatsapp,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
} from 'react-icons/fa';

interface PostRecord {
  _id: string;
  platform: string;
  postType: string;
  leagueName?: string;
  homeTeam?: string;
  awayTeam?: string;
  content: string;
  imageUrl?: string;
  platformPostId?: string;
  platformPostUrl?: string;
  status: string;
  error?: string;
  retryCount?: number;
  createdAt: string;
}

export default function SocialHistoryPage() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // Filters
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadPosts(pageNum = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '15',
        platform: selectedPlatform,
        status: selectedStatus,
        postType: selectedType,
        search: searchQuery,
      });

      const res = await fetch(`/api/social/posts?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPosts(data.posts);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalPosts(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts(1);
  }, [selectedPlatform, selectedStatus, selectedType]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadPosts(1);
  }

  async function handleRetry(postId: string) {
    setRetryingId(postId);
    setFeedback(null);
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Post retry dispatched successfully!');
        loadPosts(page);
      } else {
        setFeedback(data.error || 'Retry failed');
      }
    } catch (err: any) {
      setFeedback(err.message || 'Retry request failed');
    } finally {
      setRetryingId(null);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <FaTwitter className="text-sky-400" />;
      case 'telegram':
        return <FaTelegramPlane className="text-blue-400" />;
      case 'whatsapp':
        return <FaWhatsapp className="text-emerald-400" />;
      case 'facebook':
        return <FaFacebookF className="text-blue-500" />;
      case 'linkedin':
        return <FaLinkedinIn className="text-sky-500" />;
      case 'youtube':
        return <FaYoutube className="text-red-500" />;
      case 'tiktok':
        return <FaTiktok className="text-rose-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 min-h-screen">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Link
            href="/social"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-2 transition"
          >
            <FiArrowLeft /> Back to Social Dashboard
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Social Post History &amp; Audit Log
          </h1>
          <p className="text-sm text-slate-400">
            Total {totalPosts} posts logged across all 7 channels with image previews and retry controls
          </p>
        </div>

        <button
          onClick={() => loadPosts(page)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/60 text-emerald-200 text-sm flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search content, teams, league..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Platforms</option>
              <option value="twitter">X / Twitter</option>
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="posted">Posted</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Content Types</option>
              <option value="weekly_fixtures">Weekly Fixtures</option>
              <option value="pre_match">Pre-Match 48h</option>
              <option value="ht_scorecard">Halftime Scorecard</option>
              <option value="ft_scorecard">Fulltime Scorecard</option>
              <option value="post_match">Post-Match Report</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Post Type</th>
                <th className="py-3 px-4">Headline / Match</th>
                <th className="py-3 px-4">Content Excerpt</th>
                <th className="py-3 px-4">Graphic</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No posts found matching the active filters.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                      <br />
                      <span className="text-[10px] text-slate-500">
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200 capitalize">
                        {getPlatformIcon(post.platform)}
                        <span>{post.platform}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-semibold text-[11px]">
                        {post.postType.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-semibold max-w-[180px] truncate">
                      {post.homeTeam && post.awayTeam
                        ? `${post.homeTeam} vs ${post.awayTeam}`
                        : post.leagueName || 'GoalMills'}
                    </td>

                    <td className="py-3 px-4 text-slate-400 max-w-[240px] truncate">
                      {post.content}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {post.imageUrl ? (
                        <button
                          onClick={() => setSelectedImage(post.imageUrl!)}
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                          <FiImage /> View
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          post.status === 'posted'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : post.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {post.status.toUpperCase()}
                      </span>
                      {post.error && (
                        <p className="text-[10px] text-rose-400 line-clamp-1 max-w-[120px] mt-0.5" title={post.error}>
                          {post.error}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => copyToClipboard(post.content, post._id)}
                        className="text-slate-400 hover:text-white transition"
                        title="Copy Caption"
                      >
                        {copiedId === post._id ? <FiCheck className="text-emerald-400 inline" /> : <FiCopy className="inline" />}
                      </button>

                      {post.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(post._id)}
                          disabled={retryingId === post._id}
                          className="text-amber-400 hover:text-amber-300 font-semibold transition"
                          title="Retry Post"
                        >
                          <FiRotateCw className={`inline ${retryingId === post._id ? 'animate-spin' : ''}`} />
                        </button>
                      )}

                      {post.platformPostUrl && (
                        <a
                          href={post.platformPostUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 transition"
                          title="Open Post on Platform"
                        >
                          <FiExternalLink className="inline" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/30">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => loadPosts(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition font-semibold"
            >
              Previous
            </button>
            <button
              onClick={() => loadPosts(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
              <span className="text-xs font-bold text-slate-300">Generated Graphic Preview</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <img src={selectedImage} alt="Expanded Graphic" className="w-full h-auto object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiShare2,
  FiSend,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiActivity,
  FiRefreshCw,
  FiPlay,
  FiSettings,
  FiExternalLink,
  FiImage,
  FiZap,
  FiSliders,
  FiCopy,
  FiCheck,
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

interface SocialStats {
  totalPosts: number;
  postsToday: number;
  postsThisWeek: number;
  successRate: number;
  activePlatforms: number;
  totalPlatforms: number;
  platformHealth: Record<string, string>;
  postsByPlatform: Record<string, number>;
  postsByType: Record<string, number>;
}

interface PlatformItem {
  platform: string;
  displayName: string;
  isConfigured: boolean;
  enabled: boolean;
  healthStatus: string;
}

interface RecentPost {
  _id: string;
  platform: string;
  postType: string;
  leagueName?: string;
  homeTeam?: string;
  awayTeam?: string;
  content: string;
  imageUrl?: string;
  platformPostUrl?: string;
  status: string;
  createdAt: string;
}

export default function SocialAutomationDashboard() {
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState<string | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadDashboardData() {
    try {
      const [statsRes, platformsRes, postsRes] = await Promise.all([
        fetch('/api/social/stats'),
        fetch('/api/social/platforms'),
        fetch('/api/social/posts?limit=8'),
      ]);

      const [statsData, platformsData, postsData] = await Promise.all([
        statsRes.json(),
        platformsRes.json(),
        postsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (platformsData.success) setPlatforms(platformsData.platforms);
      if (postsData.success) setRecentPosts(postsData.posts);
    } catch (err) {
      console.error('Failed to load social automation data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function handleTriggerWorkflow(workflow: string) {
    setTriggeringWorkflow(workflow);
    setFeedback(null);
    try {
      const res = await fetch('/api/social/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Workflow '${workflow}' triggered successfully!`,
        });
        loadDashboardData();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || `Failed to trigger workflow '${workflow}'`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Trigger request failed' });
    } finally {
      setTriggeringWorkflow(null);
    }
  }

  async function handleTestPlatform(platformName: string) {
    setTestingPlatform(platformName);
    setFeedback(null);
    try {
      const res = await fetch('/api/social/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformName, testConnection: true }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Connection to ${platformName} verified successfully!`,
        });
        loadDashboardData();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || `Connection test failed for ${platformName}`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Test failed' });
    } finally {
      setTestingPlatform(null);
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
        return <FiShare2 className="text-slate-400" />;
    }
  };

  const formatPostType = (type: string) => {
    switch (type) {
      case 'weekly_fixtures':
        return 'Weekly Fixtures';
      case 'pre_match':
        return 'Pre-Match 48h';
      case 'ht_scorecard':
        return 'HT Scorecard';
      case 'ft_scorecard':
        return 'FT Scorecard';
      case 'post_match':
        return 'Post-Match Report';
      default:
        return type;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <FiZap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Social Media Automation Engine
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 animate-pulse">
                  LIVE
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Automated matchday graphics, AI tactical journalism, and multi-channel publishing for Top 5 leagues
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/social/platforms"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
          >
            <FiSettings className="w-4 h-4" />
            Platforms Config
          </Link>
          <Link
            href="/social/history"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-lg shadow-emerald-600/20"
          >
            <FiClock className="w-4 h-4" />
            Post History
          </Link>
        </div>
      </div>

      {/* Live Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <FiAlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Published</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {stats?.totalPosts ?? 0}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <FiSend className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">+{stats?.postsToday ?? 0}</span> today across all platforms
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posts This Week</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {stats?.postsThisWeek ?? 0}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FiActivity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Top 5 European Leagues
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Success Rate</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-1">
                {stats?.successRate ?? 100}%
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Automated retry on rate limit
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Platforms</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {stats?.activePlatforms ?? 0} / {stats?.totalPlatforms ?? 7}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <FiShare2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            X, Telegram, WhatsApp &amp; more
          </p>
        </div>
      </div>

      {/* Manual Workflow Trigger Action Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FiSliders className="text-emerald-400" />
              Instant Workflow Dispatcher
            </h2>
            <p className="text-xs text-slate-400">
              Trigger any automated workflow on-demand without waiting for the cron timer
            </p>
          </div>
          <Link
            href="/social/scheduler"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            View Full Schedule &amp; Crons →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => handleTriggerWorkflow('weekly-fixtures')}
            disabled={triggeringWorkflow !== null}
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition flex items-center justify-between group disabled:opacity-50"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                Weekly Fixtures
              </p>
              <p className="text-[11px] text-slate-400">Top 5 Leagues graphics</p>
            </div>
            <FiPlay className={`w-4 h-4 text-slate-400 group-hover:text-emerald-400 ${triggeringWorkflow === 'weekly-fixtures' ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleTriggerWorkflow('pre-match')}
            disabled={triggeringWorkflow !== null}
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition flex items-center justify-between group disabled:opacity-50"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                Pre-Match 48h
              </p>
              <p className="text-[11px] text-slate-400">H2H clash cards &amp; AI</p>
            </div>
            <FiPlay className={`w-4 h-4 text-slate-400 group-hover:text-emerald-400 ${triggeringWorkflow === 'pre-match' ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleTriggerWorkflow('live-poll')}
            disabled={triggeringWorkflow !== null}
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition flex items-center justify-between group disabled:opacity-50"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                Poll Live Scorecards
              </p>
              <p className="text-[11px] text-slate-400">HT &amp; FT instant trigger</p>
            </div>
            <FiPlay className={`w-4 h-4 text-slate-400 group-hover:text-emerald-400 ${triggeringWorkflow === 'live-poll' ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleTriggerWorkflow('post-match')}
            disabled={triggeringWorkflow !== null}
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition flex items-center justify-between group disabled:opacity-50"
          >
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                Post-Match Analysis
              </p>
              <p className="text-[11px] text-slate-400">MOTM &amp; tactical recap</p>
            </div>
            <FiPlay className={`w-4 h-4 text-slate-400 group-hover:text-emerald-400 ${triggeringWorkflow === 'post-match' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Platform Connection Status Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FiShare2 className="text-emerald-400" />
            Connected Social Channels (7 Platforms)
          </h2>
          <Link
            href="/social/platforms"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            Manage Credentials →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((p) => {
            const isHealthy = p.healthStatus === 'healthy';
            const isUnconfigured = p.healthStatus === 'unconfigured' || !p.isConfigured;

            return (
              <div
                key={p.platform}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 text-xl">
                      {getPlatformIcon(p.platform)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.displayName}</h4>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                          isHealthy
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isUnconfigured
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isHealthy ? 'Connected' : isUnconfigured ? 'Setup Required' : 'Degraded'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {stats?.postsByPlatform?.[p.platform] ?? 0} published
                  </span>
                  <button
                    onClick={() => handleTestPlatform(p.platform)}
                    disabled={testingPlatform === p.platform}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition disabled:opacity-50"
                  >
                    {testingPlatform === p.platform ? 'Testing...' : 'Test Ping'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Posts Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FiClock className="text-emerald-400" />
              Recent Automated Posts Stream
            </h2>
            <p className="text-xs text-slate-400">
              Live audit trail of graphics and AI content published across channels
            </p>
          </div>
          <Link
            href="/social/history"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            View Full Audit Log ({stats?.totalPosts ?? 0}) →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
            <FiShare2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No Posts Published Yet</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Hit "Run Weekly Fixtures" or "Pre-Match 48h" above to generate and publish your first automated matchday graphics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentPosts.map((post) => (
              <div
                key={post._id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-800 text-sm">
                      {getPlatformIcon(post.platform)}
                    </span>
                    <span className="text-xs font-bold text-slate-200 capitalize">
                      {post.platform}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-semibold border border-slate-700">
                      {formatPostType(post.postType)}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      post.status === 'posted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {post.status.toUpperCase()}
                  </span>
                </div>

                {post.imageUrl && (
                  <div
                    onClick={() => setSelectedImage(post.imageUrl!)}
                    className="relative w-full h-44 rounded-xl overflow-hidden cursor-pointer group bg-slate-950 border border-slate-800"
                  >
                    <img
                      src={post.imageUrl}
                      alt="Generated Graphic"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                      <FiImage className="w-4 h-4" /> Click to Expand Graphic
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  {post.homeTeam && post.awayTeam && (
                    <p className="text-xs font-bold text-slate-300">
                      ⚔️ {post.homeTeam} vs {post.awayTeam} {post.leagueName ? `(${post.leagueName})` : ''}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(post.content, post._id)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                      title="Copy Caption"
                    >
                      {copiedId === post._id ? (
                        <>
                          <FiCheck className="text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <FiCopy /> Copy
                        </>
                      )}
                    </button>
                    {post.platformPostUrl && (
                      <a
                        href={post.platformPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                      >
                        <FiExternalLink /> Post
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal Lightbox */}
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
              <span className="text-xs font-bold text-slate-300">Generated Matchday Graphic Preview</span>
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

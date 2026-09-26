'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FiShare2,
  FiSend,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiActivity,
  FiLayers,
  FiRefreshCw,
  FiShield,
  FiExternalLink,
  FiGlobe,
  FiMessageSquare,
  FiZap,
  FiPlay,
  FiCheck,
  FiX,
  FiImage,
  FiServer,
  FiCpu,
} from 'react-icons/fi';
import {
  FaTwitter,
  FaTelegram,
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaRss,
} from 'react-icons/fa';
import type {
  DistributionHubStats,
  SyndicationJob,
  DistributionChannelType,
} from '@goalmills/types';

interface SocialEngineStatusData {
  online: boolean;
  service?: string;
  uptime?: number;
  platforms?: Array<{
    name: string;
    displayName: string;
    isConfigured: boolean;
  }>;
  scheduledTasks?: Array<{
    id: string;
    name: string;
    cronExpression: string;
    enabled: boolean;
  }>;
  metrics?: {
    totalPosts: number;
    postsToday: number;
  };
  error?: string;
}

interface PlatformDetail {
  platform: string;
  displayName: string;
  isConfigured: boolean;
  enabled: boolean;
  healthStatus: 'healthy' | 'unconfigured' | 'error' | 'degraded';
  lastSuccessAt?: string;
  lastError?: string;
  enabledPostTypes?: string[];
}

export default function ContentDistributionStudio() {
  const [stats, setStats] = useState<DistributionHubStats | null>(null);
  const [jobs, setJobs] = useState<SyndicationJob[]>([]);
  const [engineStatus, setEngineStatus] = useState<SocialEngineStatusData | null>(null);
  const [platforms, setPlatforms] = useState<PlatformDetail[]>([]);
  const [engineBaseUrl, setEngineBaseUrl] = useState<string>('http://localhost:4000');
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);
  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending_approval' | 'dispatched' | 'failed'>('all');

  // Broadcast Sandbox state
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [sport, setSport] = useState('football');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<DistributionChannelType[]>([
    'x_twitter',
    'telegram',
    'facebook',
  ]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes, engineRes] = await Promise.all([
        fetch('/api/admin/distribution/stats'),
        fetch('/api/admin/distribution/jobs'),
        fetch('/api/admin/distribution/social-engine/status'),
      ]);

      const statsJson = await statsRes.json();
      const jobsJson = await jobsRes.json();
      const engineJson = await engineRes.json();

      if (statsJson.success && statsJson.stats) setStats(statsJson.stats);
      if (jobsJson.success && jobsJson.jobs) setJobs(jobsJson.jobs);

      if (engineJson.success) {
        setEngineStatus(engineJson.status);
        if (engineJson.platforms) setPlatforms(engineJson.platforms);
        if (engineJson.baseUrl) setEngineBaseUrl(engineJson.baseUrl);
      } else {
        setEngineStatus({ online: false, error: engineJson.error });
      }
    } catch (err: any) {
      console.error('Failed to load distribution and social engine data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  async function handleApprove(jobId: string) {
    try {
      const res = await fetch('/api/admin/distribution/jobs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Job approved & dispatched via Social Engine!' });
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || data.message || 'Approval failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error approving job' });
    }
  }

  async function handleRetry(jobId: string) {
    try {
      const res = await fetch('/api/admin/distribution/jobs/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Job re-dispatched to Social Engine!' });
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || data.message || 'Retry failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error retrying job' });
    }
  }

  async function handleTestPlatform(platformName: string) {
    setTestingPlatform(platformName);
    try {
      const res = await fetch('/api/admin/distribution/social-engine/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformName }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Platform ${data.displayName || platformName} is healthy & successfully verified!`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: `${platformName} test failed: ${data.error || 'Connection rejected'}`,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Test network error: ${err.message}` });
    } finally {
      setTestingPlatform(null);
    }
  }

  async function handleTriggerWorkflow(
    workflow: 'weekly-fixtures' | 'pre-match' | 'live-poll' | 'post-match'
  ) {
    setRunningWorkflow(workflow);
    setFeedback({ type: 'info', message: `Triggering ${workflow} automation...` });

    try {
      const res = await fetch('/api/admin/distribution/social-engine/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow, platforms: 'all' }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Workflow ${workflow} triggered successfully via Social Engine!`,
        });
        loadData();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || `Failed to trigger workflow ${workflow}`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Workflow error: ${err.message}` });
    } finally {
      setRunningWorkflow(null);
    }
  }

  async function handleBroadcast() {
    if (!headline.trim() || !content.trim()) {
      setFeedback({ type: 'error', message: 'Headline and content cannot be empty' });
      return;
    }

    if (selectedChannels.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one distribution channel' });
      return;
    }

    setBroadcasting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/distribution/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          content,
          sport,
          linkUrl,
          mediaUrls: imageUrl ? [imageUrl] : undefined,
          targetChannels: selectedChannels,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        setHeadline('');
        setContent('');
        setLinkUrl('');
        setImageUrl('');
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Broadcast failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error dispatching broadcast' });
    } finally {
      setBroadcasting(false);
    }
  }

  const toggleChannel = (ch: DistributionChannelType) => {
    if (selectedChannels.includes(ch)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const selectAllSocialChannels = () => {
    setSelectedChannels([
      'x_twitter',
      'telegram',
      'whatsapp',
      'facebook',
      'linkedin',
      'youtube',
      'tiktok',
      'rss_feed',
    ]);
  };

  const clearAllChannels = () => {
    setSelectedChannels([]);
  };

  const channelIcons: Record<string, React.ReactNode> = {
    x_twitter: <FaTwitter className="text-sky-400" />,
    twitter: <FaTwitter className="text-sky-400" />,
    telegram: <FaTelegram className="text-blue-400" />,
    whatsapp: <FaWhatsapp className="text-emerald-400" />,
    facebook: <FaFacebook className="text-indigo-400" />,
    linkedin: <FaLinkedin className="text-blue-500" />,
    youtube: <FaYoutube className="text-red-500" />,
    tiktok: <FaTiktok className="text-pink-400" />,
    rss_feed: <FaRss className="text-amber-400" />,
  };

  const allAvailableChannels: { id: DistributionChannelType; label: string; icon: React.ReactNode }[] = [
    { id: 'x_twitter', label: 'X (Twitter)', icon: <FaTwitter className="text-sky-400" /> },
    { id: 'telegram', label: 'Telegram', icon: <FaTelegram className="text-blue-400" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp className="text-emerald-400" /> },
    { id: 'facebook', label: 'Facebook', icon: <FaFacebook className="text-indigo-400" /> },
    { id: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin className="text-blue-500" /> },
    { id: 'youtube', label: 'YouTube Community', icon: <FaYoutube className="text-red-500" /> },
    { id: 'tiktok', label: 'TikTok Feed', icon: <FaTiktok className="text-pink-400" /> },
    { id: 'rss_feed', label: 'Public RSS 2.0', icon: <FaRss className="text-amber-400" /> },
  ];

  const filteredJobs = jobs.filter((j) => {
    if (activeFilter === 'all') return true;
    return j.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-400 shadow-inner">
              <FiShare2 size={26} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Automated Content Distribution Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Multi-channel social syndication, matchday scorecards, AI tactical summaries, and editorial safety gates.
              </p>
            </div>
          </div>
        </div>

        {/* Live Social Engine Connection Card */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {engineStatus?.online ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                )}
              </span>
              <span className="text-xs font-bold text-white">Social Engine</span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 border-l border-white/10 pl-3">
              {engineStatus?.online ? (
                <span className="text-emerald-400 font-bold">ONLINE ({engineBaseUrl})</span>
              ) : (
                <span className="text-rose-400 font-bold">DISCONNECTED</span>
              )}
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold transition flex items-center gap-2"
          >
            <FiRefreshCw className={loading ? 'animate-spin text-purple-400' : ''} />
            <span>Refresh All</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between border shadow-lg ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : feedback.type === 'info'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <FiCheckCircle size={18} />
            ) : feedback.type === 'info' ? (
              <FiActivity size={18} className="animate-spin" />
            ) : (
              <FiAlertTriangle size={18} />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white ml-4">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Dispatched 24h</span>
            <FiSend className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.totalDispatched24h : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <FiCheck size={12} />
            <span>Across connected social & feed channels</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <FiClock className="text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.pendingApprovalCount : '—'}
          </div>
          <div className="text-[11px] text-amber-300 mt-1">Editorial safety queue</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Social Engine Posts</span>
            <FiCpu className="text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {engineStatus?.metrics ? engineStatus.metrics.postsToday : 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total lifetime: {engineStatus?.metrics?.totalPosts || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Platforms</span>
            <FiGlobe className="text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {platforms.length > 0 ? platforms.filter((p) => p.isConfigured).length : '7'}/7
          </div>
          <div className="text-[11px] text-purple-300 mt-1">Platform adapters connected</div>
        </div>
      </div>

      {/* Social Media Platform Adapters Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <FiServer className="text-purple-400" size={18} />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Social Engine Platform Adapters & Live Status
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Real-time credentials, rate-limiters & API health
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'twitter', label: 'X / Twitter', icon: <FaTwitter size={20} className="text-sky-400" /> },
            { id: 'telegram', label: 'Telegram Channel', icon: <FaTelegram size={20} className="text-blue-400" /> },
            { id: 'whatsapp', label: 'WhatsApp Broadcast', icon: <FaWhatsapp size={20} className="text-emerald-400" /> },
            { id: 'facebook', label: 'Facebook Page', icon: <FaFacebook size={20} className="text-indigo-400" /> },
            { id: 'linkedin', label: 'LinkedIn Page', icon: <FaLinkedin size={20} className="text-blue-500" /> },
            { id: 'youtube', label: 'YouTube Community', icon: <FaYoutube size={20} className="text-red-500" /> },
            { id: 'tiktok', label: 'TikTok Video Hub', icon: <FaTiktok size={20} className="text-pink-400" /> },
            { id: 'rss', label: 'Public RSS 2.0 Feeds', icon: <FaRss size={20} className="text-amber-400" /> },
          ].map((item) => {
            const platformInfo = platforms.find(
              (p) => p.platform.toLowerCase() === item.id.toLowerCase()
            );
            const isConfigured = platformInfo ? platformInfo.isConfigured : true;
            const healthStatus = platformInfo ? platformInfo.healthStatus : 'healthy';

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col justify-between gap-3 hover:border-white/20 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-slate-900 border border-white/10">
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {healthStatus.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isConfigured
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {isConfigured ? 'Ready' : 'API Key Needed'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                  <span className="text-slate-400 truncate max-w-[120px]">
                    {platformInfo?.lastSuccessAt
                      ? `Last: ${new Date(platformInfo.lastSuccessAt).toLocaleTimeString()}`
                      : 'Active'}
                  </span>

                  {item.id !== 'rss' && (
                    <button
                      onClick={() => handleTestPlatform(item.id)}
                      disabled={testingPlatform === item.id}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 hover:bg-slate-800 text-purple-400 font-bold hover:text-purple-300 transition flex items-center gap-1"
                    >
                      {testingPlatform === item.id ? (
                        <FiRefreshCw className="animate-spin text-[10px]" />
                      ) : (
                        <FiZap className="text-[10px]" />
                      )}
                      <span>Test Ping</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Automated AI Workflows Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-slate-900/60 border border-purple-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <FiZap className="text-purple-400" size={20} />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Automated AI Workflows & Graphics Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Trigger Google Gemini AI content generation & Sharp canvas matchday graphics on demand.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'weekly-fixtures' as const,
              title: 'Weekly Fixtures Graphic',
              desc: 'Renders upcoming fixtures visual cards and schedules multi-platform carousel.',
              btnLabel: 'Run Fixtures Workflow',
            },
            {
              id: 'pre-match' as const,
              title: 'Pre-Match Tactical Previews',
              desc: 'Generates AI tactical analysis bulletins for matches starting in 48 hours.',
              btnLabel: 'Run Pre-Match Workflow',
            },
            {
              id: 'live-poll' as const,
              title: 'Live Matchday Scorecard Poller',
              desc: 'Instant Halftime & Fulltime scorecards triggered from live football APIs.',
              btnLabel: 'Run Live Scorecard Tick',
            },
            {
              id: 'post-match' as const,
              title: 'Post-Match Tactical Breakdown',
              desc: 'Generates statistical review and manager quotes 30 min after final whistle.',
              btnLabel: 'Run Post-Match Workflow',
            },
          ].map((wf) => (
            <div
              key={wf.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="text-xs font-black text-white mb-1">{wf.title}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">{wf.desc}</div>
              </div>

              <button
                onClick={() => handleTriggerWorkflow(wf.id)}
                disabled={runningWorkflow === wf.id}
                className="w-full py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {runningWorkflow === wf.id ? (
                  <FiRefreshCw className="animate-spin text-xs" />
                ) : (
                  <FiPlay className="text-xs" />
                )}
                <span>{runningWorkflow === wf.id ? 'Running...' : wf.btnLabel}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Sandbox & Editorial Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Broadcast Sandbox */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <FiSend className="text-purple-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Live Multi-Channel Broadcast Sandbox
              </h3>
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">
              DIRECT TO SOCIAL ENGINE
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Sport
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="cricket">Cricket</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Headline / Banner
              </label>
              <input
                type="text"
                placeholder="e.g. BREAKING: Real Madrid seal UEFA Champions League semifinal spot"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Post Body & Summary
              </label>
              <textarea
                rows={3}
                placeholder="Full bulletin copy, match recap details, or editorial summary..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Article or Match Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://goalmills.com/football/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Graphic Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://res.cloudinary.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Target Channels ({selectedChannels.length})
                </label>
                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={selectAllSocialChannels}
                    className="text-purple-400 hover:text-purple-300 font-bold"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={clearAllChannels}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {allAvailableChannels.map((ch) => {
                  const isSelected = selectedChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChannel(ch.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-2 ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/20'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{ch.icon}</span>
                      <span className="truncate">{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleBroadcast}
              disabled={broadcasting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 mt-3"
            >
              <FiSend className={broadcasting ? 'animate-spin' : ''} />
              <span>{broadcasting ? 'Dispatching to Social Engine...' : 'Broadcast to Selected Channels'}</span>
            </button>
          </div>
        </div>

        {/* Right: Syndication Activity Queue */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <FiClock className="text-blue-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Recent Syndication Activity & Review
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-[10px]">
              {(['all', 'pending_approval', 'dispatched', 'failed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-2 py-1 rounded-lg font-bold capitalize transition ${
                    activeFilter === tab
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No syndication jobs found for this view.
              </div>
            ) : (
              filteredJobs.map((j) => (
                <div
                  key={j.jobId}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs hover:border-white/20 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-slate-900 border border-white/10">
                        {channelIcons[j.channel.toLowerCase()] || <FiShare2 className="text-slate-400" />}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 uppercase">
                        {j.channel.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {j.sport}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        j.status === 'dispatched'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : j.status === 'pending_approval'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {j.status}
                    </span>
                  </div>

                  <div className="font-bold text-white line-clamp-1">{j.content.headline}</div>
                  <div className="text-slate-400 text-[11px] line-clamp-2">{j.content.body}</div>

                  {j.errorMessage && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px]">
                      Error: {j.errorMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-white/5">
                    <span>
                      {j.dispatchedAt
                        ? `Dispatched: ${new Date(j.dispatchedAt).toLocaleTimeString()}`
                        : `Queued: ${new Date(j.createdAt || Date.now()).toLocaleTimeString()}`}
                    </span>

                    <div className="flex items-center gap-2">
                      {(j as any).platformPostUrl && (
                        <a
                          href={(j as any).platformPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-slate-900 border border-white/10 hover:bg-slate-800 text-purple-400 hover:text-purple-300 font-bold text-[10px] transition flex items-center gap-1"
                        >
                          <span>View Post</span>
                          <FiExternalLink size={10} />
                        </a>
                      )}

                      {j.status === 'pending_approval' && (
                        <button
                          onClick={() => handleApprove(j.jobId)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow-md shadow-emerald-600/20"
                        >
                          Approve & Post
                        </button>
                      )}

                      {j.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(j.jobId)}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition flex items-center gap-1 shadow-md shadow-rose-600/20"
                        >
                          <FiRefreshCw size={10} />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

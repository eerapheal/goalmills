'use client';

import React, { useState, useEffect } from 'react';
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
} from 'react-icons/fi';
import type { DistributionHubStats, SyndicationJob, DistributionChannelType } from '@goalmills/types';

export default function ContentDistributionStudio() {
  const [stats, setStats] = useState<DistributionHubStats | null>(null);
  const [jobs, setJobs] = useState<SyndicationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Broadcast Sandbox state
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [sport, setSport] = useState('football');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<DistributionChannelType[]>([
    'x_twitter',
    'telegram',
  ]);

  async function loadData() {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        fetch('/api/admin/distribution/stats'),
        fetch('/api/admin/distribution/jobs'),
      ]);
      const statsJson = await statsRes.json();
      const jobsJson = await jobsRes.json();

      if (statsJson.success && statsJson.stats) setStats(statsJson.stats);
      if (jobsJson.success && jobsJson.jobs) setJobs(jobsJson.jobs);
    } catch (err) {
      console.error('Failed to load distribution data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleApprove(jobId: string) {
    try {
      const res = await fetch('/api/admin/distribution/jobs/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Job approved & broadcasted!' });
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Approval failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error approving job' });
    }
  }

  async function handleBroadcast() {
    if (!headline.trim() || !content.trim()) {
      setFeedback({ type: 'error', message: 'Headline and content cannot be empty' });
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
          targetChannels: selectedChannels,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        setHeadline('');
        setContent('');
        setLinkUrl('');
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <FiShare2 size={24} />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>Automated Content Distribution Hub</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  PHASE 9 LIVE
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Automated social syndication, match recaps, editorial safety gates, and public RSS feeds.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold transition flex items-center gap-2"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Dispatched 24h</span>
            <FiSend className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.totalDispatched24h : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Across 6 connected channels</div>
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
            <span className="text-xs font-bold uppercase tracking-wider">Active Rules</span>
            <FiLayers className="text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.activeRulesCount : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Automated match & news triggers</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Connected Feeds</span>
            <FiGlobe className="text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {stats ? stats.connectedChannelsCount : '—'}
          </div>
          <div className="text-[11px] text-purple-300 mt-1">RSS 2.0 & Google News XML</div>
        </div>
      </div>

      {/* Broadcast Sandbox & Editorial Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Broadcast Sandbox */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <FiSend className="text-purple-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Live Multi-Channel Broadcast Sandbox
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Sport</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="football">Football</option>
                <option value="cricket">Cricket</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Headline / Banner</label>
              <input
                type="text"
                placeholder="e.g. BREAKING: Arsenal seal Champions League qualification"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Post Body & Summary</label>
              <textarea
                rows={3}
                placeholder="Full bulletin copy, match recap details, or editorial summary..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Article or Match Link (Optional)</label>
              <input
                type="text"
                placeholder="https://goalmills.com/news/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Target Channels</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'x_twitter', label: 'X / Twitter' },
                  { id: 'telegram', label: 'Telegram' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'facebook', label: 'Facebook' },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id as DistributionChannelType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                      selectedChannels.includes(ch.id as DistributionChannelType)
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBroadcast}
              disabled={broadcasting}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 mt-2"
            >
              <FiSend className={broadcasting ? 'animate-spin' : ''} />
              <span>{broadcasting ? 'Broadcasting...' : 'Broadcast to Selected Channels'}</span>
            </button>
          </div>
        </div>

        {/* Right: Syndication Activity Queue */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <FiClock className="text-blue-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Recent Syndication Activity & Review
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Latest 50 Jobs</span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No recent syndication jobs found.
              </div>
            ) : (
              jobs.map((j) => (
                <div
                  key={j.jobId}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : j.status === 'pending_approval'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {j.status}
                    </span>
                  </div>

                  <div className="font-bold text-white line-clamp-1">{j.content.headline}</div>
                  <div className="text-slate-400 text-[11px] line-clamp-2">{j.content.body}</div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                    <span>
                      {j.dispatchedAt
                        ? `Dispatched: ${new Date(j.dispatchedAt).toLocaleTimeString()}`
                        : `Queued: ${new Date(j.createdAt || Date.now()).toLocaleTimeString()}`}
                    </span>

                    {j.status === 'pending_approval' && (
                      <button
                        onClick={() => handleApprove(j.jobId)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition"
                      >
                        Approve & Post
                      </button>
                    )}
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

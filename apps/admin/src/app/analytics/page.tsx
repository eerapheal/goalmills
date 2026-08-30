'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  FiActivity,
  FiTrendingUp,
  FiEye,
  FiUsers,
  FiClock,
  FiShare2,
  FiDownload,
  FiRefreshCw,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiFilter,
  FiCompass,
  FiExternalLink,
  FiZap,
  FiGlobe,
} from 'react-icons/fi';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';
import type { AnalyticsOverviewKPIs, RealtimeAnalyticsSummary, TopArticleMetric } from '@goalmills/types';

export default function AnalyticsDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'audience' | 'realtime'>('overview');
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d'>('7d');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [overviewData, setOverviewData] = useState<AnalyticsOverviewKPIs | null>(null);
  const [articlesList, setArticlesList] = useState<TopArticleMetric[]>([]);
  const [realtimeData, setRealtimeData] = useState<RealtimeAnalyticsSummary | null>(null);
  const [audienceData, setAudienceData] = useState<any | null>(null);

  const isSuperAdmin = session?.user?.role === 'super-admin';

  async function fetchAllAnalytics(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const params = new URLSearchParams({
        range: timeRange,
        tenantSlug: tenantFilter,
      });

      const [overviewRes, articlesRes, realtimeRes, audienceRes] = await Promise.all([
        fetch(`/api/admin/analytics/overview?${params.toString()}`),
        fetch(`/api/admin/analytics/articles?${params.toString()}&sport=${sportFilter}&limit=20`),
        fetch(`/api/admin/analytics/realtime?${params.toString()}`),
        fetch(`/api/admin/analytics/audience?${params.toString()}`),
      ]);

      const [overviewJson, articlesJson, realtimeJson, audienceJson] = await Promise.all([
        overviewRes.json(),
        articlesRes.json(),
        realtimeRes.json(),
        audienceRes.json(),
      ]);

      if (overviewJson.success && overviewJson.data) {
        setOverviewData(overviewJson.data);
      }
      if (articlesJson.success && articlesJson.articles) {
        setArticlesList(articlesJson.articles);
      }
      if (realtimeJson.success && realtimeJson.data) {
        setRealtimeData(realtimeJson.data);
      }
      if (audienceJson.success && audienceJson.data) {
        setAudienceData(audienceJson.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange, tenantFilter, sportFilter]);

  // Realtime Polling every 15s
  useEffect(() => {
    const timer = setInterval(() => {
      fetch(`/api/admin/analytics/realtime?tenantSlug=${tenantFilter}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setRealtimeData(json.data);
          }
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, [tenantFilter]);

  function exportCSV() {
    if (!articlesList || articlesList.length === 0) return;
    const headers = 'Article ID,Title,Sport,Category,Views,Unique Readers,Avg Read Duration (Sec),Scroll Completion (%),Shares\n';
    const rows = articlesList
      .map(
        (a) =>
          `"${a.articleId}","${a.title.replace(/"/g, '""')}","${a.sport}","${a.category}",${a.views},${a.uniqueReaders},${a.avgReadDurationSec},${a.scrollCompletionRate},${a.shares}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `goalmills-analytics-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* TOP HEADER: Title, Realtime Live Pulse, Filter Controls & Actions */}
      {/* ========================================================================= */}
      <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl bg-slate-950/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                <FiActivity size={20} />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Audience Analytics & Performance</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  First-party privacy-conscious reader telemetry & multi-tenant content intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Pulse Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-bold shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>{realtimeData?.activeReaders5m || 18} Live Readers</span>
            </div>

            {/* Timeframe Selector */}
            <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-bold">
              {(['today', '7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                    timeRange === r
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'today' ? 'Today' : r.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Super Admin Tenant Switcher */}
            {isSuperAdmin && (
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="all">🌐 All Tenants</option>
                <option value="goalmills">GoalMills Global</option>
                <option value="chelsea-hub">Chelsea Fan Network</option>
                <option value="cricket-central">Cricket Central</option>
              </select>
            )}

            {/* Refresh */}
            <button
              onClick={() => fetchAllAnalytics(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs"
              title="Refresh Analytics"
            >
              <FiRefreshCw size={14} className={refreshing ? 'animate-spin text-amber-400' : ''} />
            </button>

            {/* CSV Export */}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold transition-all"
            >
              <FiDownload size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Trends', icon: FiTrendingUp },
            { id: 'content', label: 'Content Performance', icon: FiEye },
            { id: 'audience', label: 'Audience & Affinities', icon: FiUsers },
            { id: 'realtime', label: 'Live Telemetry Radar', icon: FiZap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <GoalmillsLoader size="lg" label="Audience Analytics" sublabel="Aggregating telemetry records..." />
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* TOP 5 METRICS KPI ROW */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            <div className="glass-card border border-white/10 rounded-2xl p-4 sm:p-5 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Page Views</span>
                <FiEye className="text-amber-400" size={16} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {(overviewData?.totalPageViews || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <span>↑ 14.8%</span>
                <span className="text-slate-500">vs prev period</span>
              </p>
            </div>

            <div className="glass-card border border-white/10 rounded-2xl p-4 sm:p-5 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Unique Readers</span>
                <FiUsers className="text-blue-400" size={16} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {(overviewData?.uniqueVisitors || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <span>↑ 9.2%</span>
                <span className="text-slate-500">organic reach</span>
              </p>
            </div>

            <div className="glass-card border border-white/10 rounded-2xl p-4 sm:p-5 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Avg Read Duration</span>
                <FiClock className="text-purple-400" size={16} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {Math.floor((overviewData?.avgReadDurationSec || 90) / 60)}m {(overviewData?.avgReadDurationSec || 90) % 60}s
              </div>
              <p className="text-[11px] text-purple-400 font-bold mt-1 flex items-center gap-1">
                <span>⚡ High Focus</span>
                <span className="text-slate-500">active tabs</span>
              </p>
            </div>

            <div className="glass-card border border-white/10 rounded-2xl p-4 sm:p-5 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Scroll Completion</span>
                <FiTrendingUp className="text-emerald-400" size={16} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {overviewData?.scrollCompletionRate || 74}%
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Reached 75%+ content
              </p>
            </div>

            <div className="glass-card border border-white/10 rounded-2xl p-4 sm:p-5 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden group col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Total Shares</span>
                <FiShare2 className="text-rose-400" size={16} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {(overviewData?.totalShares || 142).toLocaleString()}
              </div>
              <p className="text-[11px] text-rose-400 font-bold mt-1">
                Viral amplification
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW & TRENDS */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Daily Trend Timeline */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FiTrendingUp className="text-amber-400" />
                    <span>Daily Readership Activity Timeline</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    {timeRange.toUpperCase()} Window
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {overviewData?.timeseries.map((item) => (
                    <div
                      key={item.date}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between"
                    >
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        {item.date.slice(5)}
                      </span>
                      <div className="my-2">
                        <div className="text-lg font-black text-white">{item.views}</div>
                        <span className="text-[10px] text-amber-400/80 font-bold block">
                          {item.readers} readers
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(15, (item.views / 500) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two Column Grid: Sports Affinity & Devices/Traffic */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sports Category Affinity */}
                <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-4">
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FiCompass className="text-cyan-400" />
                    <span>Sport Topic Readership Affinity</span>
                  </h3>
                  <div className="space-y-3">
                    {overviewData?.topSports.map((sp) => (
                      <div key={sp.sportSlug} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-300 capitalize">{sp.sportSlug}</span>
                          <span className="text-amber-400 font-mono">{sp.views} views ({sp.percentage}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 rounded-full"
                            style={{ width: `${sp.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Distribution & Channels */}
                <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-5">
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FiSmartphone className="text-emerald-400" />
                    <span>Device Mix & Inbound Channels</span>
                  </h3>

                  {/* Devices */}
                  <div className="grid grid-cols-3 gap-3">
                    {overviewData?.deviceDistribution.map((d) => (
                      <div key={d.device} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 capitalize text-[11px] font-bold block">
                          {d.device}
                        </span>
                        <span className="text-lg font-black text-white block my-1">
                          {d.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{d.count} hits</span>
                      </div>
                    ))}
                  </div>

                  {/* Referrals */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Top Referring Sources:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {overviewData?.topReferrers.map((ref) => (
                        <div
                          key={ref.source}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-300 font-medium truncate">{ref.source}</span>
                          <span className="text-amber-400 font-mono font-bold">{ref.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CONTENT PERFORMANCE LEADERBOARD */}
          {/* ========================================================================= */}
          {activeTab === 'content' && (
            <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FiEye className="text-amber-400" />
                    <span>Article Readership & Engagement Leaderboard</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ranked by active readership telemetry, scroll depth completion, and viral shares
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sportFilter}
                    onChange={(e) => setSportFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Sports</option>
                    <option value="football">Football</option>
                    <option value="cricket">Cricket</option>
                    <option value="basketball">Basketball</option>
                  </select>
                </div>
              </div>

              {articlesList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No article engagement metrics recorded for this timeframe yet.
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="py-3 px-3">Article Story</th>
                        <th className="py-3 px-2">Sport</th>
                        <th className="py-3 px-2 text-right">Views</th>
                        <th className="py-3 px-2 text-right">Readers</th>
                        <th className="py-3 px-2 text-right">Avg Read</th>
                        <th className="py-3 px-3">Scroll 75%+</th>
                        <th className="py-3 px-2 text-right">Shares</th>
                        <th className="py-3 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {articlesList.map((art, idx) => (
                        <tr key={art.articleId + idx} className="hover:bg-white/5 transition-colors group">
                          <td className="py-3 px-3 max-w-[280px] sm:max-w-md">
                            <span className="font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                              {art.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              By {art.author || 'Editor'} • Category: {art.category}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase font-mono">
                              {art.sport}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-white">
                            {art.views.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-amber-400 font-bold">
                            {art.uniqueReaders.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-purple-300">
                            {Math.floor(art.avgReadDurationSec / 60)}m {art.avgReadDurationSec % 60}s
                          </td>
                          <td className="py-3 px-3 w-32">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-400 rounded-full"
                                  style={{ width: `${Math.min(100, art.scrollCompletionRate || 50)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                {art.scrollCompletionRate}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-rose-400 font-bold">
                            {art.shares}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <a
                              href={`/news/${art.slug || art.articleId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white inline-flex items-center"
                              title="Open Live Article"
                            >
                              <FiExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: AUDIENCE & AFFINITIES */}
          {/* ========================================================================= */}
          {activeTab === 'audience' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reader Visit Frequency */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-4">
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiUsers className="text-amber-400" />
                  <span>Reader Loyalty & Visit Frequency Cohorts</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Distribution of unique reader sessions segmented by lifetime article touchpoints:
                </p>

                <div className="space-y-3 pt-2">
                  {audienceData?.frequencyBuckets?.map((bucket: any) => (
                    <div key={bucket._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">
                          {bucket._id === 1 ? '1 Visit (First-time readers)' : `${bucket._id}+ Visits (Returning Loyalists)`}
                        </span>
                        <span className="text-amber-400 font-mono">{bucket.readers} sessions</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(10, (bucket.readers / 1500) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Distribution */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-4">
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiGlobe className="text-blue-400" />
                  <span>Top Readership Regions (Privacy-Preserved)</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aggregated origin countries for sports alerts and match day coverage:
                </p>

                <div className="space-y-2 pt-2">
                  {audienceData?.topLocations?.map((loc: any, idx: number) => (
                    <div
                      key={loc._id + idx}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">{loc._id}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {loc.count.toLocaleString()} reads
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: LIVE REALTIME RADAR */}
          {/* ========================================================================= */}
          {activeTab === 'realtime' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Realtime Overview Cards */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-5 lg:col-span-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Live Active Telemetry
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Active Readers Right Now (5m)
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono">
                    {realtimeData?.activeReaders5m || 18}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Active Readers in Last 30m
                  </span>
                  <div className="text-3xl font-black text-white font-mono">
                    {realtimeData?.activeReaders30m || 64}
                  </div>
                </div>
              </div>

              {/* Trending Stories in Real-Time */}
              <div className="glass-card border border-white/10 rounded-3xl p-5 sm:p-6 bg-slate-950/60 space-y-4 lg:col-span-2">
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FiZap className="text-amber-400" />
                  <span>Real-Time Trending Sports Stories</span>
                </h3>

                <div className="space-y-2.5">
                  {realtimeData?.topActiveArticles?.map((item, idx) => (
                    <div
                      key={item.articleId + idx}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            /{item.slug}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
                          {item.activeCount} active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

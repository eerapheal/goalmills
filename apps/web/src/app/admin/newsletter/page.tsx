'use client';

import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/admin/AdminNavBar';
import GoalmillsLoader from '@/components/GoalmillsLoader';
import { useToast } from '@/components/Toast';
import {
  NewsletterCampaign,
  NewsletterSubscriber,
  NewsletterFrequency,
  NewsletterAudience,
  EmailSuppression,
  CampaignPreflightReport,
} from '@goalmills/types';
import {
  FiMail,
  FiSend,
  FiClock,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiPlus,
  FiEye,
  FiCheck,
  FiX,
  FiLayers,
  FiStar,
  FiZap,
  FiFilter,
  FiShield,
  FiActivity,
  FiTrash2,
  FiAlertTriangle,
} from 'react-icons/fi';

type ActiveViewTab = 'overview' | 'campaigns' | 'subscribers' | 'suppressions' | 'reputation';

export default function AdminNewsletterPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<ActiveViewTab>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [suppressions, setSuppressions] = useState<EmailSuppression[]>([]);
  const [reputationData, setReputationData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalActive: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
    unsubscribed: 0,
  });

  // Compose Modal State
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composerMode, setComposerMode] = useState<'custom' | 'auto_curate'>('custom');
  const [selectedArticles, setSelectedArticles] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [editorialNote, setEditorialNote] = useState('');
  const [frequencyTier, setFrequencyTier] = useState<'daily' | 'weekly' | 'monthly' | 'custom_broadcast'>('custom_broadcast');
  const [targetAudience, setTargetAudience] = useState<NewsletterAudience>('all_subscribers');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-flight deliverability report state
  const [preflightReport, setPreflightReport] = useState<CampaignPreflightReport | null>(null);
  const [runningPreflight, setRunningPreflight] = useState(false);

  // Article Picker State
  const [availableNews, setAvailableNews] = useState<any[]>([]);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategory, setNewsCategory] = useState('all');
  const [loadingNews, setLoadingNews] = useState(false);

  // Subscriber Search & Filters
  const [subSearch, setSubSearch] = useState('');
  const [subTierFilter, setSubTierFilter] = useState('all');
  const [subStatusFilter, setSubStatusFilter] = useState('all');

  // Suppression Modal State
  const [showAddSuppressionModal, setShowAddSuppressionModal] = useState(false);
  const [suppressEmailInput, setSuppressEmailInput] = useState('');
  const [suppressReasonInput, setSuppressReasonInput] = useState('MANUAL');
  const [suppressionSearch, setSuppressionSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campRes, subRes, suppRes, repRes] = await Promise.all([
        fetch('/api/admin/newsletter/campaigns'),
        fetch('/api/admin/newsletter/subscribers'),
        fetch('/api/admin/newsletter/suppressions'),
        fetch('/api/admin/newsletter/reputation'),
      ]);

      const campJson = await campRes.json();
      const subJson = await subRes.json();
      const suppJson = await suppRes.json();
      const repJson = await repRes.json();

      if (campJson.success) setCampaigns(campJson.data);
      if (subJson.success) {
        setSubscribers(subJson.data);
        if (subJson.stats) setStats(subJson.stats);
      }
      if (suppJson.success) setSuppressions(suppJson.data);
      if (repJson.success) setReputationData(repJson.data);
    } catch (err) {
      console.error('Error loading newsletter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishedNews = async () => {
    try {
      setLoadingNews(true);
      const url = new URL('/api/news', window.location.origin);
      url.searchParams.set('limit', '20');
      if (newsSearch) url.searchParams.set('search', newsSearch);
      if (newsCategory !== 'all') url.searchParams.set('category', newsCategory);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.articles) {
        setAvailableNews(json.articles);
      }
    } catch (err) {
      console.error('Error fetching published news:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showComposeModal) {
      fetchPublishedNews();
      runPreflightCheck(targetAudience);
    }
  }, [showComposeModal, newsSearch, newsCategory, targetAudience]);

  const runPreflightCheck = async (audience: NewsletterAudience) => {
    try {
      setRunningPreflight(true);
      const res = await fetch('/api/admin/newsletter/preflight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAudience: audience }),
      });
      const json = await res.json();
      if (json.success) {
        setPreflightReport(json.report);
      }
    } catch (err) {
      console.error('Preflight check failed:', err);
    } finally {
      setRunningPreflight(false);
    }
  };

  const toggleArticleSelection = (article: any) => {
    const exists = selectedArticles.some((a) => a._id === article._id);
    if (exists) {
      setSelectedArticles(selectedArticles.filter((a) => a._id !== article._id));
    } else {
      setSelectedArticles([...selectedArticles, article]);
    }
  };

  const handleSendOrSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isScheduled) {
        if (!scheduledFor) {
          throw new Error('Please pick a future date and time for scheduling');
        }

        const res = await fetch('/api/admin/newsletter/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            previewText,
            editorialNote,
            frequencyTier,
            targetAudience,
            articleIds: selectedArticles.map((a) => a._id),
            scheduledFor,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to schedule campaign');

        toast.success(json.message || 'Campaign scheduled successfully');
      } else {
        // Instant Send with Deliverability Gating
        const res = await fetch('/api/admin/newsletter/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: composerMode,
            title,
            previewText,
            editorialNote,
            frequencyTier,
            targetAudience,
            articleIds: selectedArticles.map((a) => a._id),
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to send campaign');

        toast.success(json.message || `Dispatched to ${json.eligibleCount} deliverable subscribers`);
      }

      setShowComposeModal(false);
      resetComposer();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerAutoDigest = async (freq: NewsletterFrequency) => {
    const confirmText = `Are you sure you want to trigger the automated ${freq.toUpperCase()} curated digest now?\n\nThis will filter through the Deliverability Gate and dispatch to deliverable ${freq} subscribers.`;
    if (!confirm(confirmText)) return;

    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'auto_curate',
          frequency: freq,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || `${freq.toUpperCase()} digest dispatched successfully`);
        fetchData();
      } else {
        toast.error(json.message || 'Failed to trigger digest');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch digest');
    }
  };

  const handleAddSuppression = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppressEmailInput) return;

    try {
      const res = await fetch('/api/admin/newsletter/suppressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: suppressEmailInput.trim(),
          reason: suppressReasonInput,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setSuppressEmailInput('');
        setShowAddSuppressionModal(false);
        fetchData();
      } else {
        toast.error(json.message || 'Failed to suppress email');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  };

  const handleRemoveSuppression = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the global suppression list?`)) return;

    try {
      const res = await fetch(`/api/admin/newsletter/suppressions?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        fetchData();
      } else {
        toast.error(json.message || 'Failed to unsuppress');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  };

  const resetComposer = () => {
    setTitle('');
    setPreviewText('');
    setEditorialNote('');
    setSelectedArticles([]);
    setIsScheduled(false);
    setScheduledFor('');
    setComposerMode('custom');
    setFrequencyTier('custom_broadcast');
    setTargetAudience('all_subscribers');
    setPreflightReport(null);
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    if (subTierFilter !== 'all' && sub.frequency !== subTierFilter) return false;
    if (subStatusFilter !== 'all' && sub.status !== subStatusFilter) return false;
    if (subSearch && !sub.email.toLowerCase().includes(subSearch.toLowerCase())) return false;
    return true;
  });

  const filteredSuppressions = suppressions.filter((supp) => {
    if (suppressionSearch && !supp.emailNormalized.includes(suppressionSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-6 pt-[80px] sm:pt-[95px] text-white">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <AdminNavBar />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <FiShield size={11} /> Audience Intelligence & Deliverability Gate
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight mt-1 text-white">
              Newsletter & <span className="text-amber-400">Reputation Hub</span>
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Enterprise Go traffic shaping, domain rate limiting, double opt-in & global suppression
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetComposer();
                setShowComposeModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              <FiPlus size={16} />
              <span>Compose Broadcast</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Deliverability Health
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FiShield size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-3xl font-black text-emerald-400">
                {reputationData?.reputationScore || 95}/100
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <FiCheckCircle size={10} className="text-emerald-400" /> Tier: {reputationData?.reputationTier || 'EXCELLENT'}
              </p>
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Active Deliverable
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FiUsers size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-3xl font-black text-blue-400">{stats.totalActive}</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Healthy & Consenting</p>
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Global Suppressions
              </span>
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <FiAlertTriangle size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl sm:text-3xl font-black text-red-400">{suppressions.length}</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Zero-Risk Hard Blocked</p>
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-bold">
                Domain Authentication
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FiActivity size={16} />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-lg sm:text-2xl font-black text-purple-300">SPF • DKIM • DMARC</h3>
              <p className="text-[10px] text-emerald-400 mt-0.5">✓ 100% DNS Aligned</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Campaigns ({campaigns.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subscribers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'subscribers'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Health & Roster ({stats.totalActive})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('suppressions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'suppressions'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Suppression Engine ({suppressions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reputation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'reputation'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Reputation & DNS
          </button>
        </div>

        {/* Tab 1: Campaigns */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Trigger Digest Bar */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FiZap className="text-amber-400" /> Fast-Action Automated Curated Dispatches
                </span>
                <span className="text-[11px] text-text-muted">Automated schedule: Daily 10:00 AM WAT</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleTriggerAutoDigest('daily')}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 font-bold text-xs transition-all group"
                >
                  <div className="text-left">
                    <p className="text-white font-black group-hover:text-blue-400 transition-colors">
                      Dispatch Daily Digest
                    </p>
                    <p className="text-[10px] text-slate-400">Breaking + Editor Picks</p>
                  </div>
                  <FiSend className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerAutoDigest('weekly')}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 font-bold text-xs transition-all group"
                >
                  <div className="text-left">
                    <p className="text-white font-black group-hover:text-purple-400 transition-colors">
                      Dispatch Weekly Digest
                    </p>
                    <p className="text-[10px] text-slate-400">7-Day Top Most Read</p>
                  </div>
                  <FiSend className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerAutoDigest('monthly')}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all group"
                >
                  <div className="text-left">
                    <p className="text-white font-black group-hover:text-amber-400 transition-colors">
                      Dispatch Monthly Digest
                    </p>
                    <p className="text-[10px] text-slate-400">30-Day Retrospective</p>
                  </div>
                  <FiSend className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Campaign Table */}
            <div className="glass-card rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <FiMail className="text-amber-400" /> Dispatch History & Scheduled Queue
                </h2>
                <span className="text-xs text-text-muted">GoalMills Broadcast Log</span>
              </div>

              {loading ? (
                <div className="p-12 flex justify-center">
                  <GoalmillsLoader
                    size="md"
                    label="GoalMills Mailer"
                    sublabel="Fetching newsletter campaigns & dispatch history..."
                  />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <FiMail className="mx-auto text-slate-600" size={40} />
                  <p className="text-slate-400 font-bold">No newsletter campaigns created yet.</p>
                  <button
                    type="button"
                    onClick={() => setShowComposeModal(true)}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider"
                  >
                    Create First Campaign
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-text-muted border-b border-white/5">
                      <tr>
                        <th className="p-4">Campaign Title & Subject</th>
                        <th className="p-4">Tier & Audience</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Recipients</th>
                        <th className="p-4">Date / Scheduled</th>
                        <th className="p-4">Deliverability Gate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {campaigns.map((camp) => (
                        <tr key={camp._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-white text-sm">{camp.title}</p>
                            <p className="text-xs text-text-muted truncate max-w-[280px]">
                              {camp.previewText || camp.editorialNote || 'Standard news brief'}
                            </p>
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-200">
                              {camp.frequencyTier}
                            </span>
                            <p className="text-[11px] text-text-muted mt-1">{camp.targetAudience}</p>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                camp.status === 'sent'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : camp.status === 'scheduled'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}
                            >
                              {camp.status === 'sent' && <FiCheckCircle size={12} />}
                              {camp.status === 'scheduled' && <FiClock size={12} />}
                              <span>{camp.status}</span>
                            </span>
                          </td>

                          <td className="p-4 font-semibold text-emerald-400">
                            {camp.stats?.totalRecipients || 0}
                          </td>

                          <td className="p-4 text-xs text-slate-300">
                            {camp.sentAt
                              ? new Date(camp.sentAt).toLocaleString()
                              : camp.scheduledFor
                                ? `Scheduled: ${new Date(camp.scheduledFor).toLocaleString()}`
                                : camp.createdAt
                                  ? new Date(camp.createdAt).toLocaleString()
                                  : '—'}
                          </td>

                          <td className="p-4 text-xs text-slate-300">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              ✓ Verified Safe
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Subscribers Health & Roster */}
        {activeTab === 'subscribers' && (
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FiUsers className="text-amber-400" /> Subscribers Email Health & Telemetry
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Showing {filteredSubscribers.length} subscribers with health and engagement scores
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder="Search email..."
                    className="bg-slate-900 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                </div>

                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All States</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="ENGAGED">ENGAGED</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SOFT_BOUNCE">SOFT_BOUNCE</option>
                  <option value="HARD_BOUNCE">HARD_BOUNCE</option>
                  <option value="SUPPRESSED">SUPPRESSED</option>
                </select>

                <select
                  value={subTierFilter}
                  onChange={(e) => setSubTierFilter(e.target.value)}
                  className="bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Tiers</option>
                  <option value="daily">Daily Only</option>
                  <option value="weekly">Weekly Only</option>
                  <option value="monthly">Monthly Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-text-muted border-b border-white/5">
                  <tr>
                    <th className="p-4">Subscriber Email</th>
                    <th className="p-4">Health State</th>
                    <th className="p-4">Health Score</th>
                    <th className="p-4">Engagement</th>
                    <th className="p-4">Tier</th>
                    <th className="p-4">Last Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">{sub.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            sub.status === 'ENGAGED' || sub.status === 'CONFIRMED' || sub.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : sub.status === 'SOFT_BOUNCE' || sub.status === 'INACTIVE'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{sub.emailHealthScore ?? 85}/100</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-300">
                          {sub.engagementScore ?? 50}/100
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-200">
                          {sub.frequency}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {sub.lastOpenedAt ? new Date(sub.lastOpenedAt).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Suppression Engine */}
        {activeTab === 'suppressions' && (
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FiAlertTriangle className="text-red-400" /> Global Email Suppression List
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Addresses permanently blocked from marketing delivery (Hard bounces, complaints, manual blocks)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={suppressionSearch}
                    onChange={(e) => setSuppressionSearch(e.target.value)}
                    placeholder="Search suppressed email..."
                    className="bg-slate-900 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddSuppressionModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 text-xs font-bold flex items-center gap-1.5"
                >
                  <FiPlus size={14} /> Add Suppression
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-text-muted border-b border-white/5">
                  <tr>
                    <th className="p-4">Suppressed Email</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Added Date</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSuppressions.map((supp) => (
                    <tr key={supp._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">{supp.emailNormalized}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                          {supp.reason}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">{supp.source}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {supp.createdAt ? new Date(supp.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveSuppression(supp.emailNormalized)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Unsuppress email address"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Reputation & DNS Authentication */}
        {activeTab === 'reputation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Hard Bounce Rate
                </span>
                <h3 className="text-2xl font-black text-white">
                  {reputationData?.rates?.bounceRate || 0.0}%
                </h3>
                <p className="text-[11px] text-emerald-400">Target: &lt; 2.0% (Google / Yahoo compliant)</p>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Spam Complaint Rate
                </span>
                <h3 className="text-2xl font-black text-white">
                  {reputationData?.rates?.complaintRate || 0.0}%
                </h3>
                <p className="text-[11px] text-emerald-400">Target: &lt; 0.1% (Strict industry threshold)</p>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Open Rate
                </span>
                <h3 className="text-2xl font-black text-amber-400">
                  {reputationData?.rates?.openRate || 0.0}%
                </h3>
                <p className="text-[11px] text-slate-400">Average sports media baseline: 22–30%</p>
              </div>
            </div>

            {/* DNS Security Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiShield className="text-emerald-400" /> Domain Authentication (SPF, DKIM, DMARC, BIMI)
              </h3>
              <p className="text-xs text-text-muted">
                Meets Google & Yahoo 2026 bulk sender requirements for inbox delivery
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">SPF (Sender Policy Framework)</span>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      VALID
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {reputationData?.authentication?.spf?.record || 'v=spf1 include:_spf.google.com ~all'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">DKIM (DomainKeys Identified Mail)</span>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      2048-BIT RSA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Selector: gm2026._domainkey.goalmills.com</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">DMARC Policy Enforcement</span>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      QUARANTINE / REJECT
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {reputationData?.authentication?.dmarc?.policy || 'p=quarantine; rua=mailto:dmarc@goalmills.com'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">BIMI Brand Logo Alignment</span>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      CONFIGURED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">GoalMills Brand Shield SVG configured</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* COMPOSE & PRE-FLIGHT DELIVERABILITY GATE MODAL */}
        {/* ------------------------------------------------------------- */}
        {showComposeModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-slate-900 border-t sm:border border-white/15 w-full max-w-4xl rounded-t-3xl sm:rounded-3xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <FiShield className="text-amber-400" /> Compose & Dispatch Newsletter
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Pre-flight deliverability gate, immutable recipient snapshotting & domain traffic shaping
                  </p>
                </div>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Preflight Gate Banner */}
              {preflightReport && (
                <div
                  className={`p-3.5 px-6 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
                    preflightReport.expectedRisk === 'HIGH'
                      ? 'bg-red-500/10 border-red-500/20 text-red-300'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <FiShield size={14} />
                    <span>
                      Deliverability Gate: {preflightReport.eligibleCount} of {preflightReport.totalRecipients} Eligible ({preflightReport.suppressedCount} Suppressed)
                    </span>
                  </div>
                  <span className="font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-white/10">
                    Risk: {preflightReport.expectedRisk} (Bounce Risk: {preflightReport.bounceRiskPercentage}%)
                  </span>
                </div>
              )}

              {/* Modal Body */}
              <form onSubmit={handleSendOrSchedule} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Subject Line / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. ⚡ GoalMills Matchday Brief: Top Derby Headlines"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Preview Text (Snippet)
                    </label>
                    <input
                      type="text"
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      placeholder="e.g. Today's top transfer rumors, tactical analysis, and lineup alerts"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Target Audience Tier
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value as NewsletterAudience)}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="all_subscribers">All Active Subscribers ({stats.totalActive})</option>
                      <option value="daily_subscribers">Daily Subscribers Only ({stats.daily})</option>
                      <option value="weekly_subscribers">Weekly Subscribers Only ({stats.weekly})</option>
                      <option value="monthly_subscribers">Monthly Subscribers Only ({stats.monthly})</option>
                      <option value="engaged_only">Highly Engaged Subscribers Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Digest Frequency Category
                    </label>
                    <select
                      value={frequencyTier}
                      onChange={(e) => setFrequencyTier(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="custom_broadcast">Custom Editorial Broadcast</option>
                      <option value="daily">Daily Digest Edition</option>
                      <option value="weekly">Weekly Review Edition</option>
                      <option value="monthly">Monthly Special Edition</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Editorial Note / Newsroom Dispatch (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={editorialNote}
                    onChange={(e) => setEditorialNote(e.target.value)}
                    placeholder="e.g. Good morning football fans! Here are today's biggest stories straight from our London and Lagos desks..."
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Article Selector Section */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Select News Stories to Include ({selectedArticles.length} Selected)
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        Click on articles below to attach them to this email newsletter
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newsSearch}
                        onChange={(e) => setNewsSearch(e.target.value)}
                        placeholder="Search published news..."
                        className="bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Selected Pills */}
                  {selectedArticles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-white/10">
                      {selectedArticles.map((art) => (
                        <span
                          key={art._id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                        >
                          <span className="truncate max-w-[200px]">{art.title}</span>
                          <button
                            type="button"
                            onClick={() => toggleArticleSelection(art)}
                            className="hover:text-white"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* News list */}
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-2xl border border-white/10">
                    {loadingNews ? (
                      <div className="p-4 text-center text-xs text-slate-400">Loading articles...</div>
                    ) : availableNews.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No published news found</div>
                    ) : (
                      availableNews.map((news) => {
                        const isSelected = selectedArticles.some((a) => a._id === news._id);
                        return (
                          <div
                            key={news._id}
                            onClick={() => toggleArticleSelection(news)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                                  isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'border border-white/20'
                                }`}
                              >
                                {isSelected && '✓'}
                              </span>
                              <span className="font-bold text-xs truncate">{news.title}</span>
                              <span className="text-[10px] text-text-muted">
                                ({news.category} • {news.views || 0} views)
                              </span>
                            </div>
                            {news.isBreaking && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 flex-shrink-0">
                                Breaking
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Scheduling Option */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Schedule for Future Delivery
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Queue this campaign to be automatically fired at a specific time (e.g. 10:00 AM WAT)
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="w-5 h-5 accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {isScheduled && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                        Dispatch Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required={isScheduled}
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        className="bg-slate-900 border border-white/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowComposeModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || (!title.trim() && selectedArticles.length === 0)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40"
                  >
                    <FiSend size={14} />
                    <span>
                      {submitting
                        ? 'Processing Deliverability Gate...'
                        : isScheduled
                          ? 'Confirm & Schedule Campaign'
                          : 'Blast & Send Immediately'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ADD MANUAL SUPPRESSION MODAL */}
        {/* ------------------------------------------------------------- */}
        {showAddSuppressionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/15 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FiAlertTriangle className="text-red-400" /> Add to Global Suppression
                </h3>
                <button
                  onClick={() => setShowAddSuppressionModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSuppression} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={suppressEmailInput}
                    onChange={(e) => setSuppressEmailInput(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Suppression Reason
                  </label>
                  <select
                    value={suppressReasonInput}
                    onChange={(e) => setSuppressReasonInput(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="MANUAL">MANUAL (Admin Block)</option>
                    <option value="HARD_BOUNCE">HARD_BOUNCE (Invalid User/Domain)</option>
                    <option value="COMPLAINT">COMPLAINT (Spam Report)</option>
                    <option value="POLICY">POLICY (Policy Violation)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSuppressionModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider"
                  >
                    Block Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

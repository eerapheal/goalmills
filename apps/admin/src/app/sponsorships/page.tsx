'use client';

import React, { useState, useEffect } from 'react';
import {
  FiDollarSign,
  FiPlus,
  FiTrendingUp,
  FiEye,
  FiExternalLink,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiPauseCircle,
  FiFilter,
  FiRefreshCw,
  FiTarget,
  FiSmartphone,
  FiMonitor,
  FiPieChart,
  FiZap,
} from 'react-icons/fi';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function SponsorshipManagementPage() {
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlacement, setFilterPlacement] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTenant, setFilterTenant] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    sponsorName: '',
    sponsorLogo: '',
    type: 'banner',
    placement: 'homepage_hero',
    targetUrl: '',
    imageUrl: '',
    tagline: '',
    ctaText: 'Learn More',
    sportSlug: 'all',
    badgeText: 'SPONSORED',
    status: 'active',
    priority: 1,
    budget: '',
    tenantId: 'default',
    tenantSlug: 'goalmills',
    targeting: {
      sports: ['all'],
      competitions: [] as string[],
      teams: [] as string[],
      devices: ['all'],
      countries: [] as string[],
    },
    budgetControls: {
      dailyBudget: '',
      maxImpressions: '',
      maxClicks: '',
      cpmRate: '',
      cpcRate: '',
      pacing: 'asap',
    },
  });

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants || []);
      }
    } catch (err) {
      // Fallback
    }
  };

  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPlacement !== 'all') params.set('placement', filterPlacement);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterTenant !== 'all') params.set('tenantId', filterTenant);

      const res = await fetch(`/api/sponsorships?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSponsorships(data.sponsorships || []);
      }
    } catch (err) {
      console.error('Error fetching sponsorships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    fetchSponsorships();
  }, [filterPlacement, filterStatus, filterTenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...formData,
        priority: Number(formData.priority) || 1,
        budget: formData.budget ? Number(formData.budget) : undefined,
        budgetControls: {
          dailyBudget: formData.budgetControls.dailyBudget ? Number(formData.budgetControls.dailyBudget) : undefined,
          maxImpressions: formData.budgetControls.maxImpressions ? Number(formData.budgetControls.maxImpressions) : undefined,
          maxClicks: formData.budgetControls.maxClicks ? Number(formData.budgetControls.maxClicks) : undefined,
          cpmRate: formData.budgetControls.cpmRate ? Number(formData.budgetControls.cpmRate) : undefined,
          cpcRate: formData.budgetControls.cpcRate ? Number(formData.budgetControls.cpcRate) : undefined,
          pacing: formData.budgetControls.pacing || 'asap',
        },
      };

      const url = editingId ? `/api/sponsorships/${editingId}` : '/api/sponsorships';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingId(null);
        resetForm();
        fetchSponsorships();
      } else {
        alert(data.error || 'Failed to save sponsorship');
      }
    } catch (err) {
      console.error('Error saving sponsorship:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to move this sponsorship to trash?')) return;
    try {
      const res = await fetch(`/api/sponsorships/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchSponsorships();
      }
    } catch (err) {
      console.error('Error deleting sponsorship:', err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/sponsorships/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSponsorships();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const openEditModal = (item: any) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || '',
      sponsorName: item.sponsorName || '',
      sponsorLogo: item.sponsorLogo || '',
      type: item.type || 'banner',
      placement: item.placement || 'homepage_hero',
      targetUrl: item.targetUrl || '',
      imageUrl: item.imageUrl || '',
      tagline: item.tagline || '',
      ctaText: item.ctaText || 'Learn More',
      sportSlug: item.sportSlug || 'all',
      badgeText: item.badgeText || 'SPONSORED',
      status: item.status || 'active',
      priority: item.priority || 1,
      budget: item.budget ? String(item.budget) : '',
      tenantId: item.tenantId || 'default',
      tenantSlug: item.tenantSlug || 'goalmills',
      targeting: {
        sports: item.targeting?.sports?.length ? item.targeting.sports : ['all'],
        competitions: item.targeting?.competitions || [],
        teams: item.targeting?.teams || [],
        devices: item.targeting?.devices?.length ? item.targeting.devices : ['all'],
        countries: item.targeting?.countries || [],
      },
      budgetControls: {
        dailyBudget: item.budgetControls?.dailyBudget ? String(item.budgetControls.dailyBudget) : '',
        maxImpressions: item.budgetControls?.maxImpressions ? String(item.budgetControls.maxImpressions) : '',
        maxClicks: item.budgetControls?.maxClicks ? String(item.budgetControls.maxClicks) : '',
        cpmRate: item.budgetControls?.cpmRate ? String(item.budgetControls.cpmRate) : '',
        cpcRate: item.budgetControls?.cpcRate ? String(item.budgetControls.cpcRate) : '',
        pacing: item.budgetControls?.pacing || 'asap',
      },
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      sponsorName: '',
      sponsorLogo: '',
      type: 'banner',
      placement: 'homepage_hero',
      targetUrl: '',
      imageUrl: '',
      tagline: '',
      ctaText: 'Learn More',
      sportSlug: 'all',
      badgeText: 'SPONSORED',
      status: 'active',
      priority: 1,
      budget: '',
      tenantId: 'default',
      tenantSlug: 'goalmills',
      targeting: {
        sports: ['all'],
        competitions: [],
        teams: [],
        devices: ['all'],
        countries: [],
      },
      budgetControls: {
        dailyBudget: '',
        maxImpressions: '',
        maxClicks: '',
        cpmRate: '',
        cpcRate: '',
        pacing: 'asap',
      },
    });
  };

  // Metrics summary
  const totalImpressions = sponsorships.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
  const totalClicks = sponsorships.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const totalSpent = sponsorships.reduce((acc, curr) => acc + (curr.spent || 0), 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FiDollarSign className="w-6 h-6" />
            </span>
            Sponsorship & Ad Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage multi-tenant commercial partnerships, contextual banner slots, telemetry pacing, and real-time CTR analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSponsorships}
            className="p-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Campaigns"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white shadow-lg shadow-emerald-950/40 hover:from-emerald-400 hover:to-teal-500 transition active:scale-95 text-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Analytics Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141C2B] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Campaigns</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold">
              {sponsorships.filter((s) => s.status === 'active').length} Active
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-2">{sponsorships.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141C2B] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Impressions</span>
            <FiEye className="text-emerald-400 w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {totalImpressions.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141C2B] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Clicks & CTR</span>
            <FiTrendingUp className="text-amber-400 w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white mt-2 flex items-baseline gap-2">
            <span>{totalClicks.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-400">({overallCtr}% CTR)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141C2B] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Ad Spend / Value</span>
            <FiPieChart className="text-teal-400 w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <FiFilter className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Tenant Filter */}
        <select
          value={filterTenant}
          onChange={(e) => setFilterTenant(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-[#141C2B] border border-white/10 text-xs text-white focus:outline-none"
        >
          <option value="all">All Organizations</option>
          <option value="default">GoalMills Master (default)</option>
          {tenants.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.slug})
            </option>
          ))}
        </select>

        {/* Placement Filter */}
        <select
          value={filterPlacement}
          onChange={(e) => setFilterPlacement(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-[#141C2B] border border-white/10 text-xs text-white focus:outline-none"
        >
          <option value="all">All Placements</option>
          <option value="homepage_hero">Homepage Hero Banner</option>
          <option value="sports_pulse">Sports Pulse Section</option>
          <option value="article_inline">Inline Article Ad</option>
          <option value="breaking_ticker">Breaking Ticker</option>
          <option value="video_preroll">Video Pre-roll</option>
          <option value="mobile_interstitial">Mobile Interstitial</option>
          <option value="match_details">Match Details Placement</option>
          <option value="newsletter_footer">Newsletter Sponsor</option>
          <option value="global_sidebar">Global Sidebar</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-[#141C2B] border border-white/10 text-xs text-white focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired / Capped</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {/* Campaigns Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <GoalmillsLoader size="lg" label="Loading Sponsorships" />
        </div>
      ) : sponsorships.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-white/10 bg-[#141C2B]">
          <FiDollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Sponsorship Campaigns Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Create your first commercial partnership or banner placement to monetize audience engagement.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#141C2B] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 text-xs uppercase text-slate-400 bg-white/[0.02]">
                <tr>
                  <th className="py-3 px-4">Campaign & Sponsor</th>
                  <th className="py-3 px-3">Organization</th>
                  <th className="py-3 px-3">Placement</th>
                  <th className="py-3 px-3">Targeting</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Impressions</th>
                  <th className="py-3 px-3 text-center">Clicks</th>
                  <th className="py-3 px-3 text-center">CTR</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sponsorships.map((item) => {
                  const impressions = item.impressions || 0;
                  const clicks = item.clicks || 0;
                  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
                  const isCapped =
                    (item.budgetControls?.maxImpressions && impressions >= item.budgetControls.maxImpressions) ||
                    (item.budget && item.spent && item.spent >= item.budget);

                  return (
                    <tr key={item._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                              <FiDollarSign className="text-emerald-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white text-sm line-clamp-1">{item.title}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="font-medium text-emerald-400">{item.sponsorName}</span>
                              <span>•</span>
                              <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-white/5">
                                {item.badgeText || 'SPONSOR'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.tenantSlug || 'goalmills'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-xs">
                        <span className="capitalize text-slate-300 font-medium">
                          {item.placement?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <FiTarget className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.sportSlug || 'all'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.status === 'paused'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {item.status === 'active' ? (
                            <FiCheckCircle className="w-3 h-3" />
                          ) : (
                            <FiPauseCircle className="w-3 h-3" />
                          )}
                          <span className="capitalize">{item.status}</span>
                          {isCapped && <span className="text-[10px] text-amber-300">(Capped)</span>}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center text-xs font-semibold text-slate-200">
                        {impressions.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-center text-xs font-semibold text-slate-200">
                        {clicks.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {ctr}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(item._id, item.status)}
                            title={item.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                          >
                            {item.status === 'active' ? (
                              <FiPauseCircle className="w-4 h-4 text-amber-400" />
                            ) : (
                              <FiCheckCircle className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                          <a
                            href={item.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                            title="Preview Destination URL"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition"
                            title="Edit Campaign"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition"
                            title="Move to Trash"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Creation / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#141C2B] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiDollarSign className="text-emerald-400" />
                  {editingId ? 'Edit Sponsorship Campaign' : 'Create New Sponsorship Campaign'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure commercial placement, multi-tenant scoping, and telemetry budget controls.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Organization / Tenant Scoping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Target Organization (Tenant) *</label>
                  <select
                    value={formData.tenantId}
                    onChange={(e) => {
                      const selectedTenant = tenants.find((t) => t._id === e.target.value);
                      setFormData({
                        ...formData,
                        tenantId: e.target.value,
                        tenantSlug: selectedTenant ? selectedTenant.slug : 'goalmills',
                      });
                    }}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="default">GoalMills Master (Global/Default)</option>
                    {tenants.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Placement Slot *</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="homepage_hero">Homepage Hero Banner</option>
                    <option value="sports_pulse">Sports Pulse Section</option>
                    <option value="article_inline">Inline Article Ad</option>
                    <option value="breaking_ticker">Breaking Ticker Banner</option>
                    <option value="video_preroll">Video Pre-roll Card</option>
                    <option value="mobile_interstitial">Mobile App Interstitial</option>
                    <option value="match_details">Match Details Placement</option>
                    <option value="newsletter_footer">Newsletter Footer Sponsor</option>
                    <option value="global_sidebar">Global Sidebar</option>
                  </select>
                </div>
              </div>

              {/* Title and Sponsor Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. VIP Matchday Pass 2026"
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Sponsor / Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.sponsorName}
                    onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                    placeholder="e.g. Puma Sports"
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target URL */}
              <div>
                <label className="text-xs font-semibold text-slate-300">Target Destination URL *</label>
                <input
                  type="url"
                  required
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="https://partner.com/deal"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Image & Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Creative Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Sponsor Logo URL</label>
                  <input
                    type="url"
                    value={formData.sponsorLogo}
                    onChange={(e) => setFormData({ ...formData, sponsorLogo: e.target.value })}
                    placeholder="https://logo.png"
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tagline & CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Tagline / Message</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Live stats and real-time score updates"
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="Claim VIP Pass"
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Budget Controls Section */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <FiZap className="w-3.5 h-3.5" /> Budget & Telemetry Controls
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Total Budget ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="e.g. 500.00"
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Max Impressions Cap</label>
                    <input
                      type="number"
                      value={formData.budgetControls.maxImpressions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetControls: { ...formData.budgetControls, maxImpressions: e.target.value },
                        })
                      }
                      placeholder="e.g. 100000"
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">CPM Rate ($ / 1k imp)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.budgetControls.cpmRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetControls: { ...formData.budgetControls, cpmRate: e.target.value },
                        })
                      }
                      placeholder="e.g. 2.50"
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Priority Weight (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Campaign Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/50"
                >
                  {editingId ? 'Update Campaign' : 'Publish Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

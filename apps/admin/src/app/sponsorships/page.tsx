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
} from 'react-icons/fi';
import { GoalmillsLoader } from '@/components/GoalmillsLoader';

export default function SponsorshipManagementPage() {
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlacement, setFilterPlacement] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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
  });

  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/sponsorships?placement=${filterPlacement}&status=${filterStatus}`
      );
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
    fetchSponsorships();
  }, [filterPlacement, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/sponsorships/${editingId}` : '/api/sponsorships';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
    });
  };

  // Metrics summary
  const totalImpressions = sponsorships.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
  const totalClicks = sponsorships.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
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
              Sponsorship Management
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Control branded partnerships, commercial hero placements, affiliate campaigns, and live CTR analytics.
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
              <span>Create Sponsorship</span>
            </button>
          </div>
        </div>

        {/* Analytics Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#141C2B] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Campaigns</span>
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold">
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
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <FiFilter className="w-3.5 h-3.5" /> Filters:
          </span>
          <select
            value={filterPlacement}
            onChange={(e) => setFilterPlacement(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#141C2B] border border-white/10 text-xs text-white focus:outline-none"
          >
            <option value="all">All Placements</option>
            <option value="homepage_hero">Homepage Hero Banner</option>
            <option value="sports_pulse">Sports Pulse Section</option>
            <option value="match_details">Match Details Placement</option>
            <option value="newsletter_footer">Newsletter Sponsor</option>
            <option value="global_sidebar">Global Sidebar</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#141C2B] border border-white/10 text-xs text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused</option>
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
                    <th className="py-3 px-3">Placement</th>
                    <th className="py-3 px-3">Sport</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Impressions</th>
                    <th className="py-3 px-3 text-center">Clicks</th>
                    <th className="py-3 px-3 text-center">CTR</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sponsorships.map((item) => {
                    const ctr =
                      item.impressions > 0
                        ? ((item.clicks / item.impressions) * 100).toFixed(1)
                        : '0.0';

                    return (
                      <tr key={item._id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.sponsorName}
                                className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-xs flex-shrink-0">
                                AD
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white">{item.title}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                                <span>{item.sponsorName}</span>
                                {item.targetUrl && (
                                  <a
                                    href={item.targetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:underline inline-flex items-center"
                                  >
                                    <FiExternalLink className="w-3 h-3 ml-0.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {item.placement.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3 capitalize text-xs text-slate-300">
                          {item.sportSlug}
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleStatus(item._id, item.status)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition ${
                              item.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {item.status === 'active' ? (
                              <>
                                <FiCheckCircle className="w-3 h-3" /> Active
                              </>
                            ) : (
                              <>
                                <FiPauseCircle className="w-3 h-3" /> Paused
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-center font-semibold text-white">
                          {(item.impressions || 0).toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-center font-semibold text-white">
                          {(item.clicks || 0).toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-emerald-400">
                          {ctr}%
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                            title="Edit Campaign"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                            title="Delete Campaign"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#141C2B] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white">
                  {editingId ? 'Edit Sponsorship Campaign' : 'Create New Sponsorship'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Campaign Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. VIP Sports Betting Partner 2026"
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Sponsor Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.sponsorName}
                      onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                      placeholder="e.g. GoalBet Global"
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Placement Slot *</label>
                    <select
                      value={formData.placement}
                      onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="homepage_hero">Homepage Hero Banner</option>
                      <option value="sports_pulse">Sports Pulse Section</option>
                      <option value="match_details">Match Details Placement</option>
                      <option value="newsletter_footer">Newsletter Footer Sponsor</option>
                      <option value="global_sidebar">Global Sidebar</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Sport Targeting</label>
                    <select
                      value={formData.sportSlug}
                      onChange={(e) => setFormData({ ...formData, sportSlug: e.target.value as any })}
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="all">All Sports</option>
                      <option value="football">Football Only</option>
                      <option value="cricket">Cricket Only</option>
                      <option value="basketball">Basketball Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Target Destination URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    placeholder="https://partner.com/goalmills-offer"
                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Tagline / Message</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="Get 100% deposit match up to $500"
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">CTA Button Text</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      placeholder="Claim Offer"
                      className="mt-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Priority Weight</label>
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
                    <label className="text-xs font-semibold text-slate-300">Status</label>
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
                    {editingId ? 'Update Campaign' : 'Publish Sponsorship'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}

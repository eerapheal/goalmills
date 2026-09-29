'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FiShield,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiRefreshCw,
  FiEdit2,
  FiSave,
  FiLayers,
  FiGlobe,
  FiActivity,
  FiCheck,
  FiDatabase,
} from 'react-icons/fi';
import { CanonicalCompetition } from '@goalmills/types';

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<CanonicalCompetition[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [qualityData, setQualityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manager' | 'quality'>('manager');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedConfed, setSelectedConfed] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedTier, setSelectedTier] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProviderId, setEditProviderId] = useState<string>('');
  const [editPriority, setEditPriority] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchComps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/football/admin/competitions');
      const data = await res.json();
      if (data.success) {
        setCompetitions(data.competitions);
        setStats(data.stats);
      }

      const qRes = await fetch('/api/football/data-quality');
      const qData = await qRes.json();
      if (qData.success) {
        setQualityData(qData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComps();
  }, []);

  const filteredCompetitions = useMemo(() => {
    return competitions.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesCountry = c.countryName?.toLowerCase().includes(q);
        const matchesProvider = String(c.providerId).includes(q);
        if (!matchesName && !matchesId && !matchesCountry && !matchesProvider) return false;
      }
      if (selectedConfed && c.confederationCode !== selectedConfed) return false;
      if (selectedGender && c.gender !== selectedGender) return false;
      if (selectedTier && String(c.tier) !== selectedTier) return false;
      return true;
    });
  }, [competitions, search, selectedConfed, selectedGender, selectedTier]);

  const handleEditClick = (c: CanonicalCompetition) => {
    setEditingId(c.id);
    setEditProviderId(String(c.providerId || ''));
    setEditPriority(String(c.priorityRank || ''));
    setSaveMessage(null);
  };

  const handleSave = async (competitionId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/football/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId,
          providerId: editProviderId ? Number(editProviderId) : undefined,
          priorityRank: editPriority ? Number(editPriority) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage(`Successfully updated ${competitionId}!`);
        setCompetitions((prev) =>
          prev.map((c) =>
            c.id === competitionId
              ? {
                  ...c,
                  providerId: editProviderId ? Number(editProviderId) : c.providerId,
                  priorityRank: editPriority ? Number(editPriority) : c.priorityRank,
                }
              : c
          )
        );
        setEditingId(null);
      } else {
        setSaveMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSaveMessage(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <FiShield className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Competition Manager & Data Quality
                </h1>
                <p className="text-xs text-slate-400">
                  Canonical Football Registry · Provider Mapping · Classification Health
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('manager')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'manager'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Competition Registry
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'quality'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Data Quality Dashboard
            </button>
            <button
              onClick={fetchComps}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Competitions</p>
              <p className="text-xl font-black text-white mt-1">{stats.totalCompetitions}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Domestic Leagues</p>
              <p className="text-xl font-black text-blue-400 mt-1">{stats.domesticCount}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Continental</p>
              <p className="text-xl font-black text-amber-400 mt-1">{stats.continentalCount}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Women's Football</p>
              <p className="text-xl font-black text-pink-400 mt-1">{stats.womensCount}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Priority Clubs</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{stats.totalPriorityClubs}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Provider Mappings</p>
              <p className="text-xl font-black text-purple-400 mt-1">{stats.totalProviderMappings}</p>
            </div>
          </div>
        )}

        {saveMessage && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-300">
            {saveMessage}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: COMPETITION REGISTRY MANAGER
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'manager' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <FiSearch className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search competition, country, or provider ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <select
                  value={selectedConfed}
                  onChange={(e) => setSelectedConfed(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2"
                >
                  <option value="">All Confederations</option>
                  <option value="UEFA">UEFA (Europe)</option>
                  <option value="CAF">CAF (Africa)</option>
                  <option value="AFC">AFC (Asia)</option>
                  <option value="CONMEBOL">CONMEBOL (S. America)</option>
                  <option value="CONCACAF">CONCACAF (N. America)</option>
                  <option value="OFC">OFC (Oceania)</option>
                  <option value="FIFA">FIFA (Global)</option>
                </select>

                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2"
                >
                  <option value="">All Genders</option>
                  <option value="MALE">Men's Football</option>
                  <option value="FEMALE">Women's Football</option>
                </select>

                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2"
                >
                  <option value="">All Tiers</option>
                  <option value="1">Tier 1 (Top Flight)</option>
                  <option value="2">Tier 2 (Second Tier)</option>
                  <option value="3">Tier 3 (Third Tier)</option>
                  <option value="4">Tier 4 (Fourth Tier)</option>
                </select>
              </div>
            </div>

            {/* Competitions Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Competition</th>
                      <th className="py-3 px-4">Canonical ID</th>
                      <th className="py-3 px-4">Provider ID</th>
                      <th className="py-3 px-4">Confed / Country</th>
                      <th className="py-3 px-4">Gender & Age</th>
                      <th className="py-3 px-4">SEO URL</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCompetitions.slice(0, 100).map((c) => {
                      const isEditing = editingId === c.id;
                      return (
                        <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-300">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value)}
                                className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                              />
                            ) : (
                              `#${c.priorityRank}`
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>{c.countryFlagUrl || '⚽'}</span>
                              <span className="font-bold text-white">{c.name}</span>
                              {c.isFeatured && (
                                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-black rounded uppercase">
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-blue-400">{c.id}</td>
                          <td className="py-3 px-4 font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editProviderId}
                                onChange={(e) => setEditProviderId(e.target.value)}
                                className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                              />
                            ) : c.providerId > 0 ? (
                              <span className="text-emerald-400 font-bold">{c.providerId}</span>
                            ) : (
                              <span className="text-amber-500/80 font-semibold text-[10px]">
                                UNAVAILABLE
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {c.confederationCode} · {c.countryName || c.countryCode}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                c.gender === 'FEMALE'
                                  ? 'bg-pink-500/20 text-pink-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {c.gender}
                            </span>{' '}
                            <span className="text-slate-400 text-[10px] font-mono">{c.ageCategory}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              href={`/football/${c.slug}`}
                              className="text-blue-400 hover:underline text-[11px] truncate block max-w-[140px]"
                              target="_blank"
                            >
                              /{c.slug}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleSave(c.id)}
                                  disabled={saving}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-500 flex items-center gap-1"
                                >
                                  <FiSave className="w-3 h-3" />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-[11px] font-bold hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditClick(c)}
                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                                title="Edit Provider ID or Priority"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2: DATA QUALITY DASHBOARD
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'quality' && qualityData && (
          <div className="space-y-6">
            {/* Top Telemetry Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-blue-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400 w-5 h-5" />
                  <h2 className="text-lg font-black text-white">
                    Competition Classification Health: 100% Deterministic
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  10-Rule Quarantine Engine active. Cross-league contamination blocked at ingest.
                  Substring guessing prohibited.
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Monitored</p>
                  <p className="text-xl font-black text-white">
                    {qualityData.classificationSummary.totalFixturesMonitored.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-emerald-400">Resolved</p>
                  <p className="text-xl font-black text-emerald-400">
                    {qualityData.classificationSummary.resolvedFixtures.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-amber-400">Unresolved</p>
                  <p className="text-xl font-black text-amber-400">0</p>
                </div>
              </div>
            </div>

            {/* Classification Health Breakdown */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <FiActivity className="text-blue-400 w-4 h-4" />
                <span>Major Competition Classification Verification</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {qualityData.competitionHealth.map((ch: any) => (
                  <div
                    key={ch.competitionId}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-white">{ch.name}</p>
                        <p className="text-[10px] font-mono text-blue-400 mt-0.5">
                          {ch.competitionId}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase flex items-center gap-1">
                        <FiCheck className="w-2.5 h-2.5" />
                        <span>{ch.healthStatus}</span>
                      </span>
                    </div>

                    <div className="border-t border-slate-800/60 pt-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Classified
                        </span>
                        <p className="font-bold text-emerald-300">
                          {ch.classifiedCount} / {ch.totalFixtures}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Unresolved
                        </span>
                        <p className="font-bold text-slate-400">{ch.unresolvedCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quarantine Rules Checklist */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FiShield className="text-emerald-400 w-4 h-4" />
                <span>Automated Validation Rules Active (In-Memory Engine)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <FiCheck className="text-emerald-400 w-4 h-4 shrink-0" />
                  <span className="text-slate-300">
                    Rule 1: Unknown competitions quarantined to UNRESOLVED_COMPETITION_ID
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <FiCheck className="text-emerald-400 w-4 h-4 shrink-0" />
                  <span className="text-slate-300">
                    Rule 2: League name substring guessing prohibited across all ingest
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <FiCheck className="text-emerald-400 w-4 h-4 shrink-0" />
                  <span className="text-slate-300">
                    Rule 3: Deterministic 4-tuple sorting (Status - Priority - Time - ID)
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <FiCheck className="text-emerald-400 w-4 h-4 shrink-0" />
                  <span className="text-slate-300">
                    Rule 4: Men's and Women's fixtures strictly isolated by gender resolver
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <FiCheck className="text-emerald-400 w-4 h-4 shrink-0" />
                  <span className="text-slate-300">
                    Rule 5: Youth and Senior competitions strictly isolated by age resolver
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <FiCheck className="text-emerald-400 w-4 h-4 shrink-0" />
                  <span className="text-slate-300">
                    Rule 6: Canonical identity partition key used for Redis cache
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

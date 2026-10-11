'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiCheck,
  FiDollarSign,
  FiAward,
  FiGlobe,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi';

interface PlayerFormData {
  _id?: string;
  name: string;
  slug: string;
  number: number;
  position: string;
  nationality: string;
  countryFlag: string;
  africanOrigin: boolean;
  clubName: string;
  clubSlug: string;
  competitionSlug: string;
  photo: string;
  age: number;
  height: string;
  marketValue: string;
  contractUntil: string;
  weeklyWage: string;
  releaseClause: string;
  agent: string;
  marketValueTrend: 'up' | 'down' | 'stable';
  bio: string;
  externalPlayerKey?: string;
  externalTeamKey?: string;
  seasonStats: {
    appearances: number;
    goals: number;
    assists: number;
    yellowCards: number;
    passAccuracy: string;
    rating: number;
  };
}

const EMPTY_PLAYER: PlayerFormData = {
  name: '',
  slug: '',
  number: 9,
  position: 'Striker / Forward',
  nationality: 'Nigeria',
  countryFlag: '🇳🇬',
  africanOrigin: true,
  clubName: 'Galatasaray',
  clubSlug: 'galatasaray',
  competitionSlug: 'premier-league',
  photo: '',
  age: 26,
  height: '185 cm',
  marketValue: '€75.00M',
  contractUntil: 'June 2028',
  weeklyWage: '€150,000',
  releaseClause: '€80.00M',
  agent: '',
  marketValueTrend: 'up',
  bio: '',
  externalPlayerKey: '',
  externalTeamKey: '',
  seasonStats: {
    appearances: 20,
    goals: 15,
    assists: 5,
    yellowCards: 2,
    passAccuracy: '82%',
    rating: 8.0,
  },
};

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<PlayerFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAfrican, setFilterAfrican] = useState<'all' | 'african' | 'global'>('all');
  const [filterCompetition, setFilterCompetition] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerFormData | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>(EMPTY_PLAYER);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      if (data.success) {
        setPlayers(data.players || []);
      }
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchClub = p.clubName.toLowerCase().includes(q);
        const matchNat = p.nationality.toLowerCase().includes(q);
        const matchPos = p.position.toLowerCase().includes(q);
        if (!matchName && !matchClub && !matchNat && !matchPos) return false;
      }
      if (filterAfrican === 'african' && !p.africanOrigin) return false;
      if (filterAfrican === 'global' && p.africanOrigin) return false;
      if (filterCompetition !== 'all' && p.competitionSlug !== filterCompetition) return false;
      return true;
    });
  }, [players, search, filterAfrican, filterCompetition]);

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setFormData(EMPTY_PLAYER);
    setShowModal(true);
  };

  const handleOpenEdit = (p: PlayerFormData) => {
    setEditingPlayer(p);
    setFormData({ ...p });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPlayer?._id) {
        // Update
        const res = await fetch(`/api/players/${editingPlayer._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', `Player '${formData.name}' updated successfully!`);
          setShowModal(false);
          fetchPlayers();
        } else {
          showNotification('error', data.error || 'Failed to update player');
        }
      } else {
        // Create
        const res = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showNotification('success', `Player '${formData.name}' created successfully!`);
          setShowModal(false);
          fetchPlayers();
        } else {
          showNotification('error', data.error || 'Failed to create player');
        }
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error saving player');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message || 'Player deleted');
        setDeleteId(null);
        fetchPlayers();
      } else {
        showNotification('error', data.error || 'Failed to delete');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error deleting player');
    }
  };

  const handleSeedSuperstars = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/players/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message || 'Superstars initialized!');
        fetchPlayers();
      } else {
        showNotification('error', data.error || 'Seeding failed');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error seeding database');
    } finally {
      setLoading(false);
    }
  };

  const africanCount = players.filter((p) => p.africanOrigin).length;

  return (
    <div className="min-h-screen bg-[#060D18] text-slate-100 p-4 sm:p-8 pt-24 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/admin/competitions" className="hover:text-white transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span className="text-amber-400">Players CRUD Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/football/players"
              target="_blank"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
            >
              <span>View Live Hub</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-[#08142A] via-[#0B1E3E] to-[#060D18] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider mb-2">
                <FiUsers className="text-amber-400" />
                <span>DYNAMIC PLAYERS ENGINE</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                African Superstars &amp; Players Manager
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Add, edit, or manage dynamic player profiles, authentic market valuations, weekly wages,
                contract durations, and official stats. No mock data is used.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSeedSuperstars}
                className="px-4 py-2.5 rounded-xl bg-[#0F2244] hover:bg-[#16305C] border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
                title="Initialize baseline authentic African superstars into database"
              >
                <FiRefreshCw className="text-blue-400" />
                <span>Sync African Stars</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <FiPlus size={16} />
                <span>Add New Player</span>
              </button>
            </div>
          </div>

          {/* KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-[#091529]/80 border border-blue-500/20">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Players</span>
              <span className="text-xl sm:text-2xl font-black text-white">{players.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#091529]/80 border border-amber-500/20">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">African Superstars</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">{africanCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#091529]/80 border border-blue-500/20">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Global Talents</span>
              <span className="text-xl sm:text-2xl font-black text-blue-400">{players.length - africanCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#091529]/80 border border-emerald-500/20">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Data Mode</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">100% Dynamic</span>
            </div>
          </div>
        </div>

        {/* Feedback Message Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)}>
              <FiX size={14} />
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-[#0A162B] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search player, club, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <select
              value={filterAfrican}
              onChange={(e) => setFilterAfrican(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-xs text-slate-200 focus:outline-none focus:border-amber-400/50"
            >
              <option value="all">All Origins</option>
              <option value="african">African Stars Only</option>
              <option value="global">Global Stars Only</option>
            </select>

            <select
              value={filterCompetition}
              onChange={(e) => setFilterCompetition(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-xs text-slate-200 focus:outline-none focus:border-amber-400/50"
            >
              <option value="all">All Competitions</option>
              <option value="premier-league">Premier League</option>
              <option value="caf-champions-league">CAF Champions League</option>
              <option value="la-liga">La Liga</option>
              <option value="serie-a">Serie A</option>
              <option value="ligue-1">Ligue 1</option>
              <option value="bundesliga">Bundesliga</option>
            </select>

            <button
              onClick={fetchPlayers}
              className="p-2 rounded-xl bg-[#060E1C] border border-blue-500/20 hover:border-amber-400 text-slate-300 hover:text-white transition-colors"
              title="Reload from Database"
            >
              <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Players List Table */}
        <div className="rounded-3xl border border-blue-500/20 bg-[#0A162B] overflow-hidden shadow-xl">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#07101E] text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-4">Origin / Flag</th>
                  <th className="py-3.5 px-4">Club &amp; Comp</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Market Value</th>
                  <th className="py-3.5 px-4">Weekly Wage</th>
                  <th className="py-3.5 px-4">Contract</th>
                  <th className="py-3.5 px-4">Goals / Ast</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <FiRefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                      Loading dynamic player records...
                    </td>
                  </tr>
                ) : filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 space-y-2">
                      <p className="text-sm font-bold text-white">No players found</p>
                      <p className="text-xs">
                        Click &quot;Add New Player&quot; or &quot;Sync African Stars&quot; to populate your dynamic database.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((p) => (
                    <tr key={p._id || p.slug} className="hover:bg-blue-600/10 transition-colors group">
                      {/* Player info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                            <img
                              src={
                                p.photo ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  p.name
                                )}&background=07101E&color=38BDF8&size=64&bold=true`
                              }
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  p.name
                                )}&background=07101E&color=38BDF8&size=64&bold=true`;
                              }}
                            />
                          </div>
                          <div>
                            <Link
                              href={`/football/players/${p.slug}`}
                              target="_blank"
                              className="font-bold text-white hover:text-amber-400 transition-colors flex items-center gap-1.5"
                            >
                              <span>{p.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">#{p.number}</span>
                            </Link>
                            <p className="text-[10px] text-slate-400">Age {p.age} · {p.height}</p>
                          </div>
                        </div>
                      </td>

                      {/* Origin */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span>{p.countryFlag || '🌍'}</span>
                          <span className="text-slate-300 font-medium">{p.nationality}</span>
                        </div>
                        {p.africanOrigin && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            African Star
                          </span>
                        )}
                      </td>

                      {/* Club */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{p.clubName}</div>
                        <div className="text-[10px] text-slate-500 capitalize">
                          {p.competitionSlug.replace(/-/g, ' ')}
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold">
                          {p.position}
                        </span>
                      </td>

                      {/* Market Value */}
                      <td className="py-3 px-4">
                        <span className="font-black text-amber-400 text-sm font-mono">{p.marketValue}</span>
                      </td>

                      {/* Wage */}
                      <td className="py-3 px-4 font-mono text-slate-300">{p.weeklyWage || '—'}</td>

                      {/* Contract */}
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{p.contractUntil || '—'}</td>

                      {/* Season stats */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-bold text-white">
                          <span className="text-yellow-400">{p.seasonStats?.goals ?? 0}G</span> /{' '}
                          <span className="text-blue-400">{p.seasonStats?.assists ?? 0}A</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ★ {p.seasonStats?.rating ?? 7.2}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-[#0F2038] hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors"
                            title="Edit Player"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteId(p._id || p.slug)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors"
                            title="Delete Player"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form for Add / Edit */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-3xl rounded-3xl border border-blue-500/30 bg-[#0B182E] p-6 sm:p-8 shadow-2xl my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {editingPlayer ? `Edit Player: ${editingPlayer.name}` : 'Add New Football Superstar'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Saves dynamically to MongoDB for immediate display across the web app.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                {/* Basic Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Player Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Victor Osimhen"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Position *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g. Striker / Forward"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Squad Number
                    </label>
                    <input
                      type="number"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value, 10) || 9 })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Country and Origin Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="e.g. Nigeria"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Country Flag Emoji
                    </label>
                    <input
                      type="text"
                      value={formData.countryFlag}
                      onChange={(e) => setFormData({ ...formData, countryFlag: e.target.value })}
                      placeholder="e.g. 🇳🇬"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.africanOrigin}
                        onChange={(e) => setFormData({ ...formData, africanOrigin: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-[#060E1C] border-blue-500/30"
                      />
                      <span className="text-xs font-bold text-amber-400 uppercase">
                        Spotlight as African Superstar
                      </span>
                    </label>
                  </div>
                </div>

                {/* Club and Competition Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Club Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.clubName}
                      onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                      placeholder="e.g. Galatasaray (Loan from Napoli)"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Competition *
                    </label>
                    <select
                      value={formData.competitionSlug}
                      onChange={(e) => setFormData({ ...formData, competitionSlug: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="premier-league">Premier League</option>
                      <option value="caf-champions-league">CAF Champions League</option>
                      <option value="la-liga">La Liga</option>
                      <option value="serie-a">Serie A</option>
                      <option value="ligue-1">Ligue 1</option>
                      <option value="bundesliga">Bundesliga</option>
                      <option value="champions-league">UEFA Champions League</option>
                    </select>
                  </div>
                </div>

                {/* Image and Valuation Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Photo / Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                      placeholder="https://.../player.png"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Market Value
                    </label>
                    <input
                      type="text"
                      value={formData.marketValue}
                      onChange={(e) => setFormData({ ...formData, marketValue: e.target.value })}
                      placeholder="e.g. €75.00M"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Weekly Wage
                    </label>
                    <input
                      type="text"
                      value={formData.weeklyWage}
                      onChange={(e) => setFormData({ ...formData, weeklyWage: e.target.value })}
                      placeholder="e.g. €160,000"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Contract & Age Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Contract Until
                    </label>
                    <input
                      type="text"
                      value={formData.contractUntil}
                      onChange={(e) => setFormData({ ...formData, contractUntil: e.target.value })}
                      placeholder="e.g. June 2027"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Release Clause
                    </label>
                    <input
                      type="text"
                      value={formData.releaseClause}
                      onChange={(e) => setFormData({ ...formData, releaseClause: e.target.value })}
                      placeholder="e.g. €75.00M"
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 25 })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="p-3.5 rounded-2xl bg-[#060E1C] border border-blue-500/20 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                    2026/2027 Season Performance Metrics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Appearances</label>
                      <input
                        type="number"
                        value={formData.seasonStats.appearances}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats,
                              appearances: parseInt(e.target.value, 10) || 0,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A162B] border border-white/10 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Goals</label>
                      <input
                        type="number"
                        value={formData.seasonStats.goals}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats,
                              goals: parseInt(e.target.value, 10) || 0,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A162B] border border-white/10 text-amber-400 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Assists</label>
                      <input
                        type="number"
                        value={formData.seasonStats.assists}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats,
                              assists: parseInt(e.target.value, 10) || 0,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A162B] border border-white/10 text-blue-400 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Rating</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.seasonStats.rating}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seasonStats: {
                              ...formData.seasonStats,
                              rating: parseFloat(e.target.value) || 7.2,
                            },
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A162B] border border-white/10 text-emerald-400 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Scouting Bio */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Scouting Intel &amp; Biography
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="In-depth tactical scouting report, attributes, and key strengths..."
                    className="w-full px-3 py-2 rounded-xl bg-[#060E1C] border border-blue-500/20 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase tracking-wider hover:from-amber-400 hover:to-orange-400 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingPlayer ? 'Update Player' : 'Create Player'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-rose-500/30 bg-[#0B182E] p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl">
                <FiTrash2 />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Delete Player Profile?</h4>
                <p className="text-xs text-slate-400 mt-1">
                  This player will be permanently removed from the database and public directory.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

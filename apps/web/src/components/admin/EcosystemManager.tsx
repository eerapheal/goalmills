'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../Toast';
import {
  FiCompass,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiLayers,
  FiAward,
  FiShield,
  FiUser,
  FiTag,
  FiFilter,
  FiGlobe,
  FiInfo,
} from 'react-icons/fi';
import CategoryManager from './CategoryManager';

export type EcosystemTab = 'all' | 'sport' | 'competition' | 'club' | 'player' | 'categories';

interface EcosystemItem {
  _id: string;
  type: 'sport' | 'competition' | 'club' | 'player';
  name: string;
  slug: string;
  shortName?: string;
  sportSlug?: string;
  sportName?: string;
  competitionSlug?: string;
  competitionName?: string;
  clubSlug?: string;
  clubName?: string;
  country?: string;
  logo?: string;
  photo?: string;
  position?: string;
  nationality?: string;
  number?: number;
  marketValue?: string;
  description?: string;
  isFeatured?: boolean;
  tier?: number;
  order?: number;
  isCustom?: boolean;
}

export default function EcosystemManager() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<EcosystemTab>('all');
  const [entities, setEntities] = useState<EcosystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCustomOnly, setFilterCustomOnly] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EcosystemItem | null>(null);
  const [formData, setFormData] = useState({
    type: 'competition' as 'sport' | 'competition' | 'club' | 'player',
    name: '',
    slug: '',
    shortName: '',
    sportSlug: 'football',
    sportName: 'Football',
    competitionSlug: '',
    competitionName: '',
    clubSlug: '',
    clubName: '',
    country: '',
    logo: '',
    photo: '',
    position: 'Forward',
    nationality: '',
    number: '',
    marketValue: '',
    description: '',
    isFeatured: false,
    tier: 1,
    order: 0,
  });

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ecosystem');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setEntities(json.data);
        }
      } else {
        toast.error('Failed to load ecosystem entities');
      }
    } catch (error) {
      console.error('Error fetching ecosystem:', error);
      toast.error('Network error fetching ecosystem');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // Derived lists for dropdowns
  const availableSports = useMemo(() => {
    return entities.filter((e) => e.type === 'sport');
  }, [entities]);

  const availableCompetitions = useMemo(() => {
    return entities.filter((e) => e.type === 'competition');
  }, [entities]);

  const availableClubs = useMemo(() => {
    return entities.filter((e) => e.type === 'club');
  }, [entities]);

  // Filtered entities for view
  const filteredEntities = useMemo(() => {
    return entities.filter((item) => {
      if (activeTab !== 'all' && activeTab !== 'categories' && item.type !== activeTab) {
        return false;
      }
      if (filterCustomOnly && !item.isCustom) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSlug = item.slug.toLowerCase().includes(q);
        const matchesShort = item.shortName?.toLowerCase().includes(q);
        const matchesCountry = item.country?.toLowerCase().includes(q);
        const matchesNat = item.nationality?.toLowerCase().includes(q);
        const matchesClub = item.clubName?.toLowerCase().includes(q);
        return matchesName || matchesSlug || matchesShort || matchesCountry || matchesNat || matchesClub;
      }
      return true;
    });
  }, [entities, activeTab, filterCustomOnly, searchQuery]);

  const handleOpenCreate = (preselectedType?: 'sport' | 'competition' | 'club' | 'player') => {
    const targetType =
      preselectedType ||
      (activeTab === 'sport' || activeTab === 'competition' || activeTab === 'club' || activeTab === 'player'
        ? activeTab
        : 'competition');

    setEditingItem(null);
    setFormData({
      type: targetType,
      name: '',
      slug: '',
      shortName: '',
      sportSlug: 'football',
      sportName: 'Football',
      competitionSlug: availableCompetitions[0]?.slug || '',
      competitionName: availableCompetitions[0]?.name || '',
      clubSlug: availableClubs[0]?.slug || '',
      clubName: availableClubs[0]?.name || '',
      country: '',
      logo: '',
      photo: '',
      position: 'Forward',
      nationality: '',
      number: '',
      marketValue: '',
      description: '',
      isFeatured: false,
      tier: 1,
      order: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EcosystemItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      name: item.name,
      slug: item.slug,
      shortName: item.shortName || '',
      sportSlug: item.sportSlug || 'football',
      sportName: item.sportName || '',
      competitionSlug: item.competitionSlug || '',
      competitionName: item.competitionName || '',
      clubSlug: item.clubSlug || '',
      clubName: item.clubName || '',
      country: item.country || '',
      logo: item.logo || '',
      photo: item.photo || '',
      position: item.position || 'Forward',
      nationality: item.nationality || '',
      number: item.number !== undefined ? String(item.number) : '',
      marketValue: item.marketValue || '',
      description: item.description || '',
      isFeatured: Boolean(item.isFeatured),
      tier: item.tier || 1,
      order: item.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingItem ? prev.slug : autoSlug,
      shortName: prev.shortName || val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Entity name is required');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        type: formData.type,
        name: formData.name.trim(),
        slug:
          formData.slug.trim() ||
          formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        shortName: formData.shortName.trim() || formData.name.trim(),
        sportSlug: formData.sportSlug,
        sportName:
          availableSports.find((s) => s.slug === formData.sportSlug)?.name || formData.sportName,
        country: formData.country,
        logo: formData.logo,
        photo: formData.photo,
        description: formData.description,
        isFeatured: formData.isFeatured,
        order: Number(formData.order) || 0,
      };

      if (formData.type === 'competition') {
        payload.tier = Number(formData.tier) || 1;
      }

      if (formData.type === 'club') {
        payload.competitionSlug = formData.competitionSlug;
        payload.competitionName =
          availableCompetitions.find((c) => c.slug === formData.competitionSlug)?.name ||
          formData.competitionName;
      }

      if (formData.type === 'player') {
        payload.competitionSlug = formData.competitionSlug;
        payload.clubSlug = formData.clubSlug;
        payload.clubName =
          availableClubs.find((c) => c.slug === formData.clubSlug)?.name || formData.clubName;
        payload.position = formData.position;
        payload.nationality = formData.nationality;
        payload.number = formData.number ? Number(formData.number) : undefined;
        payload.marketValue = formData.marketValue;
      }

      let res;
      if (editingItem && editingItem.isCustom) {
        res = await fetch(`/api/ecosystem/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/ecosystem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (res.ok && (json.success || json.data)) {
        toast.success(
          editingItem ? 'Ecosystem entity updated!' : `Custom ${formData.type} created successfully!`
        );
        setIsModalOpen(false);
        fetchEntities();
      } else {
        toast.error(json.message || 'Failed to save ecosystem entity');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: EcosystemItem) => {
    if (!item.isCustom) {
      toast.error('Built-in preset entities cannot be deleted directly.');
      return;
    }
    if (!confirm(`Are you sure you want to delete custom ${item.type} "${item.name}"?`)) {
      return;
    }

    setDeletingId(item._id);
    try {
      const res = await fetch(`/api/ecosystem/${item._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`${item.name} deleted successfully!`);
        fetchEntities();
      } else {
        toast.error(json.message || 'Failed to delete entity');
      }
    } catch (error) {
      toast.error('Error deleting entity');
    } finally {
      setDeletingId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      all: entities.length,
      sport: entities.filter((e) => e.type === 'sport').length,
      competition: entities.filter((e) => e.type === 'competition').length,
      club: entities.filter((e) => e.type === 'club').length,
      player: entities.filter((e) => e.type === 'player').length,
      custom: entities.filter((e) => e.isCustom).length,
    };
  }, [entities]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-white/10 bg-slate-900/50">
          <div className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
            <FiCompass className="text-blue-400" /> Total Entities
          </div>
          <div className="text-2xl font-black text-white mt-1">{counts.all}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/10 bg-slate-900/50">
          <div className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
            <FiAward className="text-amber-400" /> Sports
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{counts.sport}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/10 bg-slate-900/50">
          <div className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
            <FiGlobe className="text-emerald-400" /> Leagues
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{counts.competition}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/10 bg-slate-900/50">
          <div className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
            <FiShield className="text-purple-400" /> Clubs
          </div>
          <div className="text-2xl font-black text-purple-400 mt-1">{counts.club}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/10 bg-slate-900/50">
          <div className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
            <FiUser className="text-cyan-400" /> Players
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{counts.player}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-blue-500/20 bg-blue-500/10">
          <div className="text-xs text-blue-300 font-bold uppercase flex items-center gap-1.5">
            <FiLayers className="text-blue-400" /> Publisher Custom
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1">{counts.custom}</div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between glass-card p-4 rounded-2xl border border-white/10">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Entities ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab('sport')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sport'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Sports ({counts.sport})
          </button>
          <button
            onClick={() => setActiveTab('competition')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'competition'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Leagues ({counts.competition})
          </button>
          <button
            onClick={() => setActiveTab('club')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'club'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Clubs ({counts.club})
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'player'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Players ({counts.player})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Categories & Tags
          </button>
        </div>

        {activeTab !== 'categories' && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Custom Only Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer bg-white/5 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={filterCustomOnly}
                onChange={(e) => setFilterCustomOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-900 border-white/20"
              />
              <span>Custom Only ({counts.custom})</span>
            </label>

            {/* Quick Refresh */}
            <button
              onClick={fetchEntities}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
              title="Refresh Registry"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Add Entity Button */}
            <button
              onClick={() => handleOpenCreate()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
            >
              <FiPlus /> Add Custom Entity
            </button>
          </div>
        )}
      </div>

      {activeTab === 'categories' ? (
        <CategoryManager />
      ) : (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sports, competitions, clubs, players, country, nationality..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Table / Grid */}
          {loading && entities.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 rounded-2xl animate-pulse">
              <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
              Loading ecosystem entities registry...
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto text-xl">
                <FiCompass />
              </div>
              <p className="text-white font-bold text-base">No ecosystem entities found</p>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                No items match your filter criteria. Click &quot;Add Custom Entity&quot; to create a new custom
                sport, competition, club, or player.
              </p>
              <button
                onClick={() => handleOpenCreate()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors"
              >
                <FiPlus /> Create Custom Entity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredEntities.map((item) => {
                const typeColors = {
                  sport: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  competition: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  club: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                  player: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                };

                const typeIcons = {
                  sport: <FiAward className="text-amber-400" />,
                  competition: <FiGlobe className="text-emerald-400" />,
                  club: <FiShield className="text-purple-400" />,
                  player: <FiUser className="text-cyan-400" />,
                };

                return (
                  <div
                    key={`${item.type}-${item.slug}-${item._id}`}
                    className="glass-card p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-3 bg-slate-900/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.logo || item.photo ? (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.logo || item.photo}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-lg shrink-0">
                            {typeIcons[item.type]}
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-black text-white leading-snug flex items-center gap-1.5">
                            {item.name}
                            {item.isCustom && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                Custom
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            /{item.slug}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                          typeColors[item.type]
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    {/* Metadata summary */}
                    <div className="text-xs text-slate-400 space-y-1 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      {item.type === 'sport' && (
                        <div>Default ecosystem tag for cross-sport auto distribution</div>
                      )}
                      {item.type === 'competition' && (
                        <div className="flex items-center justify-between">
                          <span>Country: {item.country || 'International'}</span>
                          <span>Tier: {item.tier || 1}</span>
                        </div>
                      )}
                      {item.type === 'club' && (
                        <div className="flex items-center justify-between">
                          <span>Short: {item.shortName || item.name}</span>
                          <span className="truncate max-w-[130px]">
                            {item.competitionName || item.competitionSlug || 'General'}
                          </span>
                        </div>
                      )}
                      {item.type === 'player' && (
                        <div className="flex items-center justify-between">
                          <span>{item.position || 'Player'}</span>
                          <span>{item.nationality || 'Pro'}</span>
                          <span>{item.clubName || item.clubSlug || ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                      {item.isCustom ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-400 hover:text-white hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                          >
                            <FiEdit2 /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item._id}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <FiTrash2 /> {deletingId === item._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
                        >
                          <FiPlus /> Clone / Customize
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-3xl border border-white/10 bg-slate-950/95 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FiCompass className="text-blue-400" />
                  {editingItem ? `Edit ${editingItem.name}` : `Add Custom ${formData.type.toUpperCase()}`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Custom entities will instantly appear in all publishing selectors across GoalMills
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Entity Type Picker (Only when creating new) */}
              {!editingItem && (
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                    Select Entity Level / Type *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['sport', 'competition', 'club', 'player'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, type: t }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                          formData.type === t
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                    Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={
                      formData.type === 'sport'
                        ? 'e.g. Formula 1'
                        : formData.type === 'competition'
                          ? 'e.g. CAF Champions League'
                          : formData.type === 'club'
                            ? 'e.g. Al Ahly SC'
                            : 'e.g. Percy Tau'
                    }
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
                      }))
                    }
                    placeholder="e.g. formula-1"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sport Selector if Competition / Club / Player */}
              {formData.type !== 'sport' && (
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                    Parent Sport
                  </label>
                  <select
                    value={formData.sportSlug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sportSlug: e.target.value,
                        sportName:
                          availableSports.find((s) => s.slug === e.target.value)?.name ||
                          e.target.value,
                      }))
                    }
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {availableSports.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Competition Specifics */}
              {formData.type === 'competition' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                      Country / Region
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                      placeholder="e.g. Africa / England / International"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                      Competition Tier (1 = Premier)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.tier}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, tier: Number(e.target.value) }))
                      }
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Club Specifics */}
              {formData.type === 'club' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                      Short Name / Ticker
                    </label>
                    <input
                      type="text"
                      value={formData.shortName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, shortName: e.target.value }))
                      }
                      placeholder="e.g. Al Ahly"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                      League / Competition
                    </label>
                    <select
                      value={formData.competitionSlug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          competitionSlug: e.target.value,
                          competitionName:
                            availableCompetitions.find((c) => c.slug === e.target.value)?.name || '',
                        }))
                      }
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">None / Independent</option>
                      {availableCompetitions.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Player Specifics */}
              {formData.type === 'player' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                        Position
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, position: e.target.value }))
                        }
                        placeholder="e.g. Striker / Winger / Guard"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, nationality: e.target.value }))
                        }
                        placeholder="e.g. South Africa / Nigeria"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                        Squad Number
                      </label>
                      <input
                        type="number"
                        value={formData.number}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, number: e.target.value }))
                        }
                        placeholder="e.g. 10"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                      Club / Team
                    </label>
                    <select
                      value={formData.clubSlug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          clubSlug: e.target.value,
                          clubName:
                            availableClubs.find((c) => c.slug === e.target.value)?.name || '',
                        }))
                      }
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">None / Free Agent</option>
                      {availableClubs.map((club) => (
                        <option key={club.slug} value={club.slug}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Media Asset: Logo / Photo */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                  {formData.type === 'player' ? 'Player Photo URL' : 'Badge / Logo URL'}
                </label>
                <input
                  type="url"
                  value={formData.type === 'player' ? formData.photo : formData.logo}
                  onChange={(e) =>
                    setFormData((prev) =>
                      formData.type === 'player'
                        ? { ...prev, photo: e.target.value }
                        : { ...prev, logo: e.target.value }
                    )
                  }
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                  Description / Bio
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief overview or bio for entity hub..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <FiCheck /> {saving ? 'Saving...' : editingItem ? 'Update Entity' : 'Create Custom Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

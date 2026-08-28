'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { POPULAR_TEAMS } from '@/lib/newsUtils';
import { COMPETITIONS_REGISTRY, CLUBS_REGISTRY, PLAYERS_REGISTRY } from '@/lib/entityService';
import EnterpriseNewsEditor from './EnterpriseNewsEditor';
import {
  FiUploadCloud,
  FiFileText,
  FiStar,
  FiZap,
  FiTag,
  FiLayers,
  FiImage,
  FiAward,
  FiShield,
  FiUser,
  FiCompass,
} from 'react-icons/fi';
import { ArticleType } from '@goalmills/types';

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

export default function CreateNewsForm() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('Premier League');
  const [customCategory, setCustomCategory] = useState('');

  // 4-Level Content Ecosystem Selectors
  const [sport, setSport] = useState('Football');
  const [sportSlug, setSportSlug] = useState('football');
  const [competitionSlug, setCompetitionSlug] = useState('premier-league');
  const [selectedClubSlug, setSelectedClubSlug] = useState('arsenal');
  const [selectedPlayerSlug, setSelectedPlayerSlug] = useState('victor-osimhen');
  const [articleType, setArticleType] = useState<ArticleType>('news');

  const [tags, setTags] = useState('');
  const [relatedTeam, setRelatedTeam] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImage(data.url);
        toast.success('Cover image uploaded successfully');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalCategory = category === '__custom__' ? customCategory.trim() : category;
    if (!finalCategory) {
      toast.error('Please select or specify a category');
      setLoading(false);
      return;
    }

    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Please enter article content');
      setLoading(false);
      return;
    }

    // Resolve entities
    const comp = COMPETITIONS_REGISTRY[competitionSlug];
    const club = CLUBS_REGISTRY[selectedClubSlug];
    const player = PLAYERS_REGISTRY[selectedPlayerSlug];

    const teams = club ? [{ id: club.id, name: club.name, slug: club.slug, logo: club.logo }] : [];
    const players = player
      ? [{ id: player.id, name: player.name, slug: player.slug, photo: player.photo }]
      : [];

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          image,
          source,
          category: finalCategory,
          sport,
          sportSlug,
          competition: comp?.name || undefined,
          competitionSlug: comp?.slug || undefined,
          teams,
          players,
          articleType,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          relatedTeam: club?.shortName || relatedTeam.trim(),
          isBreaking,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('News story created and cross-distributed across entity hubs!');
        setTitle('');
        setExcerpt('');
        setContent('');
        setImage('');
        setSource('');
        setTags('');
        setRelatedTeam('');
        setIsBreaking(false);
        setIsFeatured(false);
      } else {
        toast.error(data.message || 'Failed to create news article.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-7 rounded-3xl h-fit space-y-6 max-w-full">
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>⚡</span> Entity-First Publishing Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Content is tagged to sports, competitions, clubs, and player profiles for instant
            cross-distribution.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title & Source */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiFileText className="text-blue-400" /> Article Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-base font-semibold focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Victor Osimhen Scores Twice in Thrilling Match..."
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Editorial Source
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. GoalMills Desk, Sky Sports"
            />
          </div>
        </div>

        {/* 4-Level Content Ecosystem Mapping Grid */}
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4">
          <span className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
            <FiCompass /> Content Ecosystem Mapping (Auto-Distribution)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Sport Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">
                Level 1: Sport
              </label>
              <select
                value={sportSlug}
                onChange={(e) => {
                  setSportSlug(e.target.value);
                  setSport(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
                }}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="cricket">Cricket</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>

            {/* Competition Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">
                Level 2: Competition
              </label>
              <select
                value={competitionSlug}
                onChange={(e) => setCompetitionSlug(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                {Object.values(COMPETITIONS_REGISTRY).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Club Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">
                Level 3: Primary Club
              </label>
              <select
                value={selectedClubSlug}
                onChange={(e) => setSelectedClubSlug(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="">None / General</option>
                {Object.values(CLUBS_REGISTRY).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Player Selector */}
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">
                Level 3: Featured Player
              </label>
              <select
                value={selectedPlayerSlug}
                onChange={(e) => setSelectedPlayerSlug(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="">None / Squad General</option>
                {Object.values(PLAYERS_REGISTRY).map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} ({p.nationality})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Article Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">
                Article Type
              </label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value as ArticleType)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="news">Breaking News / Standard Story</option>
                <option value="transfer">Transfer News / Rumour / Done Deal</option>
                <option value="tactical_analysis">Tactical Match Analysis</option>
                <option value="player_analysis">Player Scouting Deep Dive</option>
                <option value="match_report">Official Match Report</option>
                <option value="feature">Editorial Feature / Long Read</option>
                <option value="interview">Exclusive Interview</option>
                <option value="prediction">Match Preview & Prediction</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-bold uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="__custom__">+ Custom Category...</option>
              </select>
            </div>
          </div>
        </div>

        {/* Keywords & Tags */}
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FiTag className="text-blue-400" /> Keywords & Entity Tags (Comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. Victor Osimhen, Arsenal, Champions League, Done Deal"
          />
        </div>

        {/* Lead Excerpt */}
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            Lead Excerpt / Social Meta Summary *
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
            placeholder="Brief punchy summary of the story for SEO meta tags and social embeds..."
          />
        </div>

        {/* Cover Hero Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-slate-900/40 p-4 rounded-2xl border border-white/5">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiImage className="text-blue-400" /> Cover Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              Or Upload Cover File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 transition-all cursor-pointer"
            />
          </div>
        </div>
        {uploading && (
          <div className="text-xs text-blue-400 animate-pulse font-bold">
            Uploading cover image...
          </div>
        )}

        {/* Flags & Toggles */}
        <div className="flex flex-wrap items-center gap-6 py-3 border-t border-b border-white/5">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-white/10 border-white/20"
            />
            <span className="flex items-center gap-1">
              <FiZap className="text-red-500" /> Mark as Breaking News
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-white/10 border-white/20"
            />
            <span className="flex items-center gap-1">
              <FiStar className="text-amber-400" /> Feature on Top Picks
            </span>
          </label>
        </div>

        {/* Enterprise Rich News Editor */}
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Article Body (Enterprise Studio) *</span>
            <span className="text-[11px] text-blue-400 font-normal">
              Copy-paste formatted docs or attach media
            </span>
          </label>
          <EnterpriseNewsEditor
            value={content}
            onChange={setContent}
            placeholder="Paste your story from Word/Google Docs or start typing here..."
            minHeight="380px"
          />
        </div>

        {/* Publish Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider py-4 rounded-2xl transition-all hover:scale-[1.005] shadow-xl shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>{loading ? 'Publishing & Distributing...' : 'Publish to Sports Network'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

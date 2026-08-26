'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '../Toast';
import { POPULAR_TEAMS } from '@/lib/newsUtils';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
          setCategory(data[0].name);
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
      if (res.ok) {
        setImage(data.url);
        toast.success('Image uploaded successfully');
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
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          relatedTeam: relatedTeam.trim(),
          isBreaking,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('News article created successfully!');
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
    <div className="glass-card p-6 rounded-2xl h-fit space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📰</span> Create News Article
          </h2>
          <p className="text-xs text-text-muted">
            Publish rich stories with responsive layouts & multi-filter tags
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
              placeholder="Article Title"
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
              Source
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
              placeholder="e.g. ESPN, Sky Sports, GoalMills Desk"
            />
          </div>
        </div>

        {/* Dynamic Category Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="__custom__">+ Custom Category...</option>
            </select>
          </div>

          {category === '__custom__' ? (
            <div>
              <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
                Custom Category Name *
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                placeholder="e.g. World Cup 2026"
              />
            </div>
          ) : (
            <div>
              <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
                Related Team (For Favorite Team News)
              </label>
              <input
                type="text"
                list="teams-list"
                value={relatedTeam}
                onChange={(e) => setRelatedTeam(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                placeholder="e.g. Arsenal, Real Madrid, Lakers"
              />
              <datalist id="teams-list">
                {POPULAR_TEAMS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
            Tags (Comma separated keywords)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
            placeholder="e.g. Arsenal, Premier League, Bukayo Saka, Champions League"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
            Excerpt *
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
            placeholder="Brief punchy summary of the article..."
          />
        </div>

        {/* Cover Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
              Or Upload Image File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 transition-all cursor-pointer"
            />
          </div>
        </div>
        {uploading && <div className="text-xs text-blue-400 animate-pulse">Uploading image...</div>}

        {/* Flags & Toggles */}
        <div className="flex flex-wrap items-center gap-6 py-2 border-t border-b border-white/5">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-white/10 border-white/20"
            />
            <span>🔥 Mark as Breaking News</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-white/10 border-white/20"
            />
            <span>⭐ Feature on Homepage / Top Picks</span>
          </label>
        </div>

        {/* Rich Text Editor */}
        <div>
          <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
            Article Content (Rich Text)
          </label>
          <div className="bg-white/95 rounded-xl text-black overflow-hidden min-h-[280px]">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              style={{ height: '220px', marginBottom: '40px' }}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-secondary/20 disabled:opacity-50"
          >
            {loading ? 'Publishing Story...' : 'Publish News Story'}
          </button>
        </div>
      </form>
    </div>
  );
}

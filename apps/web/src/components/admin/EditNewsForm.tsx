'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../Toast';
import { POPULAR_TEAMS } from '@/lib/newsUtils';
import EnterpriseNewsEditor from './EnterpriseNewsEditor';
import { FiUploadCloud, FiFileText, FiStar, FiZap, FiTag, FiLayers, FiImage } from 'react-icons/fi';

interface EditNewsFormProps {
  id: string;
}

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

export default function EditNewsForm({ id }: EditNewsFormProps) {
  const toast = useToast();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [tags, setTags] = useState('');
  const [relatedTeam, setRelatedTeam] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch categories and article details
    Promise.all([
      fetch('/api/categories').then((res) => res.json()),
      fetch(`/api/news/${id}`).then((res) => res.json()),
    ])
      .then(([cats, article]) => {
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
        if (article && !article.message) {
          setTitle(article.title || '');
          setExcerpt(article.excerpt || '');
          setContent(article.content || '');
          setImage(article.image || '');
          setSource(article.source || '');
          setCategory(article.category || 'General');
          setTags(Array.isArray(article.tags) ? article.tags.join(', ') : '');
          setRelatedTeam(article.relatedTeam || '');
          setIsBreaking(Boolean(article.isBreaking));
          setIsFeatured(Boolean(article.isFeatured));
        } else {
          toast.error(article.message || 'Article not found');
        }
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        toast.error('Error fetching article data');
      })
      .finally(() => {
        setFetching(false);
      });
  }, [id, toast]);

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
      toast.error('Category is required');
      setLoading(false);
      return;
    }

    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Please enter article content');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PUT',
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
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          relatedTeam: relatedTeam.trim(),
          isBreaking,
          isFeatured,
        }),
      });

      if (res.ok) {
        toast.success('News article updated successfully!');
        setTimeout(() => router.push('/admin/news'), 1200);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update news article.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="glass-card p-12 text-center text-white rounded-3xl animate-pulse flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-sm font-bold text-slate-300">Loading article editor studio...</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-7 rounded-3xl h-fit space-y-6 max-w-full">
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>📝</span> Edit News Story
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Update content, signed media, categories, and SEO keywords
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
              placeholder="e.g. Article Title"
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
              placeholder="e.g. GoalMills Desk, Reuters"
            />
          </div>
        </div>

        {/* Category & Related Team */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiLayers className="text-blue-400" /> Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
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
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Custom Category Name *
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
                className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Champions League"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Related Team (For Team Hub Feeds)
              </label>
              <input
                type="text"
                list="teams-list"
                value={relatedTeam}
                onChange={(e) => setRelatedTeam(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
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
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FiTag className="text-blue-400" /> Keywords & SEO Tags (Comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. Arsenal, Bukayo Saka, Champions League"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            Lead Excerpt / Social Summary *
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
            placeholder="Brief summary of the article..."
          />
        </div>

        {/* Cover Hero Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-slate-900/40 p-4 rounded-2xl border border-white/5">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiImage className="text-blue-400" /> Cover Hero Image URL
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
          <div className="text-xs text-blue-400 animate-pulse font-bold">Uploading image...</div>
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
              Edit formatted docs or attach signed media
            </span>
          </label>
          <EnterpriseNewsEditor
            value={content}
            onChange={setContent}
            placeholder="Edit story content..."
            minHeight="380px"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase tracking-wider py-3.5 rounded-2xl transition-all text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider py-3.5 rounded-2xl transition-all hover:scale-[1.005] shadow-xl shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Updating Story...' : 'Save & Update News Story'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

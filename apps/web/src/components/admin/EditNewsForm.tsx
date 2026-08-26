'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useToast } from '../Toast';
import { POPULAR_TEAMS } from '@/lib/newsUtils';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
      toast.error('Category is required');
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
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
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
    return <div className="p-8 text-white animate-pulse">Loading article data...</div>;
  }

  const isKnownCategory = categories.some((c) => c.name === category);

  return (
    <div className="glass-card p-6 rounded-2xl h-fit space-y-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>📝</span> Edit News Article
      </h2>

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
              placeholder="e.g. ESPN, BBC"
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
              value={isKnownCategory ? category : '__custom__'}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setCategory('__custom__');
                  setCustomCategory(category);
                } else {
                  setCategory(e.target.value);
                }
              }}
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

          {category === '__custom__' || !isKnownCategory ? (
            <div>
              <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
                Custom Category Name *
              </label>
              <input
                type="text"
                value={customCategory || (!isKnownCategory ? category : '')}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setCategory(e.target.value);
                }}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                placeholder="e.g. World Cup 2026"
              />
            </div>
          ) : (
            <div>
              <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
                Related Team (Favorite Team Filtering)
              </label>
              <input
                type="text"
                list="teams-edit-list"
                value={relatedTeam}
                onChange={(e) => setRelatedTeam(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
                placeholder="e.g. Arsenal, Real Madrid, Lakers"
              />
              <datalist id="teams-edit-list">
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
            Tags (Comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-secondary transition-colors"
            placeholder="e.g. Arsenal, Premier League, Bukayo Saka"
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
            placeholder="Brief summary..."
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
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
              Or Upload Image
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
            <span>🔥 Breaking News</span>
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

        {/* Content */}
        <div>
          <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
            Content
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

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Updating Story...' : 'Update News Story'}
          </button>
        </div>
      </form>
    </div>
  );
}

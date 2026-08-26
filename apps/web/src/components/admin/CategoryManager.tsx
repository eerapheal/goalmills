'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../Toast';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiCheck, FiX, FiLayers } from 'react-icons/fi';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isFeatured?: boolean;
  order?: number;
  createdAt?: string;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F97316', // Orange
  '#14B8A6', // Teal
];

export default function CategoryManager() {
  const toast = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('football');
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading categories');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setColor('#3B82F6');
    setIcon('football');
    setIsFeatured(false);
    setOrder(categories.length + 1);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setColor(cat.color || '#3B82F6');
    setIcon(cat.icon || 'football');
    setIsFeatured(Boolean(cat.isFeatured));
    setOrder(cat.order || 0);
    setIsFormOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      // Auto-generate slug for new category
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(autoSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        color,
        icon,
        isFeatured,
        order: Number(order) || 0,
      };

      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingId ? 'Category updated!' : 'Category created successfully!');
        setIsFormOpen(false);
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to save category');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${catName}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Category deleted');
        setCategories((prev) => prev.filter((c) => c._id !== id));
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiLayers className="text-blue-500" />
            <span>Category Management</span>
          </h2>
          <p className="text-sm text-text-muted">
            Create, edit and organise post categories across web & mobile apps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh categories"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            <FiPlus />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Form Drawer / Modal */}
      {isFormOpen && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white text-base">
              {editingId ? '✏️ Edit Category' : '✨ Create New Category'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder="e.g. Champions League"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="e.g. champions-league"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of articles in this topic..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Theme Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Badge Color Accent
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-125 border-white shadow-md shadow-white/20' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                title="Custom color"
              />
              <span className="text-xs font-mono text-slate-400 ml-2">{color}</span>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFeaturedCat"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-white/10 border-white/20"
            />
            <label htmlFor="isFeaturedCat" className="text-sm font-semibold text-slate-200 cursor-pointer">
              Pin as Featured / Navigation Pill
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <FiCheck />
              <span>{saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid/Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          <FiRefreshCw className="animate-spin inline-block mr-2" />
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          No categories found. Click "New Category" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.05] transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#3B82F6' }}
                    />
                    <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                      {cat.name}
                    </h4>
                  </div>
                  {cat.isFeatured && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Featured
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-400 mb-2">
                  slug: <span className="text-slate-200">/{cat.slug}</span>
                </div>

                {cat.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-500">
                <span>Order: #{cat.order ?? 0}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Edit category"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    disabled={deletingId === cat._id}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete category"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

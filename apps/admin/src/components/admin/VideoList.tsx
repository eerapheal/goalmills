'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FiVideo,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiSearch,
  FiRefreshCw,
  FiClock,
  FiEye,
  FiX,
  FiCheck,
  FiPlay,
} from 'react-icons/fi';
import { useToast } from '../Toast';
import { getHighlightThumbnail } from '@/lib/videoUtils';

export interface VideoItem {
  _id: string;
  video_title: string;
  video_url: string;
  video_thumbnail?: string;
  video_description?: string;
  category?: string;
  source?: string;
  event_key?: string;
  league?: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface VideoListProps {
  refreshTrigger?: number;
}

const CATEGORIES = [
  'All',
  'Highlights',
  'Football',
  'Premier League',
  'Champions League',
  'La Liga',
  'Basketball',
  'Cricket',
  'Interviews',
  'Behind the Scenes',
];

export default function VideoList({ refreshTrigger = 0 }: VideoListProps) {
  const toast = useToast();
  const { data: session } = useSession();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editForm, setEditForm] = useState({
    video_title: '',
    video_url: '',
    video_thumbnail: '',
    category: '',
    source: '',
    event_key: '',
    league: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/videos?limit=100');
      if (res.ok) {
        const data = await res.json();
        setVideos(Array.isArray(data) ? data : []);
      } else {
        toast.error('Failed to load video highlights');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      toast.error('Network error loading videos');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos, refreshTrigger]);

  // Handle Delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        toast.success('Video highlight deleted');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete video');
      }
    } catch (err) {
      toast.error('Network error deleting video');
    } finally {
      setDeletingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (video: VideoItem) => {
    setEditingVideo(video);
    setEditForm({
      video_title: video.video_title || '',
      video_url: video.video_url || '',
      video_thumbnail: video.video_thumbnail || '',
      category: video.category || 'Highlights',
      source: video.source || '',
      event_key: video.event_key || '',
      league: video.league || '',
    });
  };

  // Handle Image Upload for Edit
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditForm((prev) => ({ ...prev, video_thumbnail: data.url }));
        toast.success('Thumbnail uploaded!');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (err) {
      toast.error('Network error during upload');
    } finally {
      setUploadingThumb(false);
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    if (!editForm.video_title.trim() || !editForm.video_url.trim()) {
      toast.error('Title and Video URL are required');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/videos/${editingVideo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setVideos((prev) =>
          prev.map((v) => (v._id === editingVideo._id ? { ...v, ...updated } : v))
        );
        toast.success('Video updated successfully!');
        setEditingVideo(null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update video');
      }
    } catch (err) {
      toast.error('Network error updating video');
    } finally {
      setSavingEdit(false);
    }
  };

  // Filtered list
  const filteredVideos = videos.filter((video) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (video.category && video.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesSearch =
      !searchQuery.trim() ||
      video.video_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.league?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.event_key?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const canManage = session?.user?.role === 'super-admin' || session?.user?.role === 'staff';

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiVideo className="text-amber-400" />
            <span>Manage Published Videos</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {filteredVideos.length} / {videos.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, edit, preview, or delete published match replays & highlights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, league..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <FiX size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchVideos}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-xl h-20 w-full" />
          ))}
        </div>
      )}

      {/* Videos List Grid / Stack */}
      {!loading && (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredVideos.map((item) => {
            const thumbUrl = getHighlightThumbnail(item.video_url, item.video_thumbnail);
            const isDeleting = deletingId === item._id;

            return (
              <div
                key={item._id}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all"
              >
                {/* Left: Thumbnail & Meta */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Thumbnail with overlay */}
                  <div className="relative w-24 h-16 sm:w-28 sm:h-18 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-white/10">
                    <img
                      src={thumbUrl}
                      alt={item.video_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs">
                        <FiPlay size={10} className="ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 truncate">
                        {item.category || 'Highlights'}
                      </span>
                      {item.source && (
                        <span className="text-[10px] text-slate-400 truncate">• {item.source}</span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
                      {item.video_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      {item.createdAt && (
                        <span className="flex items-center gap-1">
                          <FiClock size={11} />
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      {typeof item.views === 'number' && (
                        <span className="flex items-center gap-1">
                          <FiEye size={11} />
                          {item.views.toLocaleString()} views
                        </span>
                      )}
                      {item.event_key && (
                        <span className="text-slate-500 font-mono text-[10px]">
                          Key: {item.event_key}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={`/highlights/${item._id}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1 transition-colors"
                    title="View Video Page"
                  >
                    <FiExternalLink size={13} />
                    <span className="hidden sm:inline">View</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    disabled={!canManage}
                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                    title="Edit Highlight"
                  >
                    <FiEdit2 size={13} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id, item.video_title)}
                    disabled={!canManage || isDeleting}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                    title="Delete Highlight"
                  >
                    <FiTrash2 size={13} />
                    <span className="hidden sm:inline">{isDeleting ? '...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredVideos.length === 0 && (
            <div className="text-center py-12 space-y-2 bg-white/[0.02] border border-white/5 rounded-2xl">
              <FiVideo className="mx-auto text-slate-600 text-3xl" />
              <p className="text-sm font-bold text-slate-400">No video highlights found</p>
              <p className="text-xs text-slate-500">
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try clearing your search or filter'
                  : 'Upload your first video highlight above'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ----------------- Edit Video Modal ----------------- */}
      {editingVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D1524] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiEdit2 className="text-amber-400" />
                <span>Edit Video Highlight</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={editForm.video_title}
                  onChange={(e) => setEditForm({ ...editForm, video_title: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Video URL (YouTube / MP4) *
                </label>
                <input
                  type="url"
                  value={editForm.video_url}
                  onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    placeholder="e.g. Premier League, Highlights"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Source / Creator
                  </label>
                  <input
                    type="text"
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    placeholder="e.g. Sky Sports, YouTube"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Thumbnail URL
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={editForm.video_thumbnail}
                    onChange={(e) => setEditForm({ ...editForm, video_thumbnail: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer"
                    />
                    {uploadingThumb && (
                      <span className="text-xs text-amber-400 animate-pulse">Uploading...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Event Key (Optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.event_key}
                    onChange={(e) => setEditForm({ ...editForm, event_key: e.target.value })}
                    placeholder="e.g. match_123"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">
                    League / Tag
                  </label>
                  <input
                    type="text"
                    value={editForm.league}
                    onChange={(e) => setEditForm({ ...editForm, league: e.target.value })}
                    placeholder="e.g. EPL, UCL"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || uploadingThumb}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
                >
                  <FiCheck size={14} />
                  <span>{savingEdit ? 'Saving...' : 'Update Highlight'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

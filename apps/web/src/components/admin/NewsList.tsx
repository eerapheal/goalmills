'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '../Toast';
import type { UserRole } from '@goalmills/types';
import { hasPermission, canEditArticle } from '@/lib/rbac';

interface NewsArticle {
  _id: string;
  title: string;
  author: string;
  authorId?: string;
  createdAt: string;
  category: string;
  status?: 'draft' | 'pending_approval' | 'published';
}

export default function NewsList() {
  const toast = useToast();
  const { data: session } = useSession();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user?.role as UserRole) || undefined;
  const canApprove = hasPermission(userRole, 'articles:approve');
  const canDeleteAny = hasPermission(userRole, 'articles:delete');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news?admin=true');
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      if (res.ok) {
        setNews(news.map((n) => (n._id === id ? { ...n, status: 'published' } : n)));
        toast.success('Article approved and published live!');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error approving article');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNews(news.filter((n) => n._id !== id));
        toast.success('Article deleted successfully');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error deleting article');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  if (loading) return <div className="text-white">Loading news list...</div>;

  return (
    <div className="glass-card p-6 rounded-2xl h-fit">
      <h2 className="text-xl font-bold text-white mb-4 flex flex-wrap items-center gap-2">
        <span>📰</span>
        <span className="break-words">Manage News Articles</span>
      </h2>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {news.map((item) => {
          const canEdit = canEditArticle(session?.user, item.authorId);
          const isAuthor = item.authorId === (session?.user as any)?.id;
          const canDelete = canDeleteAny || (isAuthor && item.status !== 'published');
          const isPending = item.status === 'pending_approval';

          return (
            <div
              key={item._id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold break-words">{item.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      item.status === 'pending_approval'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : item.status === 'draft'
                          ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.status === 'pending_approval'
                      ? '⏳ Pending Approval'
                      : item.status === 'draft'
                        ? '📝 Draft'
                        : '✅ Published'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-muted uppercase font-black">
                  <span className="break-all">By {item.author}</span>
                  {item.category && <span className="text-blue-400">{item.category}</span>}
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPending && canApprove && (
                  <button
                    onClick={() => handleApprove(item._id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                  >
                    Approve
                  </button>
                )}
                <Link
                  href={canEdit ? `/admin/news/${item._id}/edit` : `#`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    canEdit
                      ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20'
                      : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  }`}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={!canDelete}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    canDelete
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                      : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {news.length === 0 && (
          <p className="text-text-muted text-center py-8">No news articles found.</p>
        )}
      </div>
    </div>
  );
}

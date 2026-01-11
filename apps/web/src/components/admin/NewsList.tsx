'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface NewsArticle {
    _id: string;
    title: string;
    author: string;
    authorId?: string;
    createdAt: string;
    category: string;
}

export default function NewsList() {
    const { data: session } = useSession();
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setNews(news.filter(n => n._id !== id));
            } else {
                const data = await res.json();
                alert(data.message || 'Error deleting article');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    if (loading) return <div className="text-white">Loading news list...</div>;

    return (
        <div className="glass-card p-6 rounded-2xl h-fit">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📰</span> Manage News Articles
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {news.map((item) => {
                    const canEdit = session?.user?.role === 'super-admin' || item.authorId === (session?.user as any)?.id;
                    return (
                        <div key={item._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold truncate">{item.title}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-muted uppercase font-black">
                                    <span>By {item.author}</span>
                                    {item.category && <span className="text-blue-400">{item.category}</span>}
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={canEdit ? `/admin/news/${item._id}/edit` : `#`}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${canEdit
                                        ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20'
                                        : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                        }`}
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    disabled={!canEdit}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${canEdit
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
                {news.length === 0 && <p className="text-text-muted text-center py-8">No news articles found.</p>}
            </div>
        </div>
    );
}

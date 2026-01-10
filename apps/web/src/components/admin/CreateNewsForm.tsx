'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function CreateNewsForm() {
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

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
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'News article created successfully!' });
                setTitle('');
                setExcerpt('');
                setContent('');
                setImage('');
            } else {
                setMessage({ type: 'error', text: 'Failed to create news article.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📰</span> Create News Article
            </h2>

            {message && (
                <div className={`p-4 rounded-lg mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/50' : 'bg-red-500/20 text-red-300 border border-red-500/50'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                        placeholder="Article Title"
                    />
                </div>

                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Excerpt</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        required
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                        placeholder="Brief summary..."
                    />
                </div>

                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Image URL</label>
                    <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Content</label>
                    <div className="bg-white/90 rounded-lg text-black overflow-hidden min-h-[200px]">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            style={{ height: '200px', marginBottom: '40px' }}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider py-3 rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-secondary/20 disabled:opacity-50"
                    >
                        {loading ? 'Publishing...' : 'Publish Article'}
                    </button>
                </div>
            </form>
        </div>
    );
}

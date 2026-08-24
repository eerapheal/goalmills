'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '../Toast';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function CreateNewsForm() {
    const toast = useToast();
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [source, setSource] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [uploading, setUploading] = useState(false);

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
                    source,
                    category,
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'News article created successfully!' });
                setTitle('');
                setExcerpt('');
                setContent('');
                setImage('');
                setSource('');
                setCategory('');
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
        <div className="glass-card p-6 rounded-2xl h-fit">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📰</span> Create News Article
            </h2>

            {message && (
                <div className={`p-4 rounded-lg mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/50' : 'bg-red-500/20 text-red-300 border border-red-500/50'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Source</label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="e.g. ESPN, BBC"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Category</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                        placeholder="e.g. Premier League, Transfer News"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Image URL</label>
                        <input
                            type="url"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Or Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 transition-all cursor-pointer"
                        />
                    </div>
                </div>
                {uploading && <div className="text-xs text-blue-400 animate-pulse">Uploading image...</div>}

                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Content</label>
                    <div className="bg-white/90 rounded-lg text-black overflow-hidden min-h-[300px]">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            style={{ height: '250px', marginBottom: '40px' }}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider py-3 rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-secondary/20 disabled:opacity-50"
                    >
                        {loading ? 'Publishing...' : 'Publish Article'}
                    </button>
                </div>
            </form>
        </div>
    );
}

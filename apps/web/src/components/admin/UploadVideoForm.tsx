'use client';

import { useState } from 'react';

export default function UploadVideoForm() {
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [eventKey, setEventKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_title: title,
                    video_url: videoUrl,
                    video_thumbnail: thumbnail,
                    event_key: eventKey,
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Video uploaded successfully!' });
                setTitle('');
                setVideoUrl('');
                setThumbnail('');
                setEventKey('');
            } else {
                setMessage({ type: 'error', text: 'Failed to upload video.' });
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
                <span>🎥</span> Upload Highlight Video
            </h2>

            {message && (
                <div className={`p-4 rounded-lg mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/50' : 'bg-red-500/20 text-red-300 border border-red-500/50'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Video Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                        placeholder="e.g. Man City vs Arsenal Highlights"
                    />
                </div>

                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Video URL (MP4/Youtube)</label>
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                        placeholder="https://..."
                    />
                </div>

                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Thumbnail URL</label>
                    <input
                        type="url"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                        placeholder="https://..."
                    />
                </div>

                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Match Event Key (Optional)</label>
                    <input
                        type="text"
                        value={eventKey}
                        onChange={(e) => setEventKey(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                        placeholder="e.g. 12345"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider py-3 rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-secondary/20 disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Save Video'}
                    </button>
                </div>
            </form>
        </div>
    );
}

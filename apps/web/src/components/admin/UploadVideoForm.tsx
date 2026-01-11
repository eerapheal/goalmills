'use client';

import { useState } from 'react';

export default function UploadVideoForm() {
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [eventKey, setEventKey] = useState('');
    const [source, setSource] = useState('');
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
                setThumbnail(data.url);
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            alert('An error occurred during upload');
        } finally {
            setUploading(false);
        }
    };

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
                    source,
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Video uploaded successfully!' });
                setTitle('');
                setVideoUrl('');
                setThumbnail('');
                setEventKey('');
                setSource('');
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
        <div className="glass-card p-6 rounded-2xl h-fit">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎥</span> Upload Highlight Video
            </h2>

            {message && (
                <div className={`p-4 rounded-lg mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/50' : 'bg-red-500/20 text-red-300 border border-red-500/50'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Video Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="e.g. Man City vs Arsenal"
                        />
                    </div>
                    <div>
                        <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Source</label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="e.g. YouTube, SuperSport"
                        />
                    </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
                        <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Or Upload Thumbnail</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 transition-all cursor-pointer"
                        />
                    </div>
                </div>
                {uploading && <div className="text-xs text-blue-400 animate-pulse">Uploading thumbnail...</div>}

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
                        disabled={loading || uploading}
                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-wider py-3 rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-secondary/20 disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Save Video'}
                    </button>
                </div>
            </form>
        </div>
    );
}

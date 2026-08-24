'use client';

import { useState } from 'react';
import { useToast } from '../Toast';

export default function UploadVideoForm() {
    const toast = useToast();
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [eventKey, setEventKey] = useState('');
    const [source, setSource] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    const fetchVideoDetails = async (urlToFetch?: string) => {
        const url = urlToFetch || videoUrl;
        if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) return;

        setFetchingDetails(true);
        try {
            const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
            if (res.ok) {
                const data = await res.json();

                // Only set if current values are empty to avoid overwriting user input
                if (!title) setTitle(data.title);
                if (!source) setSource(data.author_name);

                // YouTube thumbnails from oembed are sometimes low res, try to get hq if possible
                let thumbUrl = data.thumbnail_url;
                const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/);
                if (videoIdMatch && videoIdMatch[1]) {
                    thumbUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
                }

                if (!thumbnail) setThumbnail(thumbUrl);

                if (!category) {
                    const lowerTitle = (data.title || '').toLowerCase();
                    if (lowerTitle.includes('highlight') || lowerTitle.includes('match') || lowerTitle.includes('vs')) {
                        setCategory('Highlights');
                    } else if (lowerTitle.includes('interview') || lowerTitle.includes('talk') || lowerTitle.includes('press')) {
                        setCategory('Interviews');
                    } else if (lowerTitle.includes('training') || lowerTitle.includes('behind')) {
                        setCategory('Behind the Scenes');
                    } else {
                        setCategory('Highlights');
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching video details:', error);
        } finally {
            setFetchingDetails(false);
        }
    };

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
                toast.success('Thumbnail uploaded successfully');
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
                    category,
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Video uploaded successfully!' });
                setTitle('');
                setVideoUrl('');
                setThumbnail('');
                setEventKey('');
                setSource('');
                setCategory('');
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
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Category</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                        placeholder="e.g. Highlights, Interviews, Match Analysis"
                    />
                </div>

                <div>
                    <label className="block text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Video URL (MP4/Youtube)</label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => {
                                const newUrl = e.target.value;
                                setVideoUrl(newUrl);
                                // Auto-fetch if it looks like a full YouTube URL
                                if ((newUrl.includes('youtube.com/watch?v=') && newUrl.length > 30) ||
                                    (newUrl.includes('youtu.be/') && newUrl.length > 20)) {
                                    fetchVideoDetails(newUrl);
                                }
                            }}
                            required
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors"
                            placeholder="https://..."
                        />
                        <button
                            type="button"
                            onClick={() => fetchVideoDetails()}
                            disabled={fetchingDetails || !videoUrl}
                            className="px-4 py-2 bg-secondary/20 text-secondary border border-secondary/50 rounded-lg text-sm font-bold hover:bg-secondary/30 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {fetchingDetails ? (
                                <span className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></span>
                            ) : '✨ Auto-fill'}
                        </button>
                    </div>
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

                {thumbnail && (
                    <div className="mt-2 relative group rounded-lg overflow-hidden border border-white/10 aspect-video w-full max-w-xs">
                        <img
                            src={thumbnail}
                            alt="Thumbnail Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => setThumbnail('')}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

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

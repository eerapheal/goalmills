'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

interface ReactPlayerProps {
    url: string;
    width?: string | number;
    height?: string | number;
    controls?: boolean;
    playing?: boolean;
    light?: boolean | string;
    playIcon?: React.ReactNode;
    config?: {
        youtube?: {
            playerVars?: any;
        };
        [key: string]: any;
    };
    [key: string]: any;
}

// Dynamic import of ReactPlayer to avoid SSR issues (hydration mismatch)
const ReactPlayer = dynamic(() => import('react-player').then(mod => mod.default || (mod as any).default || mod), {
    ssr: false,
    loading: () => <div className="aspect-video w-full bg-slate-900 rounded-3xl animate-pulse flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Player...</div>
});

interface VideoPlayerProps {
    url: string;
    thumbnail?: string;
    autoPlay?: boolean;
    className?: string;
}

export default function VideoPlayer({ url, thumbnail, autoPlay = false, className }: VideoPlayerProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return <div className={`aspect-video w-full bg-slate-900 rounded-3xl animate-pulse ${className || ''}`} />;

    if (!url) {
        return (
            <div className={`aspect-video w-full bg-slate-900 rounded-3xl flex flex-col items-center justify-center p-6 text-center ${className || ''}`}>
                <p className="text-slate-400 text-sm font-bold">Video URL Missing</p>
            </div>
        );
    }

    // Direct YouTube Embed Logic for maximum reliability
    const getYTId = (link: string) => {
        try {
            if (link.includes('youtube.com/embed/')) return link.split('embed/')[1].split('?')[0];
            if (link.includes('youtube.com/watch')) return link.split('v=')[1].split('&')[0];
            if (link.includes('youtu.be/')) return link.split('/').pop()?.split('?')[0];
        } catch (e) { return null; }
        return null;
    };

    const ytId = getYTId(url);

    if (ytId) {
        return (
            <div className={`w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative group ${className || 'aspect-video'}`}>
                <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}&modestbranding=1&rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
                <div className="absolute top-6 left-6 pointer-events-none">
                    <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1.5 uppercase tracking-tighter">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        HD Highlight
                    </div>
                </div>
            </div>
        );
    }

    // Fallback to ReactPlayer for other types
    return (
        <div className={`w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative group ${className || 'aspect-video'}`}>
            <ReactPlayer
                url={url}
                width="100%"
                height="100%"
                controls={true}
                playing={autoPlay}
                light={thumbnail}
                playIcon={
                    <button className="bg-blue-600 text-white rounded-full p-6 transition-transform hover:scale-110 shadow-2xl">
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                }
            />
        </div>
    );
}

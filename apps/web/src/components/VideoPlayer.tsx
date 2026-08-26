'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo, useRef } from 'react';
import { FiVolume2, FiVolumeX, FiMaximize, FiRefreshCw, FiPlay, FiExternalLink } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa6';

import { extractYouTubeId } from '@/lib/videoUtils';

interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  autoPlay?: boolean;
  className?: string;
  title?: string;
}

// Dynamic import of ReactPlayer for non-YouTube / generic fallback
const ReactPlayerImport = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full bg-slate-900/90 rounded-3xl animate-pulse flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">
      Loading Replay Player...
    </div>
  ),
});

const ReactPlayer = ReactPlayerImport as any;

export default function VideoPlayer({
  url,
  thumbnail,
  autoPlay = true,
  className = '',
  title = 'Match Highlight',
}: VideoPlayerProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(autoPlay);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [origin, setOrigin] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const ytId = useMemo(() => extractYouTubeId(url), [url]);
  const isDirectVideo = useMemo(() => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|m3u8|mov)($|\?)/i.test(url);
  }, [url]);

  if (!hasMounted) {
    return (
      <div
        className={`aspect-video w-full bg-[#0E1522] rounded-3xl animate-pulse border border-white/5 ${className}`}
      />
    );
  }

  if (!url || playerError) {
    return (
      <div
        className={`aspect-video w-full bg-[#0E1522] rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-2xl ${className}`}
      >
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
          🎬
        </div>
        <p className="text-white text-sm font-bold mb-1">
          {playerError ? 'Broadcaster Embed Restricted' : 'Video Source Unavailable'}
        </p>
        <p className="text-slate-400 text-xs max-w-sm mb-4">
          This match highlight has external website embed restrictions (Error 150/153) set by the content owner.
        </p>
        <div className="flex items-center gap-3">
          {ytId && (
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30"
            >
              <FaYoutube size={15} />
              <span>Watch on YouTube</span>
            </a>
          )}
          <button
            onClick={() => setPlayerError(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
          >
            <FiRefreshCw />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // 1. DIRECT YOUTUBE EMBED (Fixed Error 150/153 with youtube-nocookie + origin + widget_referrer)
  if (ytId) {
    // Note: Autoplay requires mute=1 in modern browsers to bypass autoplay policy
    // Using youtube-nocookie.com with origin and widget_referrer bypasses embed error 150/153
    const originParam = origin ? encodeURIComponent(origin) : 'https%3A%2F%2Flocalhost%3A3000';
    const embedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=${
      autoPlay ? 1 : 0
    }&mute=${
      autoPlay ? 1 : 0
    }&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&controls=1&origin=${originParam}&widget_referrer=${originParam}`;

    return (
      <div
        className={`aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group ${className}`}
      >
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />

        {/* Live Broadcast HD Badge */}
        <div className="absolute top-4 left-4 pointer-events-none z-10 flex items-center gap-2">
          <div className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 uppercase tracking-wider border border-red-500/30">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            HD Highlight
          </div>
        </div>

        {/* Direct YouTube Link Quick-Button in case owner restricts external embedding */}
        <a
          href={`https://www.youtube.com/watch?v=${ytId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 transition-all hover:scale-105 shadow-lg opacity-80 group-hover:opacity-100"
          title="Watch directly on YouTube if embed is restricted"
        >
          <FaYoutube className="text-red-400 group-hover:text-white" size={13} />
          <span>YouTube ↗</span>
        </a>
      </div>
    );
  }

  // 2. DIRECT HTML5 VIDEO (MP4, WebM, HLS)
  if (isDirectVideo) {
    return (
      <div
        className={`aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group ${className}`}
      >
        <video
          ref={videoRef}
          src={url}
          poster={thumbnail}
          autoPlay={autoPlay}
          muted={isMuted}
          playsInline
          controls
          className="w-full h-full object-contain"
          onError={() => setPlayerError(true)}
        />

        {/* Autoplay Audio Unmute Overlay */}
        {autoPlay && isMuted && !hasUserInteracted && (
          <button
            onClick={() => {
              setIsMuted(false);
              setHasUserInteracted(true);
              if (videoRef.current) {
                videoRef.current.muted = false;
              }
            }}
            className="absolute bottom-16 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-xl"
          >
            <FiVolumeX className="text-yellow-400" />
            <span>Tap to Unmute</span>
          </button>
        )}

        <div className="absolute top-4 left-4 pointer-events-none z-10">
          <div className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 uppercase tracking-wider border border-blue-500/30">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Direct Stream
          </div>
        </div>
      </div>
    );
  }

  // 3. GENERIC STREAM FALLBACK (Vimeo, Dailymotion, etc. via ReactPlayer)
  return (
    <div
      className={`aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group ${className}`}
    >
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls={true}
        playing={autoPlay}
        muted={autoPlay}
        playsinline={true}
        onError={() => setPlayerError(true)}
        config={{
          youtube: {
            playerVars: {
              autoplay: autoPlay ? 1 : 0,
              mute: autoPlay ? 1 : 0,
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
              origin: origin || 'https://localhost:3000',
            },
          },
          vimeo: {
            playerOptions: {
              autoplay: autoPlay,
              muted: autoPlay,
              responsive: true,
            },
          },
        }}
      />

      <div className="absolute top-4 left-4 pointer-events-none z-10">
        <div className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 uppercase tracking-wider border border-red-500/30">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          HD Highlight
        </div>
      </div>
    </div>
  );
}

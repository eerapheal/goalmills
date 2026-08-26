'use client';

import { useEffect, useState } from 'react';
import { FiShare2, FiBookmark, FiCheck, FiCopy, FiExternalLink } from 'react-icons/fi';
import { FaXTwitter, FaFacebookF, FaWhatsapp } from 'react-icons/fa6';

interface HighlightViewTrackerProps {
  id: string;
  title: string;
  url: string;
}

export default function HighlightViewTracker({ id, title, url }: HighlightViewTrackerProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    // Increment view count on mount
    if (id) {
      fetch(`/api/videos/${id}/view`, { method: 'POST' }).catch((err) =>
        console.error('Error tracking video view:', err)
      );
    }

    // Check local storage for bookmark status
    try {
      const saved = localStorage.getItem('gm_bookmarked_videos');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.includes(id)) {
          setBookmarked(true);
        }
      }
    } catch (e) {}
  }, [id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleToggleBookmark = () => {
    try {
      const saved = localStorage.getItem('gm_bookmarked_videos');
      let list = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];

      if (bookmarked) {
        list = list.filter((vId: string) => vId !== id);
        setBookmarked(false);
      } else {
        list.push(id);
        setBookmarked(true);
      }
      localStorage.setItem('gm_bookmarked_videos', JSON.stringify(list));
    } catch (e) {}
  };

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold mr-1">Share Replay:</span>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-8 rounded-lg bg-white/5 hover:bg-black text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105"
          title="Share to X"
        >
          <FaXTwitter size={14} />
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-8 rounded-lg bg-white/5 hover:bg-blue-700 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105"
          title="Share to Facebook"
        >
          <FaFacebookF size={14} />
        </a>

        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-8 rounded-lg bg-white/5 hover:bg-emerald-600 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105"
          title="Share to WhatsApp"
        >
          <FaWhatsapp size={14} />
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="h-8 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 text-xs font-semibold transition-all"
          title="Copy Link"
        >
          {copied ? (
            <>
              <FiCheck className="text-emerald-400" size={14} />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Bookmark Action */}
      <button
        onClick={handleToggleBookmark}
        className={`h-8 px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
          bookmarked
            ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
            : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
        }`}
      >
        <FiBookmark size={14} className={bookmarked ? 'fill-current' : ''} />
        <span>{bookmarked ? 'Saved to Library' : 'Save Highlight'}</span>
      </button>
    </div>
  );
}

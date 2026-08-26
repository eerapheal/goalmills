'use client';

import { useEffect, useState } from 'react';
import { trackArticleView } from '@/lib/newsUtils';
import { FiShare2, FiBookmark, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Link from 'next/link';

interface ArticleTrackerAndActionsProps {
  article: {
    _id: string;
    title: string;
    excerpt?: string;
    image?: string;
    category?: string;
    views?: number;
  };
}

export default function ArticleTrackerAndActions({ article }: ArticleTrackerAndActionsProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Track in LocalStorage
    trackArticleView(article);

    // 2. Increment view counter on backend
    if (article._id) {
      fetch(`/api/news/${article._id}/view`, { method: 'POST' }).catch((err) =>
        console.error('Error tracking view:', err)
      );
    }

    // 3. Check if bookmarked
    try {
      const saved = localStorage.getItem('goalmills_bookmarked_news');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.includes(article._id)) {
          setBookmarked(true);
        }
      }
    } catch {}

    // 4. Scroll progress listener
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const toggleBookmark = () => {
    try {
      const saved = localStorage.getItem('goalmills_bookmarked_news');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (bookmarked) {
        list = list.filter((id) => id !== article._id);
        setBookmarked(false);
      } else {
        list.push(article._id);
        setBookmarked(true);
      }
      localStorage.setItem('goalmills_bookmarked_news', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Mobile Sticky Floating Quick-Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-2xl">
        <Link
          href="/news"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
        >
          <FiArrowLeft size={16} />
          <span>Feed</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl transition-colors ${
              bookmarked
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-white/5 text-slate-300 hover:text-white'
            }`}
            title="Bookmark story"
          >
            <FiBookmark size={16} className={bookmarked ? 'fill-current' : ''} />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
          >
            {copied ? <FiCheck size={14} /> : <FiShare2 size={14} />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>
    </>
  );
}

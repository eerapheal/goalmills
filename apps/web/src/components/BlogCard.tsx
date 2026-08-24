'use client';

import React from 'react';
import { BlogPost } from '@goalmills/types';
import Link from 'next/link';

interface BlogCardProps {
  post: BlogPost;
  onPress?: () => void;
}

export function BlogCard({ post, onPress }: BlogCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={onPress}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141C2B] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10"
    >
      {/* Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={post.image || 'https://picsum.photos/seed/blog/800/450'}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141C2B] via-transparent to-transparent opacity-60" />

        {post.category ? (
          <div className="absolute bottom-3 left-3">
            <span className="rounded-md border border-white/10 bg-blue-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm">
              {post.category}
            </span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center space-x-2 text-xs text-slate-400">
          <span>{formatDate(post.createdAt)}</span>
          <span>•</span>
          <span>{post.readTime || 3} min read</span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-blue-400">
          {post.title}
        </h3>

        {post.excerpt ? (
          <p className="mb-4 flex-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {post.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {post.author ? post.author.charAt(0).toUpperCase() : 'G'}
            </div>
            <span className="text-xs font-medium text-slate-400">By {post.author || 'GoalMills'}</span>
          </div>
          <span className="text-xs font-bold text-blue-400 transition-transform group-hover:translate-x-1">
            Read →
          </span>
        </div>
      </div>
    </div>
  );
}

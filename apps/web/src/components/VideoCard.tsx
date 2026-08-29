'use client';

import React from 'react';
import { VideoHighlight } from '@goalmills/types';
import { FiPlay, FiEye } from 'react-icons/fi';

interface VideoCardProps {
  video: VideoHighlight;
  onPress?: () => void;
}

export function VideoCard({ video, onPress }: VideoCardProps) {
  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views ? views.toString() : '0';
  };

  const leagueName = video.matchInfo?.league || video.league?.name;
  const dateStr = video.matchInfo?.date || video.date;

  return (
    <div
      onClick={onPress}
      className="group relative cursor-pointer rounded-2xl border border-blue-500/15 bg-[#0B172B]/80 hover:bg-[#0E203C] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-blue-900/20"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={video.thumbnail || 'https://picsum.photos/seed/vid/800/450'}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:from-amber-400 group-hover:to-orange-400 font-bold">
            <FiPlay className="ml-0.5 text-lg" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration ? (
          <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm border border-white/10 font-mono">
            {video.duration}
          </div>
        ) : null}

        {/* League Badge */}
        {leagueName ? (
          <div className="absolute top-2.5 left-2.5 rounded-full border border-amber-500/30 bg-slate-950/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-sm">
            {leagueName}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-bold text-white transition-colors group-hover:text-amber-300">
          {video.title}
        </h3>

        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 font-mono">
            <FiEye size={12} className="text-blue-400" />
            <span>{formatViews(video.views)} views</span>
          </div>
          {dateStr ? <div className="text-[11px] text-slate-400">{dateStr}</div> : null}
        </div>
      </div>
    </div>
  );
}

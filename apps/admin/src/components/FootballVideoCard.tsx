'use client';

import { FootballVideo } from '@goalmills/types';
import Image from 'next/image';
import { useState } from 'react';

interface FootballVideoCardProps {
  video: FootballVideo;
}

export function FootballVideoCard({ video }: FootballVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from URL (assuming YouTube embed link style as per mock data)
  // Mock URL: https://www.youtube.com/embed/4bTcYh_4Ykg?si=nyViewKNHgzUGF87
  const getVideoId = (url: string) => {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split('?')[0];
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${getVideoId(video.video_url || '')}/mqdefault.jpg`;

  return (
    <div className="glass-card rounded-xl overflow-hidden group">
      <div className="relative aspect-video bg-black">
        {isPlaying ? (
          <iframe
            src={`${video.video_url}&autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full relative cursor-pointer" onClick={() => setIsPlaying(true)}>
            <Image
              src={thumbnailUrl}
              alt={video.video_title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-secondary/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/50">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold line-clamp-1 mb-1">{video.video_title}</h3>
        <p className="text-text-muted text-xs line-clamp-2">{video.video_title_full}</p>
      </div>
    </div>
  );
}

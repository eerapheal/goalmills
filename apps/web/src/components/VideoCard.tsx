'use client';

import { VideoHighlight } from '@goalmills/types';
import Image from 'next/image';

interface VideoCardProps {
    video: VideoHighlight;
    onPress?: () => void;
}

export function VideoCard({ video, onPress }: VideoCardProps) {
    const formatViews = (views: number): string => {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`;
        }
        if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`;
        }
        return views.toString();
    };

    return (
        <div
            onClick={onPress}
            className="group glass-card rounded-xl overflow-hidden mb-4 cursor-pointer relative"
        >
            <div className="relative w-full aspect-video">
                <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center
                                  group-hover:scale-110 group-hover:bg-accent-red group-hover:border-accent-red/50 transition-all duration-300 shadow-xl">
                        <svg className="w-6 h-6 text-white ml-1 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                    <span className="text-xs font-bold text-white tracking-wide">{video.duration}</span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-base font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-primary-light transition-colors">
                        {video.title}
                    </h3>
                </div>

                {video.description && (
                    <p className="text-sm text-text-muted mb-3 line-clamp-1">{video.description}</p>
                )}

                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{formatViews(video.views)} views</span>
                    </div>

                    {video.teams.length > 0 && (
                        <span className="text-secondary font-semibold truncate ml-2 flex-1 text-right max-w-[50%]">
                            {video.teams.join(' vs ')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

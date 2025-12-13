'use client';

import { BlogPost } from '@goalmills/types';
import Image from 'next/image';

interface BlogCardProps {
    post: BlogPost;
    onPress?: () => void;
}

export function BlogCard({ post, onPress }: BlogCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div
            onClick={onPress}
            className="group glass-card rounded-xl overflow-hidden cursor-pointer h-full flex flex-col"
        >
            <div className="relative w-full h-48 overflow-hidden">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-60" />

                <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-secondary text-surface text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        {post.category}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 text-[11px] text-text-muted font-medium uppercase tracking-wide">
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="w-1 h-1 rounded-full bg-text-muted/50" />
                    <span>{post.readTime} min read</span>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-3 line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
                    {post.title}
                </h3>

                <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed flex-1">
                    {post.excerpt}
                </p>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surfaceHighlight flex items-center justify-center text-[10px] font-bold text-text-muted">
                            {post.author.charAt(0)}
                        </div>
                        <span className="text-xs text-text-muted font-medium">By {post.author}</span>
                    </div>

                    <span className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                        Read More →
                    </span>
                </div>
            </div>
        </div>
    );
}

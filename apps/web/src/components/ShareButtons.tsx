'use client';

import { FaXTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa6';
import { useState } from 'react';

interface ShareButtonsProps {
    url: string;
    title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const shareLinks = [
        {
            name: 'X',
            icon: FaXTwitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            color: 'hover:bg-black hover:text-white hover:border-black/50'
        },
        {
            name: 'Facebook',
            icon: FaFacebookF,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]/50'
        },
        {
            name: 'LinkedIn',
            icon: FaLinkedinIn,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            color: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]/50'
        }
    ];

    const handleShare = (shareUrl: string, name: string) => {
        window.open(shareUrl, `Share on ${name}`, 'width=600,height=400');
    };

    return (
        <div className="flex items-center gap-4">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest hidden md:block">Share this article</span>
            <div className="flex gap-2">
                {shareLinks.map((platform) => (
                    <button
                        key={platform.name}
                        onClick={() => handleShare(platform.url, platform.name)}
                        className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 text-slate-400 ${platform.color} hover:scale-110 active:scale-95`}
                        aria-label={`Share on ${platform.name}`}
                        title={`Share on ${platform.name}`}
                    >
                        <platform.icon className="w-4 h-4" />
                    </button>
                ))}
            </div>
        </div>
    );
}

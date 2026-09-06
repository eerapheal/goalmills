'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiUser } from 'react-icons/fi';

interface PlayerImageProps {
  src?: string | null;
  alt: string;
  flag?: string;
  size?: number;
  className?: string;
  priority?: boolean;
  rounded?: string;
}

export function PlayerImage({
  src,
  alt,
  flag,
  size = 64,
  className = '',
  priority = false,
  rounded = 'rounded-2xl',
}: PlayerImageProps) {
  const [hasError, setHasError] = useState(false);

  // Compute initials (e.g. "Victor Osimhen" -> "VO")
  const initials = alt
    ? alt
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')
    : 'GM';

  if (!src || hasError) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative ${rounded} bg-gradient-to-tr from-[#081326] via-[#0E203E] to-[#122A54] border border-blue-500/25 flex flex-col items-center justify-center shrink-0 shadow-inner select-none ${className}`}
        title={alt}
      >
        <span className="font-black text-xs sm:text-sm tracking-wider text-blue-300 font-mono">
          {initials}
        </span>
        {flag && (
          <span className="absolute -bottom-1 -right-1 text-[11px] leading-none bg-slate-950/80 rounded-full px-0.5 border border-white/10 shadow-sm">
            {flag}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 overflow-hidden ${rounded} bg-slate-900/60 border border-white/10 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        onError={() => setHasError(true)}
        unoptimized
      />
      {flag && (
        <span className="absolute bottom-1 right-1 text-[11px] leading-none bg-slate-950/90 rounded-full px-1 py-0.5 border border-white/10 shadow-md">
          {flag}
        </span>
      )}
    </div>
  );
}
